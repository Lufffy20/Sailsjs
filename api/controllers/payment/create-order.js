/**
 * Create Order Controller
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const stripe = require('stripe');

module.exports = {

    friendlyName: 'Create order',

    description: 'Process payment and create an order.',

    inputs: {
        itemId: {
            type: 'number',
            required: true,
            description: 'The ID of the item to purchase.'
        },
        token: {
            type: 'string',
            required: true,
            description: 'The Stripe Payment Method ID (pm_...) or Token (tok_...).'
        }
    },

    exits: {
        success: {
            description: 'Order created successfully.'
        },
        badRequest: {
            responseType: 'badRequest',
            description: 'Invalid request or payment failed.'
        },
        serverError: {
            responseType: 'serverError',
            description: 'Something went wrong.'
        }
    },

    fn: async function (inputs, exits) {

        try {
            // Initialize Stripe
            const stripeClient = stripe(sails.config.custom.stripeSecretKey);

            // Get authenticated user (assuming policies attach user to req.me or req.user)
            const user = this.req.me || this.req.user;

            if (!user) {
                return exits.badRequest({ message: 'User not authenticated.' });
            }

            // Check if user has a Stripe Customer ID
            if (!user.stripeCustomerId) {
                // Attempt to create one if missing
                const customer = await stripeClient.customers.create({
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`,
                    metadata: { userId: user.id }
                });

                await User.updateOne({ id: user.id }).set({ stripeCustomerId: customer.id });
                user.stripeCustomerId = customer.id;
            }

            // Find the item
            const item = await Item.findOne({ id: inputs.itemId });
            if (!item) {
                return exits.badRequest({ message: 'Item not found.' });
            }

            // Create PaymentIntent and confirm immediately
            const paymentIntent = await stripeClient.paymentIntents.create({
                amount: Math.round(item.price * 100), // Convert to cents
                currency: item.currency,
                customer: user.stripeCustomerId,
                payment_method: inputs.token,
                confirm: true,
                return_url: 'http://localhost:1337/payment/success', // Placeholder
                automatic_payment_methods: {
                    enabled: true,
                    allow_redirects: 'never'
                }
            });

            // Check payment status
            if (paymentIntent.status === 'succeeded') {
                // Create Order
                const newOrder = await Order.create({
                    user: user.id,
                    item: item,
                    stripePaymentId: paymentIntent.id,
                    amount: item.price,
                    currency: item.currency,
                    status: 'succeeded'
                }).fetch();

                return exits.success({
                    message: 'Payment successful',
                    order: newOrder
                });

            } else {
                return exits.badRequest({
                    message: `Payment failed or requires action. Status: ${paymentIntent.status}`,
                    paymentIntentId: paymentIntent.id
                });
            }

        } catch (err) {
            sails.log.error(err);
            return exits.serverError(err);
        }

    }

};
