/**
 * Register Action
 * Handles new user registration
 */

module.exports = {

  // Action name (used internally by Sails)
  friendlyName: 'Register',

  // Expected input parameters
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
      description: 'User password'
    },

    confirmPassword: {
      type: 'string',
      required: true,
      description: 'Password confirmation'
    }
  },

  // Possible exits
  exits: {
    success: {
      description: 'User registered successfully'
    },

    badRequest: {
      description: 'Invalid input or request'
    }
  },

  // Main logic
  fn: async function (inputs, exits) {

    // Check if password and confirm password match
    if (inputs.password !== inputs.confirmPassword) {
      return exits.badRequest({
        message: 'Passwords do not match'
      });
    }

    // Destructure required fields
    const {
      firstName,
      lastName,
      username,
      email,
      password
    } = inputs;

    try {
      // Generate verification token
      const { v4: uuidv4 } = require('uuid');
      const verificationToken = uuidv4();

      // Create new user record with unverified status
      const user = await User.create({
        firstName,
        lastName,
        username,
        email,
        password,
        verificationToken,
        emailStatus: 'unverified'
      }).fetch();

      // Send verification email
      const verifyLink = `${sails.config.custom.baseUrl}/auth/verify-email?token=${verificationToken}`;

      await sails.helpers.sendEmail.with({
        to: email,
        subject: 'Verify your email address',
        text: `Welcome! Please verify your email by clicking the following link: ${verifyLink}`,
        html: `<p>Welcome!</p><p>Please verify your email by clicking the following link:</p><a href="${verifyLink}">${verifyLink}</a>`
      });

      // Remove sensitive fields before response
      const safeUser = _.omit(user, ['password', 'verificationToken']);

      // Send success response
      return exits.success({
        message: 'User registered successfully. Please check your email to verify your account.',
        user: safeUser
      });

    } catch (err) {

      // Handle duplicate email or username error
      if (err.code === 'E_UNIQUE') {
        return exits.badRequest({
          message: 'Account with this email or username already exists'
        });
      }

      // Throw unexpected errors
      throw err;
    }
  }
};
