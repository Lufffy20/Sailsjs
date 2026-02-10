/**
 * Application Routes Configuration
 *
 * Purpose:
 * Defines all HTTP routes for the application and maps them
 * to corresponding Sails actions or views.
 * - Handles authentication and authorization flows
 * - Manages user profile and account actions
 * - Provides product, cart, and order APIs
 * - Separates admin-only routes from public/user routes
 */

module.exports.routes = {

  /**
   * Home Route
   */
  '/': {
    view: 'pages/homepage'
  },

  /**
   * Authentication Routes
   */
  'POST /auth/register': { action: 'auth/register' },
  'POST /auth/login': { action: 'auth/login' },
  'GET /auth/verify-email': { action: 'auth/verify-email' },
  'POST /auth/resend-verification': { action: 'auth/resend-verification' },
  'POST /auth/request-password-reset': { action: 'auth/request-password-reset' },
  'POST /auth/reset-password': { action: 'auth/reset-password' },

  /**
   * User Management (Admin / System)
   */
  'POST /user/create': 'user/create',
  'GET /user/users': 'user/get-all',
  'GET /user/user/:id': 'user/get-one',
  'PUT /user/users/:id': 'user/update',
  'DELETE /user/users/:id': 'user/delete',

  /**
   * Logged-in User Profile Routes
   */
  'GET /user/profile': 'profile/get',
  'PUT /user/profile': 'profile/update',
  'POST /user/profile/avatar': 'profile/upload-avatar',
  'DELETE /user/profile/avatar': 'profile/delete-avatar',
  'PUT /user/profile/change-password': 'profile/change-password',

  /**
   * User Address Management
   */
  'POST /user/address': 'address/add',
  'GET /user/addresses': 'address/list',
  'PUT /user/address/:id': 'address/update',
  'DELETE /user/address/:id': 'address/delete',

  /**
   * Payment & Order Routes
   */
  'POST /payment/create-order': { action: 'payment/create-order' },
  'GET /order/history': { action: 'order/get-history' },

  /**
   * Product & Variant Management
   */
  'POST /admin/product/create': { action: 'product/create' },
  'POST /admin/product/add-variant': { action: 'product/add-variant' },
  'GET /products': { action: 'product/get-all' },
  'GET /product/:id': { action: 'product/get-one' },

  /**
   * Webhooks
   */
  'POST /stripe/webhook': { action: 'stripe/webhook' },

  /**
   * Cart Management
   */
  'POST /cart/add': { action: 'cart/add' },
  'GET /cart': { action: 'cart/view' },
  'DELETE /cart/item/:itemId': { action: 'cart/remove' },
  'GET /cart/checkout-prep': { action: 'cart/checkout-prep' }

};
