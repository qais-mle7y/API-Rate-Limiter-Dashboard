/**
 * Custom error classes for the API Rate Limiter.
 *
 * @module utils/errors
 */

/**
 * Error thrown when a client exceeds their rate limit.
 *
 * @class RateLimitError
 * @extends Error
 *
 * @example
 *   throw new RateLimitError('free-user-1', 30);
 */
class RateLimitError extends Error {
  /**
   * @param {string} userId - The identifier of the rate-limited user.
   * @param {number} retryAfter - Seconds until the client may retry.
   */
  constructor(userId, retryAfter) {
    super(`Rate limit exceeded for user: ${userId}`);
    this.name = 'RateLimitError';
    this.statusCode = 429;
    this.retryAfter = retryAfter;
    this.userId = userId;
  }
}

/**
 * Error thrown when an API key is missing or invalid.
 *
 * @class InvalidApiKeyError
 * @extends Error
 *
 * @example
 *   throw new InvalidApiKeyError('bad-key-123');
 */
class InvalidApiKeyError extends Error {
  /**
   * @param {string} [apiKey] - The invalid key that was provided (if any).
   */
  constructor(apiKey) {
    const detail = apiKey ? `Invalid API key: ${apiKey}` : 'Missing x-api-key header';
    super(detail);
    this.name = 'InvalidApiKeyError';
    this.statusCode = 401;
  }
}

module.exports = { RateLimitError, InvalidApiKeyError };
