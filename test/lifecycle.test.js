var sails = require('sails');
require('dotenv').config();

// Before running any tests...
before(function (done) {

    // Increase the Mocha timeout so that Sails has enough time to lift, even if you have a bunch of assets.
    this.timeout(10000);

    sails.lift({
        // Your Sails app's configuration files will be loaded automatically,
        // but you can also make one-off checks here.
        // For example, we might want to verify that we're running in the
        // "test" environment.
        hooks: { grunt: false }, // disable grunt to speed up lifting
        log: { level: 'warn' },
        environment: 'test',
        port: 1338,
        custom: {
            email: false
        }
    }, function (err) {
        if (err) { return done(err); }

        // here you can load fixtures, etc.
        // (for example, you might want to create some records in the database)

        // Clear User table to ensure fresh start
        User.destroy({}).then(() => {
            return done();
        }).catch(err => {
            return done(err);
        });
    });
});

// After all tests have finished...
after(function (done) {

    // here you can clear fixtures, etc.
    // (e.g. you might want to destroy the records you created above)

    sails.lower(done);

});
