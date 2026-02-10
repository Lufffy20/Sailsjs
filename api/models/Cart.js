/**
 * Cart Model
 *
 * Purpose:
 * Represents a user's shopping cart.
 */

module.exports = {

    tableName: 'cart',

    attributes: {

        status: {
            type: 'string',
            isIn: ['active', 'completed', 'expired', 'failed', 'processing'],
            defaultsTo: 'active',
            columnName: 'status',
            description: 'Status of the cart'
        },

        expiresAt: {
            type: 'number',
            columnName: 'expires_at',
            description: 'Timestamp when the cart expires'
        },

        // Associations
        user: {
            model: 'User',
            columnName: 'user_id',
            // required: true // Optional: if we want to allow guest carts, we might leave this optional. For now assuming logged in users or just storing user_id if available.
        },

        items: {
            collection: 'CartItem',
            via: 'cart'
        }
    }
};
