module.exports = {

    friendlyName: 'Test Stripe Flow',

    description: 'Test the Stripe integration flow.',

    fn: async function () {

        sails.log.info('Starting Stripe verification...');

        try {
            // 1. Create a test User
            const email = `teststripe${Date.now()}@example.com`;
            const user = await User.create({
                firstName: 'Test',
                lastName: 'User',
                username: `testuser${Date.now()}`,
                email: email,
                password: 'password123',
                emailStatus: 'verified' // valid for login
            }).fetch();
            sails.log.info(`Created test user: ${user.email}`);

            // 2. Add an Item
            const item = await Item.create({
                name: 'Test Product',
                description: 'A product for testing',
                price: 10, // $10.00
                currency: 'usd'
            }).fetch();
            sails.log.info(`Created test item: ${item.name} ($${item.price})`);

            // 3. Simulate Create Order (Mocking the request as if authenticated)
            // We'll call the action function directly or via sails.helpers if it were a helper,
            // but since it's a controller, we can invoke it via `sails.hooks.request` or just by importing it?
            // Importing controllers in scripts is tricky because of dependencies.
            // Better to use `sails.request` if available or manually invoke logic.
            // Actually, we can just run the logic here to verify it *would* work or use supertest if installed.
            // But we want to test the *controller*.
            // Let's use `sails.request` which simulates a request.

            // Note: We need a valid Stripe token. 'tok_visa' is a standard test token.
            // BUT 'tok_visa' is for Tokens API/Charges. PaymentIntents use PaymentMethods 'pm_card_visa'.
            const testToken = 'pm_card_visa';

            sails.log.info('Simulating authenticated request to /payment/create-order...');

            // We need to login first to get a token? Or can we bypass?
            // Since we are running in a script with access to models, we can assume the policy works if we pass the user?
            // No, `sails.request` goes through the HTTP stack (mostly).
            // However, creating a mock req/res is easier.

            // Let's rely on the fact that if we call the controller function with a mock `req` containing `me`, it should work.

            const createOrderController = require('../api/controllers/payment/create-order');

            const mockReq = {
                me: user,
                body: {
                    itemId: item.id,
                    token: testToken
                }
            };

            const mockRes = {
                serverError: (err) => { throw err; },
                badRequest: (err) => { throw new Error('BadRequest: ' + JSON.stringify(err)); },
                success: (result) => { return result; }
            };

            // We need to bind `this` to mockReq for `this.req.me` access if the controller uses `this.req`.
            // The controller uses `this.req.me`.
            // So we need a context.

            const context = { req: mockReq };

            // Execute the function
            const result = await createOrderController.fn.call(context, { itemId: item.id, token: testToken }, mockRes);

            sails.log.info('Order created successfully!');
            sails.log.info('Order details:', result);

            // Verify Order in DB
            const order = await Order.findOne({ id: result.order.id });
            if (order && order.status === 'succeeded' && order.stripePaymentId) {
                sails.log.info('✅ Verification Passed: Order stored in database with success status.');
            } else {
                sails.log.error('❌ Verification Failed: Order not found or incorrect status.');
            }

        } catch (err) {
            sails.log.error('❌ Verification Failed:', err);
        }
    }
};
