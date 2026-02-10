/**
 * View Cart Action
 *
 * Purpose:
 * Retrieves the logged-in user's active cart along with cart items.
 * - Returns empty response if no active cart exists
 * - Populates cart items
 * - Attaches product variant and product details to each cart item
 *
 * Flow:
 * 1. Fetch active cart for logged-in user
 * 2. If no cart exists, return empty cart response
 * 3. Fetch product variant details for cart items
 * 4. Attach variant and product data to cart items
 * 5. Return cart details
 */

module.exports = {

    // Action name (used internally by Sails)
    friendlyName: 'View Cart',

    // Short description of the action
    description: 'Get the user\'s active cart with items.',

    // Expected input parameters
    inputs: {},

    // Possible exit responses
    exits: {
        success: {
            responseType: 'ok'
        }
    },

    // Main logic
    fn: async function () {

        const userId = this.req.me.id;

        // Find active cart for user
        const cart = await Cart.findOne({
            user: userId,
            status: 'active'
        }).populate('items');

        // If no active cart exists
        if (!cart) {
            return {
                message: 'Cart is empty',
                cart: null,
                items: []
            };
        }

        // Attach product variant and product details to cart items
        if (cart.items && cart.items.length > 0) {

            const variantIds = cart.items.map(item => item.productVariant);
            const variants = await ProductVariant
                .find({ id: variantIds })
                .populate('product');

            const variantMap = {};
            variants.forEach(v => {
                variantMap[v.id] = v;
            });

            cart.items = cart.items.map(item => {
                return {
                    ...item,
                    productVariant: variantMap[item.productVariant]
                };
            });
        }

        // Return cart data
        return {
            cart: cart
        };
    }
};
