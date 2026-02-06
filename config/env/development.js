// config/env/development.js
module.exports.datastores = {
  default: {
    adapter: 'sails-mysql',
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1',
    database: process.env.DB_NAME || 'sails1',
    port: process.env.DB_PORT || 3306,
    pool: {
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      maxConnections: 10,
      minConnections: 1,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200,
    }
  }
};