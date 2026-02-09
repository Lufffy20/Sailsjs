/**
 * Delete Avatar Action
 */

module.exports = {

    friendlyName: 'Delete Avatar',

    description: 'Delete the profile picture of the logged-in user',

    exits: {
        success: {
            description: 'Avatar deleted successfully'
        },
        serverError: {
            responseType: 'serverError'
        }
    },

    fn: async function (inputs, exits) {

        const fs = require('fs');
        const path = require('path');
        const user = this.req.me;

        if (user.profilePictureUrl && user.profilePictureUrl.startsWith('/images/avatars/')) {
            try {
                const filename = path.basename(user.profilePictureUrl);

                const assetPath = path.resolve(
                    sails.config.appPath,
                    'assets/images/avatars',
                    filename
                );

                const tmpPath = path.resolve(
                    sails.config.appPath,
                    '.tmp/public/images/avatars',
                    filename
                );

                [assetPath, tmpPath].forEach(filePath => {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                });

            } catch (err) {
                sails.log.error('Failed to delete avatar file:', err);
            }
        }

        // DB update (null recommended, not empty string)
        await User.updateOne({ id: user.id }).set({
            profilePictureUrl: ''
        });

        return exits.success({
            message: 'Profile picture deleted. Default avatar will be used.'
        });
    }
};
