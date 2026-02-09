var supertest = require('supertest');
var assert = require('chai').assert;

describe('Auth Controller (Resend Verification)', function () {

    describe('#resendVerification()', function () {

        it('should resend verification email to unverified user', async function () {
            await User.create({
                firstName: 'Resend',
                lastName: 'Test',
                username: 'resendtest',
                email: 'resend@example.com',
                password: 'password123',
                emailStatus: 'unverified'
            });

            await supertest(sails.hooks.http.app)
                .post('/auth/resend-verification')
                .send({ email: 'resend@example.com' })
                .expect(200);

            // Ideally check if token was generated, but finding user is enough proxy
            const user = await User.findOne({ email: 'resend@example.com' });
            assert.isNotNull(user.verificationToken);
        });

        it('should fail/message if user already verified', async function () {
            await User.create({
                firstName: 'Verified',
                lastName: 'User',
                username: 'verifieduser',
                email: 'alreadyverified@example.com',
                password: 'password123',
                emailStatus: 'verified'
            });

            await supertest(sails.hooks.http.app)
                .post('/auth/resend-verification')
                .send({ email: 'alreadyverified@example.com' })
                .expect(200); // Controller returns success message if already verified
        });

    });

});
