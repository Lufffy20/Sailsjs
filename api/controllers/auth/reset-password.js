/**
 * Reset Password Action
 *
 * Purpose:
 * Resets a user's password using a valid password reset token.
 * - Validates password and confirm password
 * - Verifies reset token and expiry time
 * - Hashes and updates the new password securely
 * - Clears password reset token after successful reset
 *
 * Flow:
 * 1. Accept reset token, new password, and confirm password
 * 2. Validate password and confirm password match
 * 3. Hash incoming reset token for comparison
 * 4. Find user with matching token and valid expiry
 * 5. If token is invalid or expired, return error
 * 6. Hash new password
 * 7. Update user password and clear reset token fields
 * 8. Return success response
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');

module.exports = {

    // Action name (used internally by Sails)
    friendlyName: 'Reset password',

    // Short description of the action
    description: 'Reset user password using a valid reset token',

    // Expected input parameters
    inputs: {

        // Password reset token from email
        token: {
            type: 'string',
            required: true,
            description: 'Password reset token received via email'
        },

        // New password entered by the user
        password: {
            type: 'string',
            required: true,
            description: 'New account password'
        },

        // Confirmation of new password
        confirmPassword: {
            type: 'string',
            required: true,
            description: 'Confirmation of new password'
        }
    },

    // Possible exit responses
    exits: {

        // Successful password reset
        success: {
            description: 'Password reset completed successfully'
        },

        // Invalid or expired token
        invalidOrExpiredToken: {
            responseType: 'badRequest',
            description: 'Password reset token is invalid or expired'
        },

        // Password mismatch
        passwordMismatch: {
            responseType: 'badRequest',
            description: 'Password and confirm password do not match'
        }
    },

    // Main logic
    fn: async function ({ token, password, confirmPassword }) {

        // Validate password confirmation
        if (password !== confirmPassword) {
            throw 'passwordMismatch';
        }

        // Hash the reset token for secure comparison
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid reset token and expiry
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetTokenExpiresAt: { '>': Date.now() }
        });

        // If token is invalid or expired
        if (!user) {
            throw 'invalidOrExpiredToken';
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password and clear reset token data
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
