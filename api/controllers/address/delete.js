module.exports = {

    friendlyName: 'Delete Address',

    description: 'Delete an existing address.',

    inputs: {
        id: { type: 'string', required: true }
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
            throw { forbidden: 'You do not have permission to delete this address' };
        }

        await UserAddress.destroy({ id: inputs.id });

        return exits.success({ message: 'Address deleted successfully' });
    }

};
