/**
 * Get All Users with Pagination
 * (JWT handled by isAuthenticated policy)
 * Admin only (handled by isAdmin policy)
 */

module.exports = {

  friendlyName: 'Get users',

  inputs: {
    page: {
      type: 'number',
      defaultsTo: 1
    },
    limit: {
      type: 'number',
      defaultsTo: 10
    }
  },

  exits: {
    success: {
      description: 'Users fetched successfully'
    }
  },

  fn: async function (inputs, exits) {

    const page = Math.max(inputs.page, 1);
    const limit = Math.min(Math.max(inputs.limit, 1), 50); // safety cap
    const skip = (page - 1) * limit;

    const totalUsers = await User.count();

    const users = await User.find()
      .select(['id', 'firstName', 'lastName', 'username', 'email', 'role'])
      .skip(skip)
      .limit(limit);

    return exits.success({
      users,
      pagination: {
        totalRecords: totalUsers,
        currentPage: page,
        perPage: limit,
        totalPages: Math.ceil(totalUsers / limit)
      }
    });
  }
};
