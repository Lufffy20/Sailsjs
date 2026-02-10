/**
 * Remove from Cart Action
 *
 * Purpose:
 * Removes an item from the user's cart and restores reserved stock.
 * - Ensures cart item exists
 * - Verifies cart ownership
 * - Restores product variant stock
 * - Deletes the cart item
 *
 * Flow:
 * 1. Accept cart item ID
 * 2. Find cart item and associated cart
 * 3. Verify cart belongs to logged-in user
 * 4. Restore stock for the product variant
 * 5. Remove item from cart
 * 6. Return success response
 */

module.exports = {

    // Action name (used internally by Sails)
    friendlyName: 'Remove from Cart',

    // Short description of the action
    description: 'Remove an item from the cart and restore stock.',

    // Expected input parameters
    inputs: {
        itemId: {
            type: 'number',
            required: true,
            description: 'Cart item ID'
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
        forbidden: {
            responseType: 'forbidden'
        }
    },

    // Main logic
    fn: async function (inputs) {

        const userId = this.req.me.id;

        // Find cart item and populate cart
        const cartItem = await CartItem
            .findOne({ id: inputs.itemId })
            .populate('cart');

        // Handle item not found
        if (!cartItem) {
            throw 'notFound';
        }

        // Ensure cart belongs to logged-in user
        if (cartItem.cart.user !== userId) {
            throw 'forbidden';
        }

        // Check if cart is active. If it's expired, processing, or completed, we DO NOT restore stock.
        // This prevents double counting if the cron job already handled it.
        if (cartItem.cart.status === 'active') {
            // Restore stock for the product variant
            const variant = await ProductVariant.findOne({
                id: cartItem.productVariant
            });

            if (variant) {
                await ProductVariant.updateOne({ id: variant.id }).set({
                    quantity: variant.quantity + cartItem.quantity
                });
            }
        }

        // Remove cart item (cleanup) - even if expired, we remove the item line to keep things clean.
        // Or if you prefer to keep history, you might just want to soft delete.
        // But based on requirement "removed", we destroy.
        await CartItem.destroyOne({ id: inputs.itemId });

        // Return success response
        return {
            message: 'Item removed from cart'
        };
    }
};