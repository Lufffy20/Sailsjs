module.exports.routes = {

  '/': { view: 'pages/homepage' },

  'POST /auth/register': { action: 'auth/register' },
  'POST /auth/login': { action: 'auth/login' },
  'GET /auth/verify-email': { action: 'auth/verify-email' },
  'POST /auth/resend-verification': { action: 'auth/resend-verification' },

  'POST /user/create': 'user/create',
  'GET /user/users': 'user/get-all',
  'GET /user/user/:id': 'user/get-one',
  'PUT /user/users/:id': 'user/update',
  'DELETE /user/users/:id': 'user/delete',

  'GET /user/profile': 'profile/get',
  'PUT /user/profile': 'profile/update',
  'POST /user/profile/avatar': 'profile/upload-avatar',
  'DELETE /user/profile/avatar': 'profile/delete-avatar',
  'PUT /user/profile/change-password': 'profile/change-password',

  'POST /auth/request-password-reset': { action: 'auth/request-password-reset' },
  'POST /auth/reset-password': { action: 'auth/reset-password' },

};
