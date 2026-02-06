/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  // '*': true,

  // Auth is public
  'auth/*': true,

  // User Controller Policies
  'user/create': ['isAuthenticated', 'isAdmin'], // Admin only
  'user/get-all': ['isAuthenticated', 'isAdmin'], // Admin only
  'user/get-one': 'isAuthenticated',
  'user/update': 'isAuthenticated',
  'user/delete': 'isAuthenticated',

};
