var supertest = require('supertest');
var assert = require('chai').assert;

describe('Profile Controller', function () {

    let token;

    before(async function () {
        // Create user
        await User.create({
            firstName: 'Profile',
            lastName: 'User',
            username: 'profileuser',
            email: 'profile@example.com',
            password: 'password123',
            emailStatus: 'verified'
        });

        // Login to get token
        const res = await supertest(sails.hooks.http.app)
            .post('/auth/login')
            .send({
                email: 'profile@example.com',
                password: 'password123'
            });

        token = res.body.token;
    });

    describe('#update()', function () {

        it('should update user profile', function (done) {
            supertest(sails.hooks.http.app)
                .put('/user/profile')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    firstName: 'Updated',
                    lastName: 'Name'
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.user.firstName, 'Updated');
                    assert.equal(res.body.user.lastName, 'Name');
                    done();
                });
        });

        it('should trigger email verification if email is changed', function (done) {
            supertest(sails.hooks.http.app)
                .put('/user/profile')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    email: 'newemail@example.com'
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.include(res.body.message, 'verification email has been sent');
                    done();
                });
        });

    });

});
