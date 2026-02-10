/**
 * Add to Cart Action
 *
 * Purpose:
 * Adds a product variant to the logged-in user's active cart.
 * - Reserves stock immediately when item is added to cart
 * - Creates a new cart if no active cart exists
 * - Updates cart expiration time on each add
 * - Handles stock validation and quantity updates
 *
 * Flow:
 * 1. Accept product variant ID and quantity
 * 2. Find the product variant and validate existence
 * 3. Check available stock
 * 4. Find or create an active cart for the user
 * 5. Add or update cart item
 * 6. Reserve stock by decrementing variant quantity
 * 7. Return cart reference
 */

module.exports = {

    // Action name (used internally by Sails)
    friendlyName: 'Add to Cart',

    // Short description of the action
    description: 'Add an item to the user\'s active cart, reserving stock.',

    // Expected input parameters
    inputs: {
        variantId: {
            type: 'number',
            required: true,
            description: 'Product variant ID'
        },
        quantity: {
            type: 'number',
            required: true,
            min: 1,
            description: 'Quantity to add to cart'
        }
    },

    // Possible exit responses
    exits: {
        success: {
            responseType: 'ok'
        },
        badRequest: {
            responseType: 'badRequest'
        },
        notFound: {
            responseType: 'notFound'
        },
        insufficientStock: {
            responseType: 'badRequest',
            description: 'Not enough stock available'
        }
    },

    // Main logic
    fn: async function (inputs) {

        const userId = this.req.me.id;
        // Use configured expiration time or default to 10 minutes
        const EXPIRE_MINUTES = sails.config.custom.cartExpirationMinutes || 10;

        // 1. Find product variant and populate product
        const variant = await ProductVariant
            .findOne({ id: inputs.variantId })
            .populate('product');

        if (!variant) {
            throw 'notFound';
        }

        // 2. Check stock availability
        if (variant.quantity < inputs.quantity) {
            throw {
                insufficientStock: `Only ${variant.quantity} items left in stock.`
            };
        }

        // 3. Find or create active cart
        let cart = await Cart.findOne({
            user: userId,
            status: 'active'
        });

        if (!cart) {
            cart = await Cart.create({
                user: userId,
                status: 'active',
                expiresAt: Date.now() + (EXPIRE_MINUTES * 60 * 1000)
            }).fetch();
        } else {
            // Extend cart expiration on activity
            await Cart.updateOne({ id: cart.id }).set({
                expiresAt: Date.now() + (EXPIRE_MINUTES * 60 * 1000)
            });
        }

        // 4. Check if item already exists in cart
        let cartItem = await CartItem.findOne({
            cart: cart.id,
            productVariant: inputs.variantId
        });

        if (cartItem) {
            // Update existing cart item quantity
            await CartItem.updateOne({ id: cartItem.id }).set({
                quantity: cartItem.quantity + inputs.quantity
            });
        } else {
            // Determine item price (variant price or fallback to product price)
            let price = variant.price;
            if (!price && price !== 0) {
                price = variant.product.price;
            }

            // Create new cart item
            await CartItem.create({
                cart: cart.id,
                productVariant: inputs.variantId,
                quantity: inputs.quantity,
                price: price
            });
        }

        // 5. Reserve stock by decrementing variant quantity
        await ProductVariant.updateOne({ id: inputs.variantId }).set({
            quantity: variant.quantity - inputs.quantity
        });

        // Return success response
        return {
            message: 'Item added to cart',
            cartId: cart.id
        };
    }
};
