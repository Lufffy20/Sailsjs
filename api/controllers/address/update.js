module.exports = {

    friendlyName: 'Update Address',

    description: 'Update an existing address.',

    inputs: {
        id: { type: 'string', required: true },
        name: { type: 'string' },
        phoneNumber: { type: 'string' },
        address_street: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        postalCode: { type: 'string' },
        country: { type: 'string' },
        isDefault: { type: 'boolean' }
    },

    exits: {
        success: { responseType: 'ok' },
        notFound: { responseType: 'notFound' },
        forbidden: { responseType: 'forbidden' }
    },

    fn: async function (inputs, exits) {
        const address = await UserAddress.findOne({ id: inputs.id });

        if (!address) {
            throw { notFound: 'Address not found' };
        }

        if (address.user !== this.req.me.id) {
            throw { forbidden: 'You do not have permission to update this address' };
        }

        const updatedAddress = await UserAddress.update({ id: inputs.id })
            .set({
                name: inputs.name,
                phoneNumber: inputs.phoneNumber,
                address_street: inputs.address_street,
                city: inputs.city,
                state: inputs.state,
                postalCode: inputs.postalCode,
                country: inputs.country,
                isDefault: inputs.isDefault
            })
            .fetch();

        return exits.success(updatedAddress[0]);
    }

};
