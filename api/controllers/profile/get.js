/**
 * Get Profile Action
 *
 * Purpose:
 * Returns profile details of the currently logged-in user.
 * - Uses authenticated user data from the request
 * - Exposes only required profile fields
 *
 * Flow:
 * 1. Access logged-in user from request context
 * 2. Return selected profile fields
 */

module.exports = {

    // Action name (used internally by Sails)
    friendlyName: 'Get Profile',

    // Short description of the action
    description: 'Get the logged-in user\'s profile details',

    // Possible exit responses
    exits: {
        success: {
            description: 'Profile details returned successfully'
        }
    },

    // Main logic
    fn: async function (inputs, exits) {

        // Return selected profile fields for logged-in user
        return exits.success({
            firstName: this.req.me.firstName,
            lastName: this.req.me.lastName,
            username: this.req.me.username,
            email: this.req.me.email,
            profilePictureUrl: this.req.me.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.req.me.username)}&background=random`
        });
    }
};
