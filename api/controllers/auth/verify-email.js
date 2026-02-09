/**
 * Verify Email Action
 * Handles email verification using token
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

            // Mark email as verified and clear verification token
            await User.updateOne({ id: user.id }).set({
                emailStatus: 'verified',
                verificationToken: ''
            });

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