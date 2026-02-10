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
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        // 1. Fetch active cart
        const cart = await Cart.findOne({
            user: userId,
            status: 'active'
        }).populate('items');

        if (!cart || cart.items.length === 0) {
            throw { notFound: 'No active cart found to checkout.' };
        }

        // 2. Calculate total amount from cart items
        let amount = 0;
        cart.items.forEach(item => {
            amount += (item.price * item.quantity);
        });

        /**
         * Helper: Handle payment failure
         * - Creates failed order
         * - Stores order item snapshot
         * - Marks cart as failed
         * - Restores reserved stock
         */
        const handleFailure = async (errMessage, paymentIntentId = null, paymentCurrency = 'usd') => {

            // Create failed order
            const failedOrder = await Order.create({
                user: userId,
                stripePaymentId: paymentIntentId || 'failed_attempt',
                amount: amount,
                currency: paymentCurrency,
                status: 'cancelled',
                paymentStatus: 'failed'
            }).fetch();

            // Create order items snapshot
            const orderItemsData = [];
            for (const item of cart.items) {
                const variant = await ProductVariant
                    .findOne({ id: item.productVariant })
                    .populate('product');

                orderItemsData.push({
                    order: failedOrder.id,
                    productVariant: item.productVariant,
                    quantity: item.quantity,
                    price: item.price,
                    productName: variant ? variant.product.name : 'Unknown Product',
                    variantSku: variant ? variant.sku : 'Unknown SKU'
                });
            }

            await OrderItem.createEach(orderItemsData);

            // Mark cart as failed
            await Cart.updateOne({ id: cart.id }).set({
                status: 'failed'
            });

            // Restore reserved stock
            for (const item of cart.items) {
                const variant = await ProductVariant.findOne({ id: item.productVariant });
                if (variant) {
                    await ProductVariant.updateOne({ id: item.productVariant }).set({
                        quantity: variant.quantity + item.quantity
                    });
                }
            }

            throw { paymentFailed: `Payment failed: ${errMessage}` };
        };

        // 3. Process payment via Stripe
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

            // Create and confirm payment intent
            paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: 'usd',
                customer: customerId,
                payment_method: inputs.paymentMethodId,
                confirm: true,
                automatic_payment_methods: {
                    enabled: true,
                    allow_redirects: 'never'
                }
            });

        } catch (err) {
            sails.log.error('Stripe Payment Exception:', err);

            const piId =
                err.raw && err.raw.payment_intent
                    ? err.raw.payment_intent.id
                    : null;

            await handleFailure(err.message, piId);
        }

        // Verify payment status
        if (paymentIntent.status !== 'succeeded') {
            await handleFailure(
                `Payment status: ${paymentIntent.status}`,
                paymentIntent.id,
                paymentIntent.currency
            );
        }

        // 4. Create successful order
        const order = await Order.create({
            user: userId,
            stripePaymentId: paymentIntent.id,
            amount: amount,
            currency: paymentIntent.currency,
            status: 'processing',
            paymentStatus: 'paid'
        }).fetch();

        // 5. Create order items
        const orderItemsData = [];
        for (const item of cart.items) {
            const variant = await ProductVariant
                .findOne({ id: item.productVariant })
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

        await OrderItem.createEach(orderItemsData);

        // 6. Mark cart as completed
        await Cart.updateOne({ id: cart.id }).set({
            status: 'completed'
        });

        // Inventory was already deducted at add-to-cart time.
        // Marking cart as completed prevents stock restoration by cron.

        return {
            message: 'Order placed successfully',
            orderId: order.id,
            paymentId: paymentIntent.id
        };
    }
};
