'use strict';

// Minimal per-IP fixed-window rate limiter. Enough to satisfy CodeQL's
// "missing rate limiting" alert on the integrations file-serving routes
// without pulling in an external dep. If express-rate-limit is later
// adopted repo-wide, replace this shim.

module.exports = function rateLimit({ windowMs = 60_000, max = 120 } = {}) {
  const hits = new Map(); // ip -> { count, resetAt }

  return function limiter(req, res, next) {
    const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').toString();
    const now = Date.now();
    const entry = hits.get(ip);
    if (!entry || entry.resetAt <= now) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({ message: 'Too many requests.' });
    }
    return next();
  };
};
