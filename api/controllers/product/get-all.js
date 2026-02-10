/**
 * Get All Products Action
 *
 * Purpose:
 * Retrieves a paginated list of all products along with their variants.
 * - Supports pagination using page and limit
 * - Populates related product variants
 * - Returns pagination metadata for frontend usage
 *
 * Flow:
 * 1. Read page and limit inputs
 * 2. Calculate skip value for pagination
 * 3. Fetch products sorted by creation date
 * 4. Populate product variants
 * 5. Count total number of products
 * 6. Return product list with pagination metadata
 */

module.exports = {

    // Action name (used internally by Sails)
    friendlyName: 'Get All Products',

    // Short description of the action
    description: 'List all products with their variants',

    // Expected input parameters
    inputs: {
        page: {
            type: 'number',
            min: 1,
            defaultsTo: 1,
            description: 'Current page number'
        },
        limit: {
            type: 'number',
            min: 1,
            max: 100,
            defaultsTo: 20,
            description: 'Number of records per page'
        }
    },

    // Possible exit responses
    exits: {
        success: {
            responseType: 'ok'
        }
    },

    // Main logic
    fn: async function (inputs) {

        // Calculate offset for pagination
        const skip = (inputs.page - 1) * inputs.limit;

        // Fetch products with variants
        const products = await Product.find({
            limit: inputs.limit,
            skip: skip,
            sort: 'createdAt DESC'
        }).populate('variants');

        // Count total products
        const total = await Product.count();

        // Return response with pagination metadata
        return {
            products: products,
            meta: {
                page: inputs.page,
                limit: inputs.limit,
                total: total,
                totalPages: Math.ceil(total / inputs.limit)
            }
        };
    }
};
