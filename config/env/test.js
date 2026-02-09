module.exports = {
    datastores: {
        default: {
            adapter: 'sails-mysql',
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '1',
            database: 'sails1_test',
            port: process.env.DB_PORT || 3306,
        }
    },
    models: {
        migrate: 'drop', // Start fresh every time
    },
    policies: {
        '*': true, // (Optional) Disable policies during some tests if needed, but keeping them is better for integration tests. Defaults to verifying policies.
    },
    port: 1338, // Ensure test port matches lifecycle
    log: {
        level: 'warn'
    }
};
