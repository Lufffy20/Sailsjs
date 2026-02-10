module.exports = {

    friendlyName: 'List Addresses',

    description: 'List all addresses for the logged-in user.',

    exits: {
        success: { responseType: 'ok' }
    },

    fn: async function () {
        const addresses = await UserAddress.find({ user: this.req.me.id });
        return addresses;
    }

};
