module.exports = {

    friendlyName: 'Check and Process Expired Carts',

    description: 'Find active carts that have expired, restore their stock to inventory, and update their status.',

    inputs: {
    },

    exits: {
        success: {
            description: 'All expired carts processed successfully.'
        }
    },

    fn: async function (inputs) {
        // 1. Find expired active carts (Just IDs first to be efficient)
        const now = Date.now();
        const expiredCarts = await Cart.find({
            status: 'active',
            expiresAt: { '<': now }
        });

        if (expiredCarts.length === 0) {
            return;
        }

        sails.log.info(`[CRON] Found ${expiredCarts.length} potentially expired active carts.`);

        for (const cart of expiredCarts) {
            try {
                // Transactional Block
                await sails.getDatastore().transaction(async (db) => {

                    // 2. LOCK: Attempt to set status to 'processing' atomicly
                    // This ensures only one process (this cron run) handles this cart.
                    const updatedCart = await Cart.updateOne({
                        id: cart.id,
                        status: 'active'
                    }).set({
                        status: 'processing'
                    }).usingConnection(db);

                    if (!updatedCart) {
                        // Already modified by someone else
                        return; // Exit transaction early (implicit rollback/commit of nothing)
                    }

                    sails.log.verbose(`[CRON] Locked cart ${cart.id} for processing.`);

                    // 3. Re-fetch Items (Fresh from DB)
                    const itemsToProcess = await CartItem.find({ cart: cart.id }).usingConnection(db);

                    // 4. Restore Stock
                    for (const item of itemsToProcess) {
                        const variant = await ProductVariant.findOne({ id: item.productVariant }).usingConnection(db);
                        if (variant) {
                            await ProductVariant.updateOne({ id: variant.id }).set({
                                quantity: variant.quantity + item.quantity
                            }).usingConnection(db);
                            sails.log.verbose(`[CRON] Restored ${item.quantity} stock for variant SKU: ${variant.sku}`);
                        }
                    }

                    // 5. Mark Cart as Expired
                    await Cart.updateOne({ id: cart.id }).set({
                        status: 'expired'
                    }).usingConnection(db);

                });

                sails.log.info(`[CRON] Cart ${cart.id} processed and marked as expired.`);

            } catch (err) {
                sails.log.error(`[CRON] Failed to process cart ${cart.id}:`, err);

                // Only revert if we successfully locked it but failed later
                // Though in most cases 'processing' is a safe stuck state vs 'active'
                try {
                    await Cart.updateOne({ id: cart.id }).set({ status: 'failed' });
                } catch (e) { }
            }
        }

    }
};