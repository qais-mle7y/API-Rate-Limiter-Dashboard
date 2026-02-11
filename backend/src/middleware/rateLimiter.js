/**
 * Sliding-window rate limiter middleware.
 *
 * For each incoming request the middleware:
 *   1. Extracts the user identity from the `x-api-key` header.
 *   2. Resolves the applicable tier (free / premium).
 *   3. Prunes timestamps outside the current window.
 *   4. Accepts or rejects the request based on the remaining budget.
 *   5. Logs the outcome to the shared metrics store.
 *
 * @module middleware/rateLimiter
 */

const { getTierForKey } = require('../services/tierConfig');
const { logRequest } = require('../services/metricsStore');
const { RateLimitError, InvalidApiKeyError } = require('../utils/errors');

/**
 * In-memory sliding window store.
 * Maps each userId to an ordered array of request timestamps (epoch ms).
 *
 * @type {Map<string, number[]>}
 */
const windowStore = new Map();

/**
 * Remove timestamps older than `windowMs` from a user's log.
 *
 * @param {number[]} timestamps - Mutable array of epoch-ms values.
 * @param {number} windowMs    - Size of the sliding window in ms.
 * @returns {number[]} The same array reference, pruned in-place.
 */
function pruneWindow(timestamps, windowMs) {
  const cutoff = Date.now() - windowMs;
  // Binary-search–style splice: timestamps are in ascending order.
  let i = 0;
  while (i < timestamps.length && timestamps[i] < cutoff) {
    i++;
  }
  if (i > 0) {
    timestamps.splice(0, i);
  }
  return timestamps;
}

/**
 * Express middleware factory.
 *
 * @returns {import('express').RequestHandler}
 *
 * @example
 *   const { createRateLimiter } = require('./middleware/rateLimiter');
 *   app.use('/api', createRateLimiter());
 */
function createRateLimiter() {
  return (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      const err = new InvalidApiKeyError();
      return next(err);
    }

    const tier = getTierForKey(apiKey);
    const userId = apiKey;

    // Initialise or retrieve the user's timestamp log
    if (!windowStore.has(userId)) {
      windowStore.set(userId, []);
    }
    const timestamps = windowStore.get(userId);
    pruneWindow(timestamps, tier.windowMs);

    const endpoint = req.originalUrl || req.url;
    const now = Date.now();

    if (timestamps.length >= tier.maxRequests) {
      // --- REJECTED ---
      const oldestInWindow = timestamps[0] || now;
      const retryAfter = Math.ceil((oldestInWindow + tier.windowMs - now) / 1000);

      logRequest({
        timestamp: now,
        userId,
        endpoint,
        status: 'rejected',
        tier: tier.name,
      });

      res.set('Retry-After', String(retryAfter));
      res.set('X-RateLimit-Limit', String(tier.maxRequests));
      res.set('X-RateLimit-Remaining', '0');
      res.set('X-RateLimit-Tier', tier.name);

      return res.status(429).json({
        error: 'RateLimitExceeded',
        message: `Rate limit exceeded. Try again in ${retryAfter}s.`,
        retryAfter,
        tier: tier.name,
        limit: tier.maxRequests,
      });
    }

    // --- ALLOWED ---
    timestamps.push(now);

    logRequest({
      timestamp: now,
      userId,
      endpoint,
      status: 'allowed',
      tier: tier.name,
    });

    res.set('X-RateLimit-Limit', String(tier.maxRequests));
    res.set('X-RateLimit-Remaining', String(tier.maxRequests - timestamps.length));
    res.set('X-RateLimit-Tier', tier.name);

    next();
  };
}

/**
 * Clear the sliding window store (useful for testing).
 *
 * @returns {void}
 */
function resetWindowStore() {
  windowStore.clear();
}

module.exports = { createRateLimiter, resetWindowStore, pruneWindow };
