/**
 * Update Profile Action
 *
 * Purpose:
 * Updates profile details of the currently logged-in user.
 * - Allows updating first name, last name, username, and email
 * - Ensures username and email uniqueness
 * - Sends verification email if email is changed
 * - Stores new email temporarily until verification
 *
 * Flow:
 * 1. Accept profile update inputs
 * 2. Prepare update object for allowed fields
 * 3. Validate username uniqueness if changed
 * 4. Validate email uniqueness if changed
 * 5. If email is changed, generate verification token and send verification email
 * 6. Update user record with new values
 * 7. Return updated profile data or verification message
 */

module.exports = {

    // Action name (used internally by Sails)
    friendlyName: 'Update Profile',

    // Short description of the action
    description: 'Update the logged-in user\'s profile details',

    // Expected input parameters
    inputs: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        username: { type: 'string' },
        email: { type: 'string', isEmail: true }
    },

    // Possible exit responses
    exits: {
        success: { description: 'Profile updated successfully' },
        emailAlreadyInUse: {
            responseType: 'badRequest',
            description: 'Email already in use'
        },
        usernameAlreadyInUse: {
            responseType: 'badRequest',
            description: 'Username already in use'
        },
        badRequest: { responseType: 'badRequest' }
    },

    // Main logic
    fn: async function (inputs, exits) {

        try {

            const user = this.req.me;
            const updates = {};
            let emailVerificationSent = false;

            // Update first name and last name if provided
            if (inputs.firstName) updates.firstName = inputs.firstName;
            if (inputs.lastName) updates.lastName = inputs.lastName;

            // Handle username change
            if (inputs.username && inputs.username !== user.username) {
                const existingUser = await User.findOne({ username: inputs.username });
                if (existingUser) {
                    return exits.usernameAlreadyInUse({
                        message: 'This username is already taken. Please choose another one.'
                    });
                }
                updates.username = inputs.username;
            }

            // Handle email change
            if (inputs.email && inputs.email !== user.email) {
                const existingUser = await User.findOne({ email: inputs.email });
                if (existingUser) {
                    return exits.emailAlreadyInUse({
                        message: 'This email is already registered. Please use a different email.'
                    });
                }

                // Generate verification token for new email
                const { v4: uuidv4 } = require('uuid');
                const verificationToken = uuidv4();

                updates.pendingEmail = inputs.email;
                updates.verificationToken = verificationToken;

                // Send verification email to new address
                const verifyLink = `${sails.config.custom.baseUrl}/auth/verify-email?token=${verificationToken}`;

                await sails.helpers.sendEmail.with({
                    to: inputs.email,
                    subject: 'Verify your new email address',
                    text: `Verify your new email: ${verifyLink}`,
                    html: `<a href="${verifyLink}">${verifyLink}</a>`
                });

                emailVerificationSent = true;
            }

            // Update user record if there are changes
            if (Object.keys(updates).length > 0) {
                await User.updateOne({ id: user.id }).set(updates);
            }

            // Fetch updated user data
            const freshUser = await User.findOne({ id: user.id });

            // Return appropriate response
            if (emailVerificationSent) {
                return exits.success({
                    message: 'A verification email has been sent to your new email address.'
                });
            }

            return exits.success({
                message: 'Profile updated successfully.',
                user: {
                    firstName: freshUser.firstName,
                    lastName: freshUser.lastName,
                    username: freshUser.username,
                    email: freshUser.email,
                    pendingEmail: freshUser.pendingEmail
                }
            });

        } catch (err) {
            sails.log.error('Profile update error:', err);
            return exits.badRequest({
                message: 'Unable to update profile. Please try again later.'
            });
        }
    }
};
