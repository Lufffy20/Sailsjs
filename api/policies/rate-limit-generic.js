/**
 * Rate Limiting Policy (Generic)
 *
 * Purpose:
 * Prevents abuse of sensitive endpoints (like login/register) by limiting
 * the number of requests per IP address within a specified time window.
 *
 * Configuration:
 * - Window: 15 minutes
 * - Limit: 5 requests
 *
 * Flow:
 * 1. Track request timestamps per IP address
 * 2. Filter out old timestamps outside the window
 * 3. Check if the IP has exceeded the allowed limit
 * 4. If limit exceeded, return 429 Too Many Requests
 * 5. If within limit, record new timestamp and allow request to proceed
 */

let attempts = {};

module.exports = async function (req, res, proceed) {

    const ip = req.ip;
    const now = Date.now();

    const WINDOW = 15 * 60 * 1000; // 15 min
    const LIMIT = 5;

    // Initialize if not exists
    if (!attempts[ip]) {
        attempts[ip] = [];
    }

    // Filter out old attempts
    attempts[ip] = attempts[ip].filter(t => now - t < WINDOW);

    // Check limit
    if (attempts[ip].length >= LIMIT) {
        return res.status(429).json({
            message: 'Too many attempts. Please try again later.'
        });
    }

    // Record new attempt
    attempts[ip].push(now);

    // Cleanup memory occasionally (optional optimization for long-running process)
    // For simplicity, we just let the filter handle per-IP cleanup on next request.

    return proceed();
};
