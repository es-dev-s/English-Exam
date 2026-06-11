/**
 * Simple in-memory sliding-window rate limiter for Express.
 * Suitable for single-instance deployments; use Redis for multi-instance production.
 */
export function createRateLimiter({
  windowMs,
  max,
  message = 'Too many requests. Please try again later.',
  keyGenerator = (req) => req.ip || req.socket?.remoteAddress || 'unknown',
  store = new Map(),
  now = () => Date.now(),
} = {}) {
  if (!windowMs || !max) {
    throw new Error('Rate limiter requires windowMs and max.');
  }

  return function rateLimit(req, res, next) {
    const key = keyGenerator(req);
    const currentTime = now();
    let entry = store.get(key);

    if (!entry || currentTime - entry.startedAt >= windowMs) {
      entry = { startedAt: currentTime, count: 0 };
      store.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > max) {
      const retryAfterMs = entry.startedAt + windowMs - currentTime;
      const retryAfterSec = Math.max(1, Math.ceil(retryAfterMs / 1000));
      res.set('Retry-After', String(retryAfterSec));
      return res.status(429).json({ error: message });
    }

    return next();
  };
}
