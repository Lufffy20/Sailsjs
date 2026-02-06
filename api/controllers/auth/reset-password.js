const bcrypt = require('bcrypt');
const crypto = require('crypto');

module.exports = {

    // Action name used internally by Sails
    friendlyName: 'Reset password',

    // Brief description of what this action does
    description: 'Reset the password for a user using a valid password reset token.',

    // Expected input parameters
    inputs: {

        // Password reset token received from email link
        token: {
            type: 'string',
            required: true,
            description: 'The password reset token.'
        },

        // New password entered by the user
        password: {
            type: 'string',
            required: true,
            description: 'The new password.'
        },

        // Confirmation of the new password
        confirmPassword: {
            type: 'string',
            required: true,
            description: 'The confirmation of the new password.'
        }
    },

    // Possible exit responses
    exits: {

        // Successful password reset
        success: {
            description: 'Password has been successfully reset.'
        },

        // Token is invalid or expired
        invalidOrExpiredToken: {
            responseType: 'badRequest',
            description: 'The provided token is invalid or has expired.'
        },

        // Password and confirm password do not match
        passwordMismatch: {
            responseType: 'badRequest',
            description: 'The provided password and confirmation do not match.'
        }
    },

    // Main action logic
    fn: async function ({ token, password, confirmPassword }) {

        // Check if password and confirm password match
        if (password !== confirmPassword) {
            throw 'passwordMismatch';
        }

        // Hash the incoming reset token for secure comparison
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find the user with a valid reset token and non-expired timestamp
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetTokenExpiresAt: { '>': Date.now() }
        });

        // If no matching user is found, token is invalid or expired
        if (!user) {
            throw 'invalidOrExpiredToken';
        }

        // Hash the new password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password and clear reset token fields
        await User.updateOne({ id: user.id }).set({
            password: hashedPassword,
            passwordResetToken: '',
            passwordResetTokenExpiresAt: 0
        });

        // Return success response
        return {
            message: 'Password has been successfully reset.'
        };
    }

};
