/**
 * Update user
 * (JWT handled by isAuthenticated policy)
 */

module.exports = {

  friendlyName: 'Update user',

  inputs: {
    id: {
      type: 'number',
      required: true
    },
    firstName: {
      type: 'string'
    },
    lastName: {
      type: 'string'
    },
    username: {
      type: 'string'
    }
  },

  exits: {
    success: { description: 'User updated' },
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

    const { id, ...data } = inputs;

    const user = await User.updateOne({ id }).set(data);

    if (!user) {
      throw 'notFound';
    }

    delete user.password;

    return exits.success({
      message: 'User updated successfully',
      user
    });
  }
};
