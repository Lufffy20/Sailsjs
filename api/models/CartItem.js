/**
 * CartItem Model
 *
 * Purpose:
 * Represents an item within a shopping cart.
 */

module.exports = {

    tableName: 'cart_item',

    attributes: {

        quantity: {
            type: 'number',
            required: true,
            min: 1,
            columnName: 'quantity',
            description: 'Quantity of the item in cart'
        },

        price: {
            type: 'number',
            required: true,
            min: 0,
            columnName: 'price',
            description: 'Price per unit at the time of adding to cart'
        },

        // Associations
        cart: {
            model: 'Cart',
            required: true,
            columnName: 'cart_id'
        },

        productVariant: {
            model: 'ProductVariant',
            required: true,
            columnName: 'product_variant_id'
        }
    }
};
