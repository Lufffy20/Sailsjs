/**
 * Login Action
 *
 * Purpose:
 * Authenticates a user using email and password.
 * - Verifies user existence
 * - Compares hashed password using bcrypt
 * - Ensures email is verified before login
 * - Generates a JWT token on successful authentication
 * - Updates lastTokenIssuedAt for token tracking
 *
 * Flow:
 * 1. Find user by email
 * 2. If user not found → return invalid credentials
 * 3. Compare entered password with stored hashed password
 * 4. If password mismatch → return invalid credentials
 * 5. Check email verification status
 * 6. Generate JWT token with expiry
 * 7. Update lastTokenIssuedAt in database
 * 8. Remove password from response
 * 9. Return token and user details
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {

  // Action name (used internally by Sails)
  friendlyName: 'Login',

  // Short description of what this action does
  description: 'Authenticate user and generate JWT token',

  // Expected input parameters
  inputs: {
    email: {
      type: 'string',
      required: true,
      description: 'Registered user email address'
    },
    password: {
      type: 'string',
      required: true,
      description: 'User account password'
    }
  },

  // Possible exit responses
  exits: {
    success: {
      description: 'User logged in successfully'
    },
    badRequest: {
      description: 'Invalid credentials or unverified email',
      responseType: 'badRequest'
    }
  },

  // Main logic
  fn: async function (inputs, exits) {

    // Find user by email
    const user = await User.findOne({ email: inputs.email });

    // If user does not exist
    if (!user) {
      return exits.badRequest({
        message: 'Invalid email or password'
      });
    }

    // Compare entered password with stored hashed password
    const isMatch = await bcrypt.compare(inputs.password, user.password);

    // If password does not match
    if (!isMatch) {
      return exits.badRequest({
        message: 'Invalid email or password'
      });
    }

    // Check if user email is verified
    if (user.emailStatus !== 'verified') {
      return exits.badRequest({
        message: 'Please verify your email address before logging in.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Update last token issue time
    await User.updateOne({ id: user.id }).set({
      lastTokenIssuedAt: Date.now()
    });

    // Remove password before sending response
    delete user.password;

    // Return success response
    return exits.success({
      message: 'Login successful',
      token,
      user
    });
  }
};
