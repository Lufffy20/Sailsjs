/**
 * Admin Authorization Policy
 *
 * Purpose:
 * Restricts access to admin-only routes.
 * - Ensures the user is authenticated
 * - Allows access only to users with admin or superadmin role
 *
 * Flow:
 * 1. Check if user is authenticated (req.me exists)
 * 2. If not authenticated, return 401 Unauthorized
 * 3. Check if user role is admin or superadmin
 * 4. If role is not allowed, return 403 Forbidden
 * 5. If all checks pass, allow request to proceed
 */

module.exports = async function (req, res, proceed) {

    // Allowed admin roles
    const ROLES = {
        ADMIN: 'admin',
        SUPERADMIN: 'superadmin'
    };

    // Check authentication
    if (!req.me) {
        return res.status(401).json({
            status: false,
            code: 'UNAUTHENTICATED',
            message: 'Authentication required.'
        });
    }

    // Check authorization (admin access)
    if (![ROLES.ADMIN, ROLES.SUPERADMIN].includes(req.me.role)) {
        return res.status(403).json({
            status: false,
            code: 'ADMIN_ONLY',
            message: 'Admin access required.'
        });
    }

    // Allow request to continue
    return proceed();
};
