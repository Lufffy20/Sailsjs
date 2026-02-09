module.exports = {

    friendlyName: 'Create Stripe customer',


    description: 'Create a new customer in Stripe.',


    inputs: {

        email: {
            type: 'string',
            required: true,
            isEmail: true,
            description: 'The email address of the customer.'
        },

        name: {
            type: 'string',
            required: true,
            description: 'The full name of the customer.'
        }

    },


    exits: {

        success: {
            outputFriendlyName: 'Stripe customer',
            outputDescription: 'The newly created Stripe customer object.',
        },

    },


    fn: async function (inputs) {

        // Import the Stripe library
        const stripe = require('stripe')(sails.config.custom.stripeSecretKey);

        // Create a new customer in Stripe
        const customer = await stripe.customers.create({
            email: inputs.email,
            name: inputs.name,
        });

        // Return the new customer object
        return customer;

    }

};
