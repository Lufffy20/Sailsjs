var supertest = require('supertest');
var assert = require('chai').assert;

describe('Auth Controller (Request Password Reset)', function () {

    describe('#requestPasswordReset()', function () {

        it('should generate reset token for valid email', async function () {
            await User.create({
                firstName: 'Reset',
                lastName: 'Request',
                username: 'resetrequest',
                email: 'resetrequest@example.com',
                password: 'password123',
                emailStatus: 'verified'
            });

            await supertest(sails.hooks.http.app)
                .post('/auth/request-password-reset')
                .send({ email: 'resetrequest@example.com' })
                .expect(200);

            const user = await User.findOne({ email: 'resetrequest@example.com' });
            assert.isNotNull(user.passwordResetToken);
            assert.isNotNull(user.passwordResetTokenExpiresAt);
        });

        it('should respond success even if email not found (security)', function (done) {
            supertest(sails.hooks.http.app)
                .post('/auth/request-password-reset')
                .send({ email: 'unknown@example.com' })
                .expect(200, done);
        });

    });

});
