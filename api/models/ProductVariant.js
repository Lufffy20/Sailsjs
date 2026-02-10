/**
 * ProductVariant Model
 *
 * Purpose:
 * Stores product variants (e.g., specific color) with inventory tracking.
 */

module.exports = {

    tableName: 'product_variant',

    attributes: {

        color: {
            type: 'string',
            required: true,
            columnName: 'color',
            description: 'Variant color'
        },

        sku: {
            type: 'string',
            required: true,
            unique: true,
            columnName: 'sku',
            description: 'Stock Keeping Unit'
        },

        quantity: {
            type: 'number',
            required: true,
            min: 0,
            columnName: 'quantity',
            description: 'Available stock quantity'
        },

        price: {
            type: 'number',
            min: 0,
            columnName: 'price',
            description: 'Optional override price for this variant'
        },

        // Associations
        product: {
            model: 'Product',
            required: true,
            columnName: 'product_id'
        }
    }
};
