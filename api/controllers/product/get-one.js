/**
 * Get One Product Action
 *
 * Purpose:
 * Retrieves a single product by its ID along with all associated variants.
 * - Fetches product details
 * - Populates related variants
 * - Returns not found error if product does not exist
 *
 * Flow:
 * 1. Accept product ID as input
 * 2. Find product by ID
 * 3. Populate product variants
 * 4. If product is not found, return notFound response
 * 5. Return product data
 */

module.exports = {

    // Action name (used internally by Sails)
    friendlyName: 'Get One Product',

    // Short description of the action
    description: 'Get a single product by ID with variants',

    // Expected input parameters
    inputs: {
        id: {
            type: 'number',
            required: true,
            description: 'Product ID'
        }
    },

    // Possible exit responses
    exits: {
        success: {
            responseType: 'ok'
        },
        notFound: {
            responseType: 'notFound'
        }
    },

    // Main logic
    fn: async function (inputs) {

        // Find product by ID and populate variants
        const product = await Product.findOne({ id: inputs.id }).populate('variants');

        // Handle product not found
        if (!product) {
            throw 'notFound';
        }

        // Return product data
        return {
            product: product
        };
    }
};
