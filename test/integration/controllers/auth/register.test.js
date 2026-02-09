var supertest = require('supertest');
var assert = require('chai').assert;

describe('Register Controller', function () {

    describe('#register()', function () {

        it('should create a new user', function (done) {
            supertest(sails.hooks.http.app)
                .post('/auth/register')
                .send({
                    firstName: 'Test',
                    lastName: 'User',
                    username: 'testregister',
                    email: 'testregister@example.com',
                    password: 'password123',
                    confirmPassword: 'password123'
                })
                .expect(200, done);
        });

        it('should fail with mismatched passwords', function (done) {
            supertest(sails.hooks.http.app)
                .post('/auth/register')
                .send({
                    firstName: 'Test',
                    lastName: 'User',
                    username: 'mismatch',
                    email: 'mismatch@example.com',
                    password: 'password123',
                    confirmPassword: 'password456'
                })
                .expect(400, done);
        });

        it('should fail if email already exists', function (done) {
            // First create a user (or assume one from previous test, but better to be explicit or use before block)
            // For simplicity in this flow, we'll try to register the same user again.
            supertest(sails.hooks.http.app)
                .post('/auth/register')
                .send({
                    firstName: 'Test',
                    lastName: 'User',
                    username: 'testregister2', // different username
                    email: 'testregister@example.com', // SAME EMAIL
                    password: 'password123',
                    confirmPassword: 'password123'
                })
                .expect(400, done);
        });

    });

});
