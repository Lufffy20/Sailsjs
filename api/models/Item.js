/**
 * Item.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        name: {
            type: 'string',
            required: true,
            description: 'Name of the item'
        },

        description: {
            type: 'string',
            description: 'Description of the item'
        },

        price: {
            type: 'number',
            required: true,
            description: 'Price of the item'
        },

        currency: {
            type: 'string',
            defaultsTo: 'usd',
            description: 'Currency of the price'
        },

        imageUrl: {
            type: 'string',
            description: 'URL of the item image'
        }

    },

};
