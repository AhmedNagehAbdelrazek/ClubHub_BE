/**
 * Simple in-memory rate limiter.
 * Limits requests per IP within a sliding time window.
 */

const rateLimitStore = new Map();

/**
 * Create a rate limiter middleware.
 * @param {number} windowMs - Time window in milliseconds.
 * @param {number} maxRequests - Maximum number of requests allowed per IP per window.
 * @returns {function} Express middleware.
 */
function rateLimitMiddleware(windowMs, maxRequests) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    const now = Date.now();
    const windowStart = now - windowMs;

    let timestamps = rateLimitStore.get(ip);
    if (!timestamps) {
      timestamps = [];
      rateLimitStore.set(ip, timestamps);
    }

    // Remove timestamps older than window
    timestamps = timestamps.filter((ts) => ts > windowStart);
    rateLimitStore.set(ip, timestamps);

    if (timestamps.length >= maxRequests) {
      return res.status(429).json({
        status: 'error',
        message: 'Too many requests, please try again later.',
        retryAfter: Math.ceil((timestamps[0] + windowMs - now) / 1000),
      });
    }

    timestamps.push(now);
    next();
  };
}

module.exports = rateLimitMiddleware;
