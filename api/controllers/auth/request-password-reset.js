/**
 * Request Password Reset Action
 *
 * Purpose:
 * Handles password reset requests securely.
 * - Accepts user email address
 * - Generates a password reset token
 * - Stores a hashed version of the token with expiry time
 * - Sends a password reset email with a reset link
 * - Returns a generic success response to prevent user enumeration
 *
 * Flow:
 * 1. Accept email input
 * 2. Check if user exists with the given email
 * 3. If user does not exist, return generic success message
 * 4. Generate a raw reset token (UUID)
 * 5. Hash the token before storing it in the database
 * 6. Save hashed token and expiry timestamp
 * 7. Generate password reset URL with raw token
 * 8. Send password reset email
 * 9. Return generic success response
 */

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

module.exports = {

    // Action name (used internally by Sails)
    friendlyName: 'Request password reset',

    // Short description of the action
    description: 'Generate password reset token and send reset email',

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
            description: 'Generic success response for password reset request'
        }
    },

    // Main logic
    fn: async function ({ email }) {

        // Find user by email
        const user = await User.findOne({ email });

        // Always return generic response if user is not found
        if (!user) {
            return {
                message: 'If the email exists, a password reset link has been sent.'
            };
        }

        // Generate raw password reset token
        const rawToken = uuidv4();

        // Hash the token before storing in database
        const hashedToken = crypto
            .createHash('sha256')
            .update(rawToken)
            .digest('hex');

        // Save hashed token and expiry time (24 hours)
        await User.updateOne({ id: user.id }).set({
            passwordResetToken: hashedToken,
            passwordResetTokenExpiresAt: Date.now() + (24 * 60 * 60 * 1000)
        });

        // Build password reset URL with raw token
        const resetUrl = `${sails.config.custom.baseUrl}/reset-password?token=${rawToken}`;

        // Send password reset email
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
