module.exports = async function (req, res, proceed) {

    const ROLES = {
        ADMIN: 'admin',
        SUPERADMIN: 'superadmin'
    };

    if (!req.me) {
        return res.status(401).json({
            status: false,
            code: 'UNAUTHENTICATED',
            message: 'Authentication required.'
        });
    }

    if (![ROLES.ADMIN, ROLES.SUPERADMIN].includes(req.me.role)) {
        return res.status(403).json({
            status: false,
            code: 'ADMIN_ONLY',
            message: 'Admin access required.'
        });
    }

    return proceed();
};
