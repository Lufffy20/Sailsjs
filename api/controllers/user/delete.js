/**
 * Delete User
 * (JWT handled by isAuthenticated policy)
 */

module.exports = {

  friendlyName: 'Delete user',

  inputs: {
    id: {
      type: 'number',
      required: true
    }
  },

  exits: {
    success: { description: 'User deleted successfully' },
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

    const user = await User.destroyOne({ id: inputs.id });

    if (!user) {
      throw 'notFound';
    }

    return exits.success({
      message: 'User deleted successfully'
    });
  }
};
