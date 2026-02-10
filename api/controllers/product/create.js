/**
 * Create Product Action
 *
 * Purpose:
 * Creates a new product in the system.
 * - Accessible only to admin users
 * - Validates required product fields
 * - Ensures product slug is unique
 * - Saves product details to the database
 *
 * Flow:
 * 1. Accept product details as input
 * 2. Create new product record
 * 3. If slug already exists, return validation error
 * 4. Return success response with created product data
 */

module.exports = {

    // Action name (used internally by Sails)
    friendlyName: 'Create Product',

    // Short description of the action
    description: 'Create a new product (admin only)',

    // Expected input parameters
    inputs: {
        name: {
            type: 'string',
            required: true,
            maxLength: 200,
            description: 'Product name'
        },
        slug: {
            type: 'string',
            required: true,
            maxLength: 200,
            description: 'Unique product slug'
        },
        description: {
            type: 'string',
            description: 'Product description'
        },
        price: {
            type: 'number',
            required: true,
            min: 0,
            description: 'Product price'
        },
        category: {
            type: 'string',
            description: 'Product category'
        }
    },

    // Possible exit responses
    exits: {
        success: {
            responseType: 'ok'
        },
        badRequest: {
            responseType: 'badRequest'
        }
    },

    // Main logic
    fn: async function (inputs) {
        try {

            // Create new product
            const newProduct = await Product.create({
                name: inputs.name,
                slug: inputs.slug,
                description: inputs.description,
                price: inputs.price,
                category: inputs.category
            }).fetch();

            // Return success response
            return {
                message: 'Product created successfully',
                product: newProduct
            };

        } catch (error) {

            // Handle unique constraint error for slug
            if (error.code === 'E_UNIQUE') {
                throw { badRequest: 'Product slug already exists' };
            }

            // Throw unexpected errors
            throw error;
        }
    }
};
