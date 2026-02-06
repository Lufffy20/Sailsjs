/**
 * Get Single User
 * (JWT handled by isAuthenticated policy)
 */

module.exports = {

  friendlyName: 'Get user',

  inputs: {
    id: {
      type: 'number',
      required: true
    }
  },

  exits: {
    success: { description: 'User found successfully' },
    notFound: { description: 'User not found' },
    unauthorized: { description: 'Unauthorized access' }
  },

  fn: async function (inputs, exits) {

    // Ownership / role check
    if (
      this.req.me.role !== 'admin' &&
      this.req.me.id !== inputs.id
    ) {
      throw 'unauthorized';
    }

    const user = await User.findOne({ id: inputs.id })
      .select(['id', 'firstName', 'lastName', 'username', 'email', 'role']);

    if (!user) {
      throw 'notFound';
    }

    return exits.success({ user });
  }
};
