/**
 * Resend Verification Action
 *
 * Purpose:
 * Resends email verification link to the user.
 * - Accepts user email address
 * - Checks whether the email is registered
 * - Ensures email is not already verified
 * - Generates a new verification token
 * - Sends verification email with a new link
 *
 * Flow:
 * 1. Accept email input
 * 2. Find user by email
 * 3. If user does not exist, return error
 * 4. If email is already verified, return success message
 * 5. Generate a new verification token
 * 6. Update token in database
 * 7. Send verification email
 * 8. Return success response
 */

module.exports = {

    // Action name (used internally by Sails)
    friendlyName: 'Resend Verification',

    // Short description of the action
    description: 'Resend verification email to user',

    // Expected input parameters
    inputs: {
        email: {
            type: 'string',
            required: true,
            isEmail: true,
            description: 'Registered user email address'
        }
    },

    // Possible exit responses
    exits: {
        success: {
            description: 'Verification email sent or already verified'
        },
        badRequest: {
            description: 'Email not registered',
            responseType: 'badRequest'
        },
        serverError: {
            description: 'Unexpected server error'
        }
    },

    // Main logic
    fn: async function (inputs, exits) {
        try {

            // Find user by email
            const user = await User.findOne({ email: inputs.email });

            // If email is not registered
            if (!user) {
                return exits.badRequest({
                    message: 'This email is not registered. Please check your email.'
                });
            }

            // If email is already verified
            if (user.emailStatus === 'verified') {
                return exits.success({
                    message: 'Your email is already verified. You can log in.'
                });
            }

            // Generate new verification token
            const { v4: uuidv4 } = require('uuid');
            const token = uuidv4();

            // Update verification token in database
            await User.updateOne({ id: user.id }).set({
                verificationToken: token
            });

            // Build verification link
            const link = `${sails.config.custom.baseUrl}/auth/verify-email?token=${token}`;

            // Send verification email
            await sails.helpers.sendEmail.with({
                to: user.email,
                subject: 'Verify your email',
                text: `Click this link to verify your email: ${link}`,
                html: `
                    <p>Click this link to verify your email:</p>
                    <a href="${link}">${link}</a>
                `
            });

            // Return success response
            return exits.success({
                message: 'Verification email sent. Please check your inbox.'
            });

        } catch (error) {
            sails.log.error(error);
            return exits.serverError({
                message: 'Something went wrong. Please try again.'
            });
        }
    }
};
