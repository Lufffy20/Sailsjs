/**
 * Product Model
 *
 * Purpose:
 * Stores basic product information.
 */

module.exports = {

    tableName: 'product',

    attributes: {

        name: {
            type: 'string',
            required: true,
            maxLength: 200,
            columnName: 'name',
            description: 'Product name'
        },

        slug: {
            type: 'string',
            required: true,
            unique: true,
            maxLength: 200,
            columnName: 'slug',
            description: 'URL-friendly product name'
        },

        description: {
            type: 'string',
            columnName: 'description',
            description: 'Product description'
        },

        price: {
            type: 'number',
            required: true,
            min: 0,
            columnName: 'price',
            description: 'Base price of the product'
        },

        category: {
            type: 'string',
            columnName: 'category',
            description: 'Product category'
        },

        // Associations
        variants: {
            collection: 'ProductVariant',
            via: 'product'
        }
    }
};
