var supertest = require('supertest');
var assert = require('chai').assert;

describe('Auth Controller (Verify Email)', function () {

    describe('#verifyEmail()', function () {

        it('should verify email with valid token', async function () {
            // Setup
            const user = await User.create({
                firstName: 'Verify',
                lastName: 'Test',
                username: 'verifytest',
                email: 'verify@example.com',
                password: 'password123',
                emailStatus: 'unverified',
                verificationToken: 'valid-token-123'
            }).fetch();

            await supertest(sails.hooks.http.app)
                .get('/auth/verify-email?token=valid-token-123')
                .expect(200);

            const updatedUser = await User.findOne({ id: user.id });
            assert.equal(updatedUser.emailStatus, 'verified');
            assert.equal(updatedUser.verificationToken, '');
        });

        it('should fail with invalid token', function (done) {
            supertest(sails.hooks.http.app)
                .get('/auth/verify-email?token=invalid-token')
                .expect(400, done); // Assuming invalidToken exit maps to 400 or generic error
        });

    });

});
