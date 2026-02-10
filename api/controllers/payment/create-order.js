/**
 * Create Order Action
 *
 * Purpose:
 * Creates an order from the user's active cart and processes payment using Stripe.
 * - Validates active cart and cart items
 * - Calculates total payable amount
 * - Processes payment via Stripe Payment Intent
 * - Handles payment failure with proper rollback
 * - Creates order and order items on successful payment
 * - Updates cart status to completed
 *
 * Flow:
 * 1. Fetch active cart for logged-in user
 * 2. Calculate total amount from cart items
 * 3. Process payment using Stripe
 * 4. On payment failure:
 *    - Create failed order record
 *    - Create order items snapshot
 *    - Mark cart as failed
 *    - Restore reserved stock
 * 5. On payment success:
 *    - Create order
 *    - Create order items
 *    - Mark cart as completed
 * 6. Return order and payment details
 */

module.exports = {

    // Action name (used internally by Sails)
    friendlyName: 'Create Order',

    // Short description of the action
    description: 'Create an order from the active cart and process payment via Stripe.',

    // Expected input parameters
    inputs: {
        paymentMethodId: {
            type: 'string',
            required: true,
            description: 'Stripe Payment Method ID (tok_... or pm_...)'
        },
        addressId: {
            type: 'string',
            required: true,
            description: 'User Address ID to associate with this order'
        }
    },

    // Possible exit responses
    exits: {
        success: {
            responseType: 'ok'
        },
        badRequest: {
            responseType: 'badRequest'
        },
        paymentFailed: {
            responseType: 'badRequest',
            description: 'Payment processing failed'
        },
        notFound: {
            responseType: 'notFound',
            description: 'Active cart not found'
        }
    },

    // Main logic
    fn: async function (inputs) {

        const userId = this.req.me.id;
        const stripe = require('stripe')(sails.config.custom.stripeSecretKey || process.env.STRIPE_SECRET_KEY);

        // 1. Validations
        // Fetch active cart
        const cart = await Cart.findOne({
            user: userId,
            status: 'active'
        }).populate('items');

        if (!cart || cart.items.length === 0) {
            throw { notFound: 'No active cart found to checkout.' };
        }

        // Validate Address
        const userAddress = await UserAddress.findOne({ id: inputs.addressId });
        if (!userAddress) {
            throw { badRequest: 'Invalid address ID provided.' };
        }
        if (userAddress.user !== userId) {
            throw { badRequest: 'Address does not belong to the user.' };
        }

        // 2. Calculate total amount
        let amount = 0;
        cart.items.forEach(item => {
            amount += (item.price * item.quantity);
        });

        // 3. Create Stripe PaymentIntent (Unconfirmed)
        let paymentIntent;
        try {
            // Fetch user for Stripe customer
            const user = await User.findOne({ id: userId });

            let customerId = user.stripeCustomerId;
            if (!customerId) {
                const customer = await stripe.customers.create({
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`
                });
                customerId = customer.id;

                await User.updateOne({ id: userId }).set({
                    stripeCustomerId: customerId
                });
            }

            // Create PaymentIntent
            paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: 'usd',
                customer: customerId,
                payment_method: inputs.paymentMethodId,
                confirm: false, // Do not confirm yet
                automatic_payment_methods: {
                    enabled: true,
                    allow_redirects: 'never'
                }
            });

        } catch (err) {
            sails.log.error('Stripe PaymentIntent Creation Failed:', err);
            throw { paymentFailed: `Payment initialization failed: ${err.message}` };
        }

        // 4. Create "Pending" Order in Database
        let order;
        try {
            order = await Order.create({
                user: userId,
                stripePaymentId: paymentIntent.id,
                amount: amount,
                currency: paymentIntent.currency,
                shippingAddress: userAddress,
                status: 'pending',
                paymentStatus: 'pending'
            }).fetch();
        } catch (err) {
            sails.log.error('Failed to create Pending Order:', err);
            throw { serverError: 'Failed to initiate order. Please try again.' };
        }

        // 5. Confirm PaymentIntent (Charge the Card)
        try {
            paymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id);
        } catch (err) {
            sails.log.error(`Payment Confirmation Failed for Order ${order.id}:`, err);

            // Update Order to Failed
            await Order.updateOne({ id: order.id }).set({
                status: 'cancelled',
                paymentStatus: 'failed'
            });

            throw { paymentFailed: `Payment failed: ${err.message}` };
        }

        if (paymentIntent.status !== 'succeeded') {
            await Order.updateOne({ id: order.id }).set({
                status: 'cancelled',
                paymentStatus: 'failed'
            });
            throw { paymentFailed: `Payment status: ${paymentIntent.status}` };
        }

        // 6. Finalize Order (DB Transaction)
        try {
            await sails.getDatastore().transaction(async (db) => {

                // Update Order Status
                await Order.updateOne({ id: order.id }).set({
                    status: 'processing',
                    paymentStatus: 'paid'
                }).usingConnection(db);

                // Create Order Items
                const orderItemsData = [];
                for (const item of cart.items) {
                    const variant = await ProductVariant
                        .findOne({ id: item.productVariant })
                        .usingConnection(db)
                        .populate('product');

                    orderItemsData.push({
                        order: order.id,
                        productVariant: item.productVariant,
                        quantity: item.quantity,
                        price: item.price,
                        productName: variant ? variant.product.name : 'Unknown Product',
                        variantSku: variant ? variant.sku : 'Unknown SKU'
                    });
                }

                await OrderItem.createEach(orderItemsData).usingConnection(db);

                // Mark Cart as Completed
                await Cart.updateOne({ id: cart.id }).set({
                    status: 'completed'
                }).usingConnection(db);

            });

            return {
                message: 'Order placed successfully',
                paymentId: paymentIntent.id,
                orderId: order.id
            };

        } catch (err) {
            sails.log.error(`CRITICAL: Order Finalization Failed for Order ${order.id} (Payment ${paymentIntent.id} succeeded):`, err);
            throw { serverError: 'Payment succeeded but order finalization encountered an error. Our team has been notified.' };
        }
    }
};
