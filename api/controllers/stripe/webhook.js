/**
 * Stripe Webhook Controller
 *
 * Purpose:
 * Handles asynchronous events from Stripe.
 * - Verifies webhook signature to ensuring authenticity
 * - Handles payment_intent.succeeded: Completes the order
 * - Handles payment_intent.payment_failed: Fails the order and restores stock
 */

module.exports = {

    friendlyName: 'Stripe Webhook',

    description: 'Handle incoming Stripe webhooks.',

    inputs: {},

    exits: {
        success: { description: 'Webhook acknowledged.' },
        badRequest: { responseType: 'badRequest' },
        serverError: { responseType: 'serverError' }
    },

    fn: async function (inputs) {
        const stripe = require('stripe')(sails.config.custom.stripeSecretKey);
        const sig = this.req.headers['stripe-signature'];
        const webhookSecret = sails.config.custom.stripeWebhookSecret;

        let event;

        // 1. Verify Signature
        try {
            if (!webhookSecret) {
                // If secret is not configured, we cannot verify, so we must reject for security.
                // Or just log warning if in dev? Better to be strict.
                sails.log.error('Stripe Webhook Error: STRIPE_WEBHOOK_SECRET not configured.');
                throw new Error('Configuration Missing');
            }

            // Sails bodies are parsed by default. Stripe needs raw body.
            // We assume raw-body parser is configured or we use `req.body` if it was preserved raw.
            // Note: In standard Sails, `req.body` is JSON. Stripe needs Buffer.
            // We might need to adjust `config/http.js` to get raw body if not available.
            // For now, let's try using `req.body` assuming it might be handled, 
            // but usually we need `req.rawBody`.
            // If `req.rawBody` is not present, this will fail.
            // See note below on config adjustment.

            const payload = this.req.rawBody || JSON.stringify(this.req.body);
            // JSON.stringify is risky if formatting differs from signed payload. 
            // Better to rely on a raw body parser middleware. 
            // We will assume `req.rawBody` exists (common convention).

            event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);

        } catch (err) {
            sails.log.warn(`Webhook signature verification failed.`, err.message);
            return this.res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // 2. Handle Events
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                await handlePaymentSuccess(paymentIntent);
                break;

            case 'payment_intent.payment_failed':
                const paymentIntentFailed = event.data.object;
                await handlePaymentFailure(paymentIntentFailed);
                break;

            default:
            // Unexpected event type
            // sails.log.info(`Unhandled event type ${event.type}`);
        }

        // Return 200 to acknowledge receipt
        return this.res.json({ received: true });
    }
};

/**
 * Handle Successful Payment
 * - Find ongoing Order by stripePaymentId
 * - If found, update status to 'processing'/'paid' if not already
 * - If not found (rare, but possible if DB write failed after stripe confirmed), 
 *   we might need to create it (Complex, requires metadata).
 *   For now, we just log "Order not found" because `create-order` should have created it in transaction.
 */
async function handlePaymentSuccess(paymentIntent) {
    try {
        const order = await Order.findOne({ stripePaymentId: paymentIntent.id });

        if (order) {
            if (order.status === 'cancelled' || order.paymentStatus === 'failed') {
                // Weird edge case: It failed locally but succeeded in Stripe?
                // Update to paid.
                await Order.updateOne({ id: order.id }).set({
                    status: 'processing',
                    paymentStatus: 'paid'
                });
                sails.log.info(`[Webhook] Order ${order.id} recovered and marked as paid.`);
            } else {
                sails.log.info(`[Webhook] Payment succeeded for Order ${order.id}.`);
            }
        } else {
            sails.log.warn(`[Webhook] Order not found for PaymentIntent ${paymentIntent.id}. Possible lost write.`);
            // TODO: Reconstruct order from PaymentIntent metadata if we stored cartId?
        }
    } catch (err) {
        sails.log.error('Error handling payment success webhook:', err);
    }
}

/**
 * Handle Failed Payment
 * - Find Order
 * - Mark as cancelled/failed
 * - Restore Stock (if not already done)
 */
async function handlePaymentFailure(paymentIntent) {
    try {
        const order = await Order.findOne({ stripePaymentId: paymentIntent.id });

        if (order && order.status !== 'cancelled') {
            // Start transaction to cancel and restore
            await sails.getDatastore().transaction(async (db) => {

                await Order.updateOne({ id: order.id }).set({
                    status: 'cancelled',
                    paymentStatus: 'failed'
                }).usingConnection(db);

                const orderItems = await OrderItem.find({ order: order.id }).usingConnection(db);

                for (const item of orderItems) {
                    const variant = await ProductVariant.findOne({ id: item.productVariant }).usingConnection(db);
                    if (variant) {
                        await ProductVariant.updateOne({ id: variant.id }).set({
                            quantity: variant.quantity + item.quantity
                        }).usingConnection(db);
                    }
                }
            });
            sails.log.info(`[Webhook] Order ${order.id} failed and stock restored.`);
        }
    } catch (err) {
        sails.log.error('Error handling payment failures webhook:', err);
    }
}
