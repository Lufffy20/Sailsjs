const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

module.exports = {

    // Action name used internally by Sails
    friendlyName: 'Request password reset',

    // Brief description of what this action does
    description: 'Generate a new password reset token and send it to the user via email.',

    // Expected input parameters
    inputs: {

        // Email address of the user requesting password reset
        email: {
            type: 'string',
            required: true,
            isEmail: true,
            description: 'The email address of the user who wants to reset their password.'
        }
    },

    // Possible exit responses
    exits: {

        // Generic success response to prevent user enumeration
        success: {
            description: 'If the email exists, a password reset link has been sent.'
        }
    },

    // Main action logic
    fn: async function ({ email }) {

        // Find user by email address
        const user = await User.findOne({ email });

        // Return generic success message if user does not exist
        if (!user) {
            return {
                message: 'If the email exists, a password reset link has been sent.'
            };
        }

        // Generate a raw password reset token
        const rawToken = uuidv4();

        // Hash the token before storing it in the database
        const hashedToken = crypto
            .createHash('sha256')
            .update(rawToken)
            .digest('hex');

        // Store hashed token and expiry timestamp in the database
        await User.updateOne({ id: user.id }).set({
            passwordResetToken: hashedToken,
            passwordResetTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
        });

        // Build frontend password reset URL with raw token
        const resetUrl = `${sails.config.custom.baseUrl}/reset-password?token=${rawToken}`;

        // Send password reset email to the user
        await sails.helpers.sendEmail.with({
            to: user.email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
            html: `
        <p>You requested a password reset.</p>
        <p>
          <a href="${resetUrl}" style="padding:10px 15px;background:#000;color:#fff;text-decoration:none;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 24 hours.</p>
      `
        });

        // Return generic success response
        return {
            message: 'If the email exists, a password reset link has been sent.'
        };
    }

};
