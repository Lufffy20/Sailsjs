/**
 * UserAddress.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        user: {
            model: 'user',
            required: true,
            description: 'The user who owns this address'
        },

        name: {
            type: 'string',
            required: true,
            description: 'Name of the recipient (e.g. Home, billing, Office, etc.)'
        },

        phoneNumber: {
            type: 'string',
            required: true,
            description: 'Phone number for this address'
        },

        address_street: {
            type: 'string',
            required: true,
            description: 'Street address'
        },

        city: {
            type: 'string',
            required: true,
            description: 'City'
        },

        state: {
            type: 'string',
            required: true,
            description: 'State/Province/Region'
        },

        postalCode: {
            type: 'string',
            required: true,
            description: 'Postal/Zip Code'
        },

        country: {
            type: 'string',
            required: true,
            description: 'Country'
        },

        isDefault: {
            type: 'boolean',
            defaultsTo: false,
            description: 'Is this the default address for the user?'
        }

    },

    // Limit check before creating a new address
    beforeCreate: async function (values, proceed) {
        // Check how many addresses this user already has
        const count = await UserAddress.count({ user: values.user });
        if (count >= 3) {
            return proceed(new Error('Address limit reached. You can only save up to 3 addresses.'));
        }
        return proceed();
    },

    // Ensure only one default address per user
    afterCreate: async function (createdRecord, proceed) {
        if (createdRecord.isDefault) {
            await UserAddress.update({
                user: createdRecord.user,
                id: { '!=': createdRecord.id }
            }).set({ isDefault: false });
        }
        return proceed();
    },

    afterUpdate: async function (updatedRecord, proceed) {
        if (updatedRecord.isDefault) {
            await UserAddress.update({
                user: updatedRecord.user,
                id: { '!=': updatedRecord.id }
            }).set({ isDefault: false });
        }
        return proceed();
    }

};
