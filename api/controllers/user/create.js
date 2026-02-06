/**
 * Create User (Register)
 * ----------------------
 * This action is responsible for registering a new user.
 * It validates input, creates a user record, and returns
 * a clean response without sensitive data.
 */

module.exports = {

  // Human-readable name for the action
  friendlyName: 'Register user',

  /**
   * Inputs expected from the request
   */
  inputs: {
    firstName: {
      type: 'string',
      required: true,
      description: 'User first name'
    },

    lastName: {
      type: 'string',
      required: true,
      description: 'User last name'
    },

    username: {
      type: 'string',
      required: true,
      description: 'Unique username'
    },

    email: {
      type: 'string',
      required: true,
      isEmail: true,
      description: 'Valid email address'
    },

    password: {
      type: 'string',
      required: true,
      minLength: 6,
      description: 'User password (minimum 6 characters)'
    },
  },

  /**
   * Possible exits (responses)
   */
  exits: {
    success: {
      description: 'User created successfully'
    },

    badRequest: {
      description: 'Invalid or duplicate data provided'
    }
  },

  /**
   * Main logic of the action
   */
  fn: async function (inputs, exits) {

    try {
      // Create new user record in database
      const user = await User.create(inputs).fetch();

      // Remove password before sending response
      delete user.password;

      // Return success response
      return exits.success({
        message: 'User registered successfully',
        user
      });

    } catch (err) {

      // Handle unique constraint error (email / username already exists)
      if (err.code === 'E_UNIQUE') {
        return exits.badRequest({
          message: 'Email or username already exists'
        });
      }

      // Throw unexpected errors
      throw err;
    }
  }
};
