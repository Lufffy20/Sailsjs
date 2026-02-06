/**
 * Login Action
 * Authenticates user and generates JWT token
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {

  friendlyName: 'Login',

  description: 'Login user and generate JWT',

  inputs: {
    email: {
      type: 'string',
      required: true
    },
    password: {
      type: 'string',
      required: true
    }
  },

  exits: {
    success: {
      description: 'Login successful'
    },
    badRequest: {
      description: 'Invalid credentials'
    }
  },

  fn: async function (inputs, exits) {

    const user = await User.findOne({ email: inputs.email });

    if (!user) {
      return exits.badRequest({
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(inputs.password, user.password);

    if (!isMatch) {
      return exits.badRequest({
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
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

    // Update lastTokenIssuedAt
    await User.updateOne({ id: user.id })
      .set({
        lastTokenIssuedAt: Date.now()
      });

    delete user.password;

    return exits.success({
      message: 'Login successful',
      token,
      user
    });
  }
};
