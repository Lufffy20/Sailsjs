/**
 * Verify Email Action
 *
 * Purpose:
 * Verifies a user's email address using a verification token.
 * - Validates verification token
 * - Marks email as verified
 * - Handles pending email update if present
 * - Clears verification token after successful verification
 *
 * Flow:
 * 1. Accept verification token
 * 2. Find user with matching token
 * 3. If token is invalid or expired, return error
 * 4. Update email verification status
 * 5. Update pending email if applicable
 * 6. Clear verification token
 * 7. Return success response
 */

module.exports = {

    // Action name (used internally by Sails)
    friendlyName: 'Verify Email',

    // Short description of the action
    description: 'Verify user email address using a token',

    // Expected input parameters
    inputs: {

        // Email verification token from email link
        token: {
            type: 'string',
            required: true,
            description: 'Email verification token'
        }
    },

    // Possible exit responses
    exits: {

        // Successful email verification
        success: {
            description: 'Email verified successfully'
        },

        // Invalid or expired token
        invalidToken: {
            description: 'Verification token is invalid or expired',
            responseType: 'badRequest'
        },

        // Generic server error
        serverError: {
            description: 'Unexpected server error'
        }
    },

    // Main logic
    fn: async function (inputs, exits) {
        try {

            // Find user using verification token
            const user = await User.findOne({ verificationToken: inputs.token });

            // If token is invalid or expired
            if (!user) {
                return exits.invalidToken({
                    message: 'Invalid or expired verification token.'
                });
            }

            // Prepare fields to update
            const updates = {
                emailStatus: 'verified',
                verificationToken: ''
            };

            // Update main email if pending email exists
            if (user.pendingEmail) {
                updates.email = user.pendingEmail;
                updates.pendingEmail = '';
            }

            // Save updates to database
            await User.updateOne({ id: user.id }).set(updates);

            // Return success response
            return exits.success({
                message: 'Email verified successfully! You can now log in.'
            });

        } catch (err) {

            // Log error for debugging
            sails.log.error(err);

            // Return server error response
            return exits.serverError(err);
        }
    }
};
