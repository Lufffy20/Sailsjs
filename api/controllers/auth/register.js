/**
 * Register Action
 *
 * Purpose:
 * Handles new user registration process.
 * - Validates password and confirm password
 * - Checks for duplicate email and username
 * - Creates a new user with unverified email status
 * - Generates an email verification token
 * - Sends verification email to the user
 *
 * Flow:
 * 1. Validate password and confirm password
 * 2. Check if email already exists
 * 3. Check if username already exists
 * 4. Generate unique email verification token
 * 5. Create user with unverified email status
 * 6. Generate email verification link
 * 7. Send verification email
 * 8. Return success response
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
      description: 'User email address'
    },
    password: {
      type: 'string',
      required: true,
      minLength: 6,
      description: 'Account password'
    },
    confirmPassword: {
      type: 'string',
      required: true,
      description: 'Password confirmation'
    }
  },

  // Possible exit responses
  exits: {
    success: {
      description: 'User registered successfully'
    },
    badRequest: {
      description: 'Invalid input or duplicate data',
      responseType: 'badRequest'
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

    try {

      // Check if email is already registered
      const emailExists = await User.findOne({ email: inputs.email });
      if (emailExists) {
        return exits.badRequest({
          message: 'This email is already in use'
        });
      }

      // Check if username is already taken
      const usernameExists = await User.findOne({ username: inputs.username });
      if (usernameExists) {
        return exits.badRequest({
          message: 'This username is already taken'
        });
      }

      // Generate email verification token
      const { v4: uuidv4 } = require('uuid');
      const verificationToken = uuidv4();

      // Create Stripe customer (Best effort)
      let stripeCustomerId = null;
      try {
        const stripeCustomer = await sails.helpers.createStripeCustomer.with({
          email: inputs.email,
          name: `${inputs.firstName} ${inputs.lastName}`
        });
        stripeCustomerId = stripeCustomer.id;
      } catch (stripeErr) {
        sails.log.error('Stripe Customer Creation Failed during registration (proceeding anyway):', stripeErr);
      }

      // Create new user with unverified email status
      await User.create({
        firstName: inputs.firstName,
        lastName: inputs.lastName,
        username: inputs.username,
        email: inputs.email,
        password: inputs.password,
        verificationToken,
        emailStatus: 'unverified',
        stripeCustomerId: stripeCustomerId
      });

      // Generate email verification link
      const verifyLink = `${sails.config.custom.baseUrl}/auth/verify-email?token=${verificationToken}`;

      // Send verification email
      await sails.helpers.sendEmail.with({
        to: inputs.email,
        subject: 'Verify your email address',
        text: `Please verify your email by clicking this link: ${verifyLink}`,
        html: `
          <p>Please verify your email by clicking the link below:</p>
          <a href="${verifyLink}">${verifyLink}</a>
        `
      });

      // Return success response
      return exits.success({
        message: 'User registered successfully. Please check your email to verify your account.'
      });

    } catch (err) {
      throw err;
    }
  }
};
