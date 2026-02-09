/**
 * Rate Limiting Policy for Password Reset
 *
 * Purpose:
 * Prevents abuse of the password reset functionality by limiting the number of
 * password reset requests per IP address within a specified time window.
 *
 * Flow:
 * 1. Track password reset attempts per IP address
 * 2. Check if the IP has exceeded the allowed limit
 * 3. If limit exceeded, return 429 Too Many Requests
 * 4. If within limit, allow request to proceed
 */

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
