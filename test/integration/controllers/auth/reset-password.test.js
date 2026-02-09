var supertest = require('supertest');
var assert = require('chai').assert;

describe('Auth Controller (Reset Password)', function () {

    let validToken = 'reset-token-123';

    before(async function () {
        await User.create({
            firstName: 'Reset',
            lastName: 'Complete',
            username: 'resetcomplete',
            email: 'resetcomplete@example.com',
            password: 'OldPassword123',
            emailStatus: 'verified',
            passwordResetToken: require('crypto').createHash('sha256').update(validToken).digest('hex'),
            passwordResetTokenExpiresAt: Date.now() + 100000 // Future
        });
    });

    describe('#resetPassword()', function () {

        it('should reset password with valid token', async function () {
            await supertest(sails.hooks.http.app)
                .post('/auth/reset-password')
                .send({
                    token: validToken,
                    password: 'NewPassword123',
                    confirmPassword: 'NewPassword123'
                })
                .expect(200);

            // Verify login works with new password
            await supertest(sails.hooks.http.app)
                .post('/auth/login')
                .send({
                    email: 'resetcomplete@example.com',
                    password: 'NewPassword123'
                })
                .expect(200);
        });

        it('should fail with invalid token', function (done) {
            supertest(sails.hooks.http.app)
                .post('/auth/reset-password')
                .send({
                    token: 'invalid-token',
                    password: 'NewPassword123',
                    confirmPassword: 'NewPassword123'
                })
                .expect(400, done); // Assuming badRequest/invalidToken
        });

    });

});
