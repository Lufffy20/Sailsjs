/**
 * User Model
 *
 * Purpose:
 * Defines the user schema and handles password security.
 * - Stores user profile and authentication-related data
 * - Enforces uniqueness and validation rules
 * - Hashes user password before saving to the database
 *
 * Notes:
 * - Passwords are stored in hashed form using bcrypt
 * - Email verification and password reset fields support account security flows
 */

const bcrypt = require('bcrypt');

module.exports = {

  // Database table name
  tableName: 'user',

  // Model attributes
  attributes: {

    firstName: {
      type: 'string',
      required: true,
      maxLength: 50,
      columnName: 'first_name',
      example: 'John',
      description: 'User first name'
    },

    lastName: {
      type: 'string',
      required: true,
      maxLength: 50,
      columnName: 'last_name',
      example: 'Doe',
      description: 'User last name'
    },

    username: {
      type: 'string',
      required: true,
      unique: true,
      maxLength: 30,
      columnName: 'username',
      example: 'johndoe',
      description: 'Unique username'
    },

    email: {
      type: 'string',
      required: true,
      unique: true,
      isEmail: true,
      columnName: 'email',
      example: 'john.doe@example.com',
      description: 'User email address'
    },

    stripeCustomerId: {
      type: 'string',
      columnName: 'stripe_customer_id',
      description: 'Stripe Customer ID'
    },

    verificationToken: {
      type: 'string',
      columnName: 'verification_token',
      description: 'Token used for email verification'
    },

    emailStatus: {
      type: 'string',
      isIn: ['unverified', 'verified'],
      defaultsTo: 'unverified',
      columnName: 'email_status',
      description: 'Current email verification status'
    },

    pendingEmail: {
      type: 'string',
      isEmail: true,
      columnName: 'pending_email',
      description: 'New email address waiting for verification'
    },

    lastTokenIssuedAt: {
      type: 'number',
      columnName: 'last_token_issued_at',
      description: 'Timestamp of last issued JWT token'
    },

    passwordResetToken: {
      type: 'string',
      description: 'Token used for password reset verification'
    },

    passwordResetTokenExpiresAt: {
      type: 'number',
      description: 'Password reset token expiry timestamp'
    },

    role: {
      type: 'string',
      isIn: ['superadmin', 'admin', 'user'],
      defaultsTo: 'user',
      description: 'User role'
    },

    profilePictureUrl: {
      type: 'string',
      columnName: 'profile_picture_url',
      description: 'URL path to the user\'s profile picture'
    },

    password: {
      type: 'string',
      required: true,
      protect: true,
      columnName: 'password',
      description: 'Hashed user password'
    }
  },

  // Lifecycle callback to hash password before creating user
  beforeCreate: async function (values, proceed) {
    values.password = await bcrypt.hash(values.password, 10);
    return proceed();
  }
};
