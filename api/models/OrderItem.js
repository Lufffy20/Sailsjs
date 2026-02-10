/**
 * OrderItem Model
 *
 * Purpose:
 * Represents a single line item within an order.
 * Stores a snapshot of the product details at the time of purchase.
 */

module.exports = {

    tableName: 'order_item',

    attributes: {

        order: {
            model: 'Order',
            required: true
        },

        productVariant: {
            model: 'ProductVariant',
            // We keep the relation but also might want to store snapshot data in case variant is deleted
        },

        // Snapshot data
        productName: {
            type: 'string',
            description: 'Snapshot of product name'
        },

        variantSku: {
            type: 'string',
            description: 'Snapshot of variant SKU'
        },

        quantity: {
            type: 'number',
            required: true,
            min: 1
        },

        price: {
            type: 'number',
            required: true,
            min: 0,
            description: 'Price per unit at purchase time'
        }
    }
};
