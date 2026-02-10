/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also create a hook.
 *
 * For more information on seeding your app with fake data, check out:
 * https://sailsjs.com/config/bootstrap
 */

module.exports.bootstrap = async function () {

  // Seed Admin User
  if (await User.count({ email: 'admin@example.com' }) === 0) {
    await User.create({
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin', // Ensure User model has this field and allows it
      emailStatus: 'verified'
    });
    sails.log.info('Seeded admin user: admin@example.com / password123');
  }


  // Cron jobs are now handled by config/cron.js via sails-hook-cron
};
