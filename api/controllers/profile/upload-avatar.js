/**
 * Upload Avatar Action
 *
 * Purpose:
 * Uploads and updates the profile picture of the logged-in user.
 * - Accepts image file upload
 * - Validates file size and file type
 * - Deletes previously uploaded avatar if exists
 * - Saves new avatar and updates user profile
 *
 * Flow:
 * 1. Accept avatar file from request
 * 2. Validate file size limit (2MB)
 * 3. Validate allowed image file types
 * 4. Remove old avatar files if present
 * 5. Save new avatar file
 * 6. Update user profile with new avatar URL
 * 7. Return success response with avatar URL
 */

module.exports = {

    // Action name (used internally by Sails)
    friendlyName: 'Upload Avatar',

    // Short description of the action
    description: 'Upload a new profile picture for the logged-in user',

    // File fields accepted by this action
    files: ['avatar'],

    // Expected input parameters
    inputs: {
        avatar: {
            type: 'ref',
            description: 'Uploaded avatar image file'
        }
    },

    // Possible exit responses
    exits: {
        success: {
            description: 'Avatar uploaded successfully'
        },
        badRequest: {
            responseType: 'badRequest'
        },
        serverError: {
            responseType: 'serverError'
        }
    },

    // Main logic
    fn: async function (inputs, exits) {

        const fs = require('fs');
        const path = require('path');
        const user = this.req.me;

        // Upload configuration
        const uploadOptions = {
            maxBytes: 2 * 1024 * 1024,
            dirname: path.resolve(sails.config.appPath, 'assets/images/avatars')
        };

        // Handle file upload
        this.req.file('avatar').upload(uploadOptions, async (err, uploadedFiles) => {

            // Handle upload errors
            if (err) {
                if (err.code === 'E_EXCEEDS_UPLOAD_LIMIT') {
                    return exits.badRequest({
                        message: 'File too large. Maximum size is 2MB.'
                    });
                }
                return exits.serverError(err);
            }

            // No file uploaded
            if (!uploadedFiles || uploadedFiles.length === 0) {
                return exits.badRequest({
                    message: 'No file was uploaded'
                });
            }

            const uploadedFile = uploadedFiles[0];
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

            // Validate file type
            if (!validTypes.includes(uploadedFile.type)) {
                fs.unlink(uploadedFile.fd, () => { });
                return exits.badRequest({
                    message: 'Invalid file type. Only image files are allowed.'
                });
            }

            // Delete old avatar files if they exist
            if (user.profilePictureUrl && user.profilePictureUrl.startsWith('/images/avatars/')) {

                const oldFilename = path.basename(user.profilePictureUrl);

                const assetPath = path.resolve(
                    sails.config.appPath,
                    'assets/images/avatars',
                    oldFilename
                );

                const tmpPath = path.resolve(
                    sails.config.appPath,
                    '.tmp/public/images/avatars',
                    oldFilename
                );

                [assetPath, tmpPath].forEach(p => {
                    if (fs.existsSync(p)) {
                        fs.unlink(p, () => { });
                    }
                });
            }

            // Build public avatar URL
            const filename = path.basename(uploadedFile.fd);
            const publicUrl = `/images/avatars/${filename}`;

            // Update user profile with new avatar URL
            await User.updateOne({ id: user.id }).set({
                profilePictureUrl: publicUrl
            });

            // Return success response
            return exits.success({
                message: 'Avatar uploaded successfully',
                avatarUrl: publicUrl
            });
        });
    }
};
