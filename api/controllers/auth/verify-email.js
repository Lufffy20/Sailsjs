/**
 * Verify Email Action
 * Handles email verification using token
 */
module.exports = {

    // Action name used internally by Sails
    friendlyName: 'Verify Email',

    // Brief description of what this action does
    description: 'Verify user email address using a token.',

    // Expected input parameters
    inputs: {

        // Email verification token received from email link
        token: {
            type: 'string',
            required: true,
            description: 'The verification token.'
        }
    },

    // Possible exit responses
    exits: {

        // Successful email verification
        success: {
            description: 'Email verified successfully.'
        },

        // Token is invalid or expired
        invalidToken: {
            description: 'The provided token is invalid or expired.'
        },

        // Generic server error response
        serverError: {
            description: 'Something went wrong.'
        }
    },

    // Main action logic
    fn: async function (inputs, exits) {
        try {

            // Find user with the provided verification token
            const user = await User.findOne({ verificationToken: inputs.token });

            // Return error if no matching user is found
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

            // Return success response after verification
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
