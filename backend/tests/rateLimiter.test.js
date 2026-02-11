/**
 * Unit tests for the sliding-window rate limiter and tier config.
 */

const request = require('supertest');
const app = require('../src/index');
const { resetWindowStore } = require('../src/middleware/rateLimiter');
const { reset: resetMetrics } = require('../src/services/metricsStore');
const { getTierForKey, TIERS } = require('../src/services/tierConfig');

beforeEach(() => {
  resetWindowStore();
  resetMetrics();
});

// ───────────────────────── Tier Config ─────────────────────────

describe('tierConfig – getTierForKey', () => {
  test('returns free tier for keys starting with "free-"', () => {
    const tier = getTierForKey('free-user-1');
    expect(tier.name).toBe('free');
    expect(tier.maxRequests).toBe(10);
  });

  test('returns premium tier for keys starting with "premium-"', () => {
    const tier = getTierForKey('premium-user-1');
    expect(tier.name).toBe('premium');
    expect(tier.maxRequests).toBe(100);
  });

  test('defaults to free tier for unknown prefixes', () => {
    const tier = getTierForKey('unknown-key-99');
    expect(tier.name).toBe('free');
  });

  test('defaults to free tier when key is empty/null', () => {
    expect(getTierForKey(null).name).toBe('free');
    expect(getTierForKey('').name).toBe('free');
    expect(getTierForKey(undefined).name).toBe('free');
  });
});

// ──────────────────── Rate Limiter Middleware ────────────────────

describe('rateLimiter – free tier (10/min)', () => {
  test('allows up to 10 requests for a free-tier user', async () => {
    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .get('/api/data')
        .set('x-api-key', 'free-user-1');
      expect(res.status).toBe(200);
    }
  });

  test('rejects the 11th request with 429', async () => {
    for (let i = 0; i < 10; i++) {
      await request(app).get('/api/data').set('x-api-key', 'free-user-1');
    }
    const res = await request(app)
      .get('/api/data')
      .set('x-api-key', 'free-user-1');

    expect(res.status).toBe(429);
    expect(res.body.error).toBe('RateLimitExceeded');
    expect(res.headers['retry-after']).toBeDefined();
    expect(res.headers['x-ratelimit-remaining']).toBe('0');
  });

  test('includes rate-limit headers on successful requests', async () => {
    const res = await request(app)
      .get('/api/data')
      .set('x-api-key', 'free-user-1');

    expect(res.headers['x-ratelimit-limit']).toBe('10');
    expect(res.headers['x-ratelimit-tier']).toBe('free');
    expect(Number(res.headers['x-ratelimit-remaining'])).toBeLessThanOrEqual(10);
  });
});

describe('rateLimiter – premium tier (100/min)', () => {
  test('allows more than 10 requests for a premium-tier user', async () => {
    for (let i = 0; i < 20; i++) {
      const res = await request(app)
        .get('/api/data')
        .set('x-api-key', 'premium-user-1');
      expect(res.status).toBe(200);
    }
  });
});

describe('rateLimiter – missing API key', () => {
  test('returns 401 when x-api-key header is absent', async () => {
    const res = await request(app).get('/api/data');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('InvalidApiKeyError');
  });
});

// ─────────────── Per-user isolation ───────────────

describe('rateLimiter – user isolation', () => {
  test('limits are tracked independently per user', async () => {
    // Exhaust free-user-1
    for (let i = 0; i < 10; i++) {
      await request(app).get('/api/data').set('x-api-key', 'free-user-1');
    }
    // free-user-2 should still be allowed
    const res = await request(app)
      .get('/api/data')
      .set('x-api-key', 'free-user-2');
    expect(res.status).toBe(200);
  });
});
