/**
 * Get Items Controller
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    friendlyName: 'Get items',

    description: 'Get a list of all available items.',

    inputs: {
        // No inputs required for fetching all items
    },

    exits: {
        success: {
            description: 'List of items retrieved successfully.'
        },
        serverError: {
            responseType: 'serverError',
            description: 'Something went wrong.'
        }
    },

    fn: async function (inputs, exits) {

        try {
            const items = await Item.find();
            return exits.success(items);

        } catch (err) {
            return exits.serverError(err);
        }

    }

};
