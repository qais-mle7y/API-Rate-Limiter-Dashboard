/**
 * Integration tests for the sample API endpoints and metrics routes.
 */

const request = require('supertest');
const app = require('../src/index');
const { resetWindowStore } = require('../src/middleware/rateLimiter');
const { reset: resetMetrics } = require('../src/services/metricsStore');

beforeEach(() => {
  resetWindowStore();
  resetMetrics();
});

// ───────────────────────── GET /api/data ─────────────────────────

describe('GET /api/data', () => {
  test('returns a JSON payload with a data array', async () => {
    const res = await request(app)
      .get('/api/data')
      .set('x-api-key', 'free-user-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.timestamp).toBeDefined();
  });
});

// ───────────────────────── GET /api/users ─────────────────────────

describe('GET /api/users', () => {
  test('returns a JSON payload with a users array', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('x-api-key', 'premium-user-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.users)).toBe(true);
  });
});

// ───────────────────────── POST /api/echo ─────────────────────────

describe('POST /api/echo', () => {
  test('echoes the request body', async () => {
    const payload = { message: 'hello', value: 42 };

    const res = await request(app)
      .post('/api/echo')
      .set('x-api-key', 'free-user-1')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.echo).toEqual(payload);
  });
});

// ────────────────────── GET /metrics/snapshot ──────────────────────

describe('GET /metrics/snapshot', () => {
  test('returns a valid metrics snapshot', async () => {
    // Make a few requests first
    await request(app).get('/api/data').set('x-api-key', 'free-user-1');
    await request(app).get('/api/data').set('x-api-key', 'free-user-1');

    const res = await request(app).get('/metrics/snapshot');

    expect(res.status).toBe(200);
    expect(res.body.totalRequests).toBe(2);
    expect(res.body.allowedRequests).toBe(2);
    expect(res.body.rejectedRequests).toBe(0);
    expect(res.body.rejectionRate).toBe(0);
    expect(Array.isArray(res.body.timeline)).toBe(true);
    expect(Array.isArray(res.body.topUsers)).toBe(true);
    expect(res.body.generatedAt).toBeDefined();
  });

  test('tracks rejected requests in the snapshot', async () => {
    // Exhaust free-user-1 limit
    for (let i = 0; i < 10; i++) {
      await request(app).get('/api/data').set('x-api-key', 'free-user-1');
    }
    // This one should be rejected
    await request(app).get('/api/data').set('x-api-key', 'free-user-1');

    const res = await request(app).get('/metrics/snapshot');

    expect(res.status).toBe(200);
    expect(res.body.totalRequests).toBe(11);
    expect(res.body.allowedRequests).toBe(10);
    expect(res.body.rejectedRequests).toBe(1);
    expect(res.body.rejectionRate).toBeGreaterThan(0);
  });
});

// ───────────────────────── GET /health ─────────────────────────

describe('GET /health', () => {
  test('returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
  });
});
