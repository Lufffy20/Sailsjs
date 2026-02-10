module.exports = {

    friendlyName: 'Get Order History',
    description: 'Get the order history for the logged-in user.',

    inputs: {},

    exits: {
        success: {
            responseType: 'ok'
        }
    },

    fn: async function () {
        const userId = this.req.me.id;

        const orders = await Order.find({ user: userId })
            .sort('createdAt DESC')
            .populate('items');

        return {
            orders: orders
        };
    }

};
