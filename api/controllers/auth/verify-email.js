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

            // Determine the new email status and address
            const updates = {
                emailStatus: 'verified',
                verificationToken: '',
                pendingEmail: '' // Clear pending email
            };

            // If this was a profile update (pendingEmail exists), promote it to main email
            if (user.pendingEmail) {
                updates.email = user.pendingEmail;
            }

            // Mark email as verified and update User record
            await User.updateOne({ id: user.id }).set(updates);

            // Sync Email with Stripe (Best Effort)
            // We do this AFTER updating the DB to ensure we only sync verified emails
            if (user.stripeCustomerId) {
                try {
                    const stripe = require('stripe')(sails.config.custom.stripeSecretKey);
                    // Use the new email (either just verified pendingEmail or existing email)
                    const validEmail = updates.email || user.email;

                    await stripe.customers.update(user.stripeCustomerId, {
                        email: validEmail
                    });
                    sails.log.verbose(`[Stripe Sync] Updated customer email for user ${user.id}`);
                } catch (stripeErr) {
                    sails.log.error('Failed to sync email with Stripe:', stripeErr);
                    // Do not fail the request, as email is already verified locally
                }
            }

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