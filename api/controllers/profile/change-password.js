/**
 * Change Password Action
 *
 * Purpose:
 * Allows a logged-in user to change their account password.
 * - Validates new password and confirm password
 * - Verifies current password
 * - Ensures new password is different from current password
 * - Hashes and updates the new password securely
 *
 * Flow:
 * 1. Accept current password, new password, and confirm password
 * 2. Validate new password and confirm password match
 * 3. Fetch logged-in user details
 * 4. Verify current password against stored hash
 * 5. Ensure new password is not the same as current password
 * 6. Hash the new password
 * 7. Update password in database
 * 8. Return success response
 */

const bcrypt = require('bcrypt');

module.exports = {

    // Action name (used internally by Sails)
    friendlyName: 'Change Password',

    // Short description of the action
    description: 'Update the logged-in user\'s password',

    // Expected input parameters
    inputs: {
        currentPassword: {
            type: 'string',
            required: true,
            description: 'User current password'
        },
        newPassword: {
            type: 'string',
            required: true,
            minLength: 6,
            description: 'New account password'
        },
        confirmPassword: {
            type: 'string',
            required: true,
            description: 'Confirmation of new password'
        }
    },

    // Possible exit responses
    exits: {
        success: {
            description: 'Password changed successfully'
        },
        badRequest: {
            description: 'Invalid request or user not found',
            responseType: 'badRequest'
        },
        passwordMismatch: {
            responseType: 'badRequest',
            description: 'New password and confirm password do not match'
        },
        currentPasswordIncorrect: {
            responseType: 'badRequest',
            description: 'Current password is incorrect'
        },
        sameAsCurrent: {
            responseType: 'badRequest',
            description: 'New password cannot be the same as current password'
        }
    },

    // Main logic
    fn: async function (inputs, exits) {

        try {

            // Validate new password and confirm password
            if (inputs.newPassword !== inputs.confirmPassword) {
                return exits.passwordMismatch({
                    message: 'New password and confirm password do not match.'
                });
            }

            // Fetch logged-in user
            const user = await User.findOne({ id: this.req.me.id });

            if (!user) {
                return exits.badRequest({
                    message: 'User not found.'
                });
            }

            // Verify current password
            const isMatch = await bcrypt.compare(inputs.currentPassword, user.password);

            if (!isMatch) {
                return exits.currentPasswordIncorrect({
                    message: 'The current password you entered is incorrect.'
                });
            }

            // Ensure new password is different from current password
            if (inputs.currentPassword === inputs.newPassword) {
                return exits.sameAsCurrent({
                    message: 'New password must be different from the current password.'
                });
            }

            // Hash new password
            const hashedNewPassword = await bcrypt.hash(inputs.newPassword, 10);

            // Update password
            await User.updateOne({ id: user.id }).set({
                password: hashedNewPassword
            });

            // Return success response
            return exits.success({
                message: 'Password changed successfully.'
            });

        } catch (err) {
            sails.log.error('Change password error:', err);
            return exits.badRequest({
                message: 'Unable to change password. Please try again later.'
            });
        }
    }
};
