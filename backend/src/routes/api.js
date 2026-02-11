/**
 * Sample API endpoints protected by the rate limiter.
 *
 * These routes exist solely to demonstrate rate limiting behaviour.
 * Every request must include a valid `x-api-key` header.
 *
 * @module routes/api
 */

const { Router } = require('express');
const { createRateLimiter } = require('../middleware/rateLimiter');
const { getPresetKeys } = require('../services/tierConfig');

const router = Router();

// Apply rate limiter to all /api/* routes
router.use(createRateLimiter());

/**
 * GET /api/data
 * Returns a small mock dataset.
 */
router.get('/data', (_req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Server Alpha', region: 'us-east-1', load: 0.42 },
      { id: 2, name: 'Server Beta', region: 'eu-west-1', load: 0.78 },
      { id: 3, name: 'Server Gamma', region: 'ap-south-1', load: 0.15 },
    ],
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/users
 * Returns a mock user list.
 */
router.get('/users', (_req, res) => {
  res.json({
    success: true,
    users: [
      { id: 'u1', username: 'alice', role: 'admin' },
      { id: 'u2', username: 'bob', role: 'editor' },
      { id: 'u3', username: 'charlie', role: 'viewer' },
    ],
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/echo
 * Echoes the request body back to the caller.
 */
router.post('/echo', (req, res) => {
  res.json({
    success: true,
    echo: req.body,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/keys
 * Returns the preset API keys (for the frontend tester panel).
 */
router.get('/keys', (_req, res) => {
  res.json({ keys: getPresetKeys() });
});

module.exports = router;
