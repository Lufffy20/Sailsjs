module.exports = {

  friendlyName: 'Add Address',

  description: 'Add a new address for the logged-in user.',

  inputs: {
    name: { type: 'string', required: true },
    phoneNumber: { type: 'string', required: true },
    address_street: { type: 'string', required: true },
    city: { type: 'string', required: true },
    state: { type: 'string', required: true },
    postalCode: { type: 'string', required: true },
    country: { type: 'string', required: true },
    isDefault: { type: 'boolean', defaultsTo: false }
  },

  exits: {
    success: { responseType: 'ok' },
    limitReached: { responseType: 'badRequest', description: 'Address limit reached.' },
    serverError: { responseType: 'serverError' }
  },

  fn: async function (inputs, exits) {
    try {
      // Check limit manually here as well to provide a better error response if needed,
      // though the model also handles it.
      const count = await UserAddress.count({ user: this.req.me.id });
      if (count >= 3) {
        throw { limitReached: 'You can only save up to 3 addresses.' };
      }

      // Create the address
      const newAddress = await UserAddress.create({
        user: this.req.me.id,
        ...inputs
      }).fetch();

      return exits.success(newAddress);

    } catch (err) {
      // Handle custom exit override
      if (err.limitReached) {
        throw err;
      }

      // Handle Model Hook Errors (e.g. "Address limit reached")
      if (err.message && err.message.includes('Address limit reached')) {
        return exits.limitReached(err.message);
      }

      // Handle Unique Constraint (Just in case)
      if (err.code === 'E_UNIQUE') {
        return exits.limitReached('Address limit reached or duplicate data.');
      }

      return exits.serverError(err);
    }
  }

};
