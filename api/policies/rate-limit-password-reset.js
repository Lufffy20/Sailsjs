let attempts = {};

module.exports = async function (req, res, proceed) {

    const ip = req.ip;
    const now = Date.now();

    const WINDOW = 15 * 60 * 1000; // 15 min
    const LIMIT = 5;

    attempts[ip] = (attempts[ip] || []).filter(t => now - t < WINDOW);

    if (attempts[ip].length >= LIMIT) {
        return res.status(429).json({
            message: 'Too many password reset attempts. Try again later.'
        });
    }

    attempts[ip].push(now);
    return proceed();
};
