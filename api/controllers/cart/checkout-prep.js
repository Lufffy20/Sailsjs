/**
 * Checkout Preparation Action
 *
 * Purpose:
 * Validates the user's active cart and prepares checkout data.
 * - Ensures an active cart exists
 * - Verifies cart is not empty or expired
 * - Calculates total amount and item-wise subtotals
 * - Returns a structured summary for checkout
 *
 * Flow:
 * 1. Fetch active cart for logged-in user
 * 2. Validate cart existence and contents
 * 3. Check cart expiration time
 * 4. Calculate total amount and item subtotals
 * 5. Return checkout summary
 */

module.exports = {

    // Action name (used internally by Sails)
    friendlyName: 'Checkout Preparation',

    // Short description of the action
    description: 'Validate cart and calculate totals before checkout.',

    // Expected input parameters
    inputs: {},

    // Possible exit responses
    exits: {
        success: {
            responseType: 'ok'
        },
        notFound: {
            responseType: 'notFound',
            description: 'Cart not found'
        },
        badRequest: {
            responseType: 'badRequest'
        }
    },

    // Main logic
    fn: async function () {

        const userId = this.req.me.id;

        // Fetch active cart with items
        const cart = await Cart.findOne({
            user: userId,
            status: 'active'
        }).populate('items');

        // Validate cart existence and items
        if (!cart || cart.items.length === 0) {
            throw { notFound: 'Cart is empty' };
        }

        // Validate cart expiration
        if (cart.expiresAt < Date.now()) {
            throw {
                badRequest: 'Cart session expired. Please refresh transaction.'
            };
        }

        let totalAmount = 0;
        const itemsSummary = [];

        // Calculate totals and item subtotals
        for (const item of cart.items) {
            const subtotal = item.price * item.quantity;
            totalAmount += subtotal;

            itemsSummary.push({
                itemId: item.id,
                variantId: item.productVariant,
                quantity: item.quantity,
                price: item.price,
                subtotal: subtotal
            });
        }

        // Return checkout summary
        return {
            message: 'Cart validated',
            summary: {
                totalAmount: totalAmount,
                itemCount: cart.items.length,
                items: itemsSummary
            }
        };
    }
};
