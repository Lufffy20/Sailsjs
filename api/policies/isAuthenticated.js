const jwt = require('jsonwebtoken');

module.exports = async function (req, res, next) {

    // Safety check
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            message: 'JWT secret not configured'
        });
    }

    // Authorization header check
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Authorization header missing or invalid format. Use: Bearer <token>'
        });
    }

    // Token extract
    const token = authHeader.split(' ')[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check user in DB
        const user = await User.findOne({ id: decoded.id });
        if (!user) {
            return res.status(401).json({
                message: 'Invalid token. User not found.'
            });
        }

        // Check verification token status (optional enhancement: ensure verified)
        // ...

        // Check for token invalidation (single session)
        if (user.lastTokenIssuedAt) {
            // JWT iat is in seconds. Convert user.lastTokenIssuedAt to check.
            // We give a 1-second buffer because JWT iat is floor(seconds) while lastTokenIssuedAt is ms.
            // If token IAT (ms) < lastTokenIssuedAt - 1000, it's definitely from a previous login.
            const tokenTime = decoded.iat * 1000;
            if (tokenTime < (user.lastTokenIssuedAt - 1000)) {
                return res.status(401).json({
                    message: 'Token expired or invalidated. Please login again.'
                });
            }
        }

        // Attach user to request
        req.me = user;

        // Allow request
        return next();

    } catch (err) {
        return res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
};
