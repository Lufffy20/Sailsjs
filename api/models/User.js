/**
 * User Model
 * Defines user schema and handles password hashing
 */

const bcrypt = require('bcrypt');

module.exports = {

  tableName: 'user',

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

    verificationToken: {
      type: 'string',
      columnName: 'verification_token',
      description: 'Token for email verification'
    },

    emailStatus: {
      type: 'string',
      isIn: ['unverified', 'verified'],
      defaultsTo: 'unverified',
      columnName: 'email_status',
      description: 'Email verification status'
    },

    lastTokenIssuedAt: {
      type: 'number',
      columnName: 'last_token_issued_at',
      description: 'Timestamp when the last JWT was issued'
    },

    passwordResetToken: {
      type: 'string',
      description: 'A unique token used to verify the user identity for password recovery.'
    },

    passwordResetTokenExpiresAt: {
      type: 'number',
      description: 'A timestamp representing when the password reset token expires.'
    },

    role: {
      type: 'string',
      isIn: ['superadmin', 'admin', 'user'],
      defaultsTo: 'user'
    },


    password: {
      type: 'string',
      required: true,
      protect: true,
      columnName: 'password',
      description: 'Hashed user password'
    }

  },

  // Lifecycle callback
  beforeCreate: async function (values, proceed) {
    values.password = await bcrypt.hash(values.password, 10);
    return proceed();
  }
};
