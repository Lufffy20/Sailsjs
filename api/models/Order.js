/**
 * Order.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        user: {
            model: 'user',
            required: true,
            description: 'The user who placed the order'
        },

        items: {
            collection: 'OrderItem',
            via: 'order'
        },

        stripePaymentId: {
            type: 'string',
            required: true,
            description: 'Stripe Payment Intent ID or Charge ID'
        },

        amount: {
            type: 'number',
            required: true,
            description: 'Total amount paid'
        },

        currency: {
            type: 'string',
            defaultsTo: 'usd',
            description: 'Currency of the payment'
        },

        // Address details (can be expanded)
        shippingAddress: {
            type: 'json',
            description: 'Snapshot of shipping address'
        },

        status: {
            type: 'string',
            isIn: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            defaultsTo: 'pending',
            description: 'Order fulfillment status'
        },

        paymentStatus: {
            type: 'string',
            isIn: ['pending', 'paid', 'failed'],
            defaultsTo: 'pending',
            description: 'Payment status'
        }

    },

};
