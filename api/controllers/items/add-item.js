/**
 * Add Item Controller
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    friendlyName: 'Add item',

    description: 'Add a new item to the system.',

    inputs: {
        name: {
            type: 'string',
            required: true,
            description: 'The name of the item.'
        },
        description: {
            type: 'string',
            description: 'The description of the item.'
        },
        price: {
            type: 'number',
            required: true,
            description: 'The price of the item.'
        },
        currency: {
            type: 'string',
            defaultsTo: 'usd',
            description: 'The currency of the item.'
        },
        imageUrl: {
            type: 'string',
            description: 'The URL of the item image.'
        }
    },

    exits: {
        success: {
            description: 'New item was created successfully.'
        },
        serverError: {
            responseType: 'serverError',
            description: 'Something went wrong.'
        }
    },

    fn: async function (inputs, exits) {

        try {
            const newItem = await Item.create({
                name: inputs.name,
                description: inputs.description,
                price: inputs.price,
                currency: inputs.currency,
                imageUrl: inputs.imageUrl
            }).fetch();

            return exits.success(newItem);

        } catch (err) {
            return exits.serverError(err);
        }

    }

};
