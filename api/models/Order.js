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

        item: {
            type: 'json',
            required: true,
            description: 'Details of the purchased item (snapshot)'
        },

        stripePaymentId: {
            type: 'string',
            required: true,
            description: 'Stripe Payment Intent ID or Charge ID'
        },

        amount: {
            type: 'number',
            required: true,
            description: 'Amount paid'
        },

        currency: {
            type: 'string',
            required: true,
            description: 'Currency of the payment'
        },

        status: {
            type: 'string',
            isIn: ['pending', 'succeeded', 'failed'],
            defaultsTo: 'pending',
            description: 'Status of the order'
        }

    },

};
