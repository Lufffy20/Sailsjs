/**
 * Resend Verification Action
 * Resends verification email with a new token
 */
module.exports = {

    friendlyName: 'Resend Verification',

    description: 'Resend verification email to the user.',

    inputs: {
        email: {
            type: 'string',
            required: true,
            isEmail: true,
            description: 'User email address'
        }
    },

    exits: {
        success: {
            description: 'Verification email sent successfully.'
        },
        badRequest: {
            description: 'Invalid request.'
        },
        serverError: {
            description: 'Something went wrong.'
        }
    },

    fn: async function (inputs, exits) {
        try {
            // Find user by email
            const user = await User.findOne({ email: inputs.email });

            // If user not found, return success to prevent email enumeration
            if (!user) {
                return exits.success({
                    message: 'If an account exists with this email, a verification link has been sent.'
                });
            }

            // If already verified
            if (user.emailStatus === 'verified') {
                return exits.success({
                    message: 'This account is already verified. You can log in.'
                });
            }

            // Generate new verification token
            const { v4: uuidv4 } = require('uuid');
            const newVerificationToken = uuidv4();

            // Update user with new token
            await User.updateOne({ id: user.id })
                .set({ verificationToken: newVerificationToken });

            // Send verification email
            const verifyLink = `${sails.config.custom.baseUrl}/auth/verify-email?token=${newVerificationToken}`;

            await sails.helpers.sendEmail.with({
                to: user.email,
                subject: 'Resend: Verify your email address',
                text: `Please verify your email by clicking the following link: ${verifyLink}`,
                html: `<p>Please verify your email by clicking the following link:</p><a href="${verifyLink}">${verifyLink}</a>`
            });

            return exits.success({
                message: 'If an account exists with this email, a verification link has been sent.'
            });

        } catch (err) {
            sails.log.error(err);
            return exits.serverError(err);
        }
    }

};
