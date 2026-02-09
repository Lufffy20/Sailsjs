var supertest = require('supertest');
var assert = require('chai').assert;

describe('Login Controller', function () {

    // Create a verified user before testing login
    before(async function () {
        await User.create({
            firstName: 'Login',
            lastName: 'User',
            username: 'loginuser',
            email: 'login@example.com',
            password: 'password123', // Model beforeCreate handles hashing
            emailStatus: 'verified'
        });
    });

    describe('#login()', function () {

        it('should login successfully with valid credentials', function (done) {
            supertest(sails.hooks.http.app)
                .post('/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.exists(res.body.token);
                    assert.equal(res.body.user.email, 'login@example.com');
                    done();
                });
        });

        it('should fail with invalid password', function (done) {
            supertest(sails.hooks.http.app)
                .post('/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword'
                })
                .expect(400, done);
        });

        it('should fail if email is not verified', function (done) {
            // Create unverified user
            (async () => {
                await User.create({
                    firstName: 'Unverified',
                    lastName: 'User',
                    username: 'unverified',
                    email: 'unverified@example.com',
                    password: 'password123',
                    emailStatus: 'unverified'
                });

                supertest(sails.hooks.http.app)
                    .post('/auth/login')
                    .send({
                        email: 'unverified@example.com',
                        password: 'password123'
                    })
                    .expect(400, done);
            })();
        });

    });

});
