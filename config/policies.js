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

  // Rate limit sensitive auth actions
  'auth/register': ['rate-limit-generic'],
  'auth/login': ['rate-limit-generic'],
  'auth/request-password-reset': ['rate-limit-password-reset'],

  // Reset password remains public (token-based)
  'auth/reset-password': true,

  // User Controller Policies
  'user/create': ['isAuthenticated', 'isAdmin'], // Admin only
  'user/get-all': ['isAuthenticated', 'isAdmin'], // Admin only
  'user/get-one': ['isAuthenticated', 'isAdmin'],
  'user/update': ['isAuthenticated', 'isAdmin'],
  'user/delete': ['isAuthenticated', 'isAdmin'],

  // Profile Controller Policies
  'profile/get': ['isAuthenticated'], // Logged in user only
  'profile/update': ['isAuthenticated'],
  'profile/upload-avatar': ['isAuthenticated'],
  'profile/delete-avatar': ['isAuthenticated'],
  'profile/change-password': ['isAuthenticated'],

  // Payment & Order Policies
  'payment/create-order': ['isAuthenticated'], // User must be logged in to pay
  'order/get-history': ['isAuthenticated'],

  // Cart Controller Policies
  'cart/add': ['isAuthenticated'],
  'cart/view': ['isAuthenticated'],
  'cart/remove': ['isAuthenticated'],
  'cart/checkout-prep': ['isAuthenticated'],

  // Address Controller Policies
  'address/add': ['isAuthenticated'],
  'address/update': ['isAuthenticated'],
  'address/delete': ['isAuthenticated'],
  'address/list': ['isAuthenticated'],

  // Product Controller Policies
  'product/create': ['isAuthenticated', 'isAdmin'],
  'product/add-variant': ['isAuthenticated', 'isAdmin'],
  'product/get-all': true, // Public
  'product/get-one': true, // Public

  // Stripe Webhook (Signature verification handles auth)
  'stripe/webhook': true,

};
