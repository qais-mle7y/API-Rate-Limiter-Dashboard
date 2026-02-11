/**
 * Rate-limit tier definitions and API-key-to-tier resolution.
 *
 * Tiers determine the maximum number of requests a user may make within a
 * sliding 60-second window.  The tier is derived from the API key prefix.
 *
 * @module services/tierConfig
 */

/** @type {Record<string, { name: string, maxRequests: number, windowMs: number }>} */
const TIERS = {
  free: {
    name: 'free',
    maxRequests: 10,
    windowMs: 60_000, // 1 minute
  },
  premium: {
    name: 'premium',
    maxRequests: 100,
    windowMs: 60_000,
  },
};

/** Default tier applied when the key prefix is unrecognised. */
const DEFAULT_TIER = TIERS.free;

/**
 * Resolve a tier object from an API key string.
 *
 * Keys are expected to follow the pattern `<tier>-<identifier>`,
 * e.g. `free-user-1` or `premium-user-1`.
 *
 * @param {string} apiKey - The raw `x-api-key` header value.
 * @returns {{ name: string, maxRequests: number, windowMs: number }}
 *   The tier configuration for the given key.
 *
 * @example
 *   getTierForKey('premium-user-1');
 *   // => { name: 'premium', maxRequests: 100, windowMs: 60000 }
 */
function getTierForKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return DEFAULT_TIER;
  }
  const prefix = apiKey.split('-')[0].toLowerCase();
  return TIERS[prefix] || DEFAULT_TIER;
}

/**
 * Return a list of all known pre-set API keys (for the frontend tester).
 *
 * @returns {Array<{ key: string, tier: string }>}
 */
function getPresetKeys() {
  return [
    { key: 'free-user-1', tier: 'free' },
    { key: 'free-user-2', tier: 'free' },
    { key: 'premium-user-1', tier: 'premium' },
    { key: 'premium-user-2', tier: 'premium' },
  ];
}

module.exports = { TIERS, DEFAULT_TIER, getTierForKey, getPresetKeys };
