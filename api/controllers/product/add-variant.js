/**
 * Add Product Variant Action
 *
 * Purpose:
 * Adds a new variant to an existing product.
 * - Accessible only to admin users
 * - Ensures the parent product exists
 * - Validates variant details such as SKU and quantity
 * - Ensures SKU uniqueness
 *
 * Flow:
 * 1. Accept product ID and variant details
 * 2. Check if the parent product exists
 * 3. Create a new product variant
 * 4. Handle duplicate SKU errors
 * 5. Return success response with variant data
 */

module.exports = {

    // Action name (used internally by Sails)
    friendlyName: 'Add Product Variant',

    // Short description of the action
    description: 'Add a variant to an existing product (admin only)',

    // Expected input parameters
    inputs: {
        productId: {
            type: 'number',
            required: true,
            description: 'ID of the parent product'
        },
        color: {
            type: 'string',
            required: true,
            description: 'Variant color'
        },
        sku: {
            type: 'string',
            required: true,
            description: 'Unique SKU for the variant'
        },
        quantity: {
            type: 'number',
            required: true,
            min: 0,
            description: 'Available stock quantity'
        },
        price: {
            type: 'number',
            min: 0,
            description: 'Variant-specific price (optional)'
        }
    },

    // Possible exit responses
    exits: {
        success: {
            responseType: 'ok'
        },
        notFound: {
            responseType: 'notFound'
        },
        badRequest: {
            responseType: 'badRequest'
        }
    },

    // Main logic
    fn: async function (inputs) {

        // Verify parent product exists
        const product = await Product.findOne({ id: inputs.productId });
        if (!product) {
            throw 'notFound';
        }

        try {

            // Create product variant
            const newVariant = await ProductVariant.create({
                product: inputs.productId,
                color: inputs.color,
                sku: inputs.sku,
                quantity: inputs.quantity,
                price: inputs.price
            }).fetch();

            // Return success response
            return {
                message: 'Product variant added successfully',
                variant: newVariant
            };

        } catch (error) {

            // Handle duplicate SKU error
            if (error.code === 'E_UNIQUE') {
                throw { badRequest: 'SKU already exists' };
            }

            // Throw unexpected errors
            throw error;
        }
    }
};
