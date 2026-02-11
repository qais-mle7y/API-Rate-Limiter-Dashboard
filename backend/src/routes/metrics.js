/**
 * Metrics and Server-Sent Events (SSE) streaming routes.
 *
 * - `GET /metrics/snapshot` – returns a single JSON metrics snapshot.
 * - `GET /metrics/stream`   – opens an SSE connection that pushes a fresh
 *   snapshot every 2 seconds until the client disconnects.
 *
 * @module routes/metrics
 */

const { Router } = require('express');
const { getMetricsSnapshot } = require('../services/metricsStore');

const router = Router();

/** Interval (ms) between SSE pushes. */
const SSE_INTERVAL_MS = 2000;

/**
 * GET /metrics/snapshot
 * One-shot JSON metrics (useful for initial dashboard hydration).
 */
router.get('/snapshot', (_req, res) => {
  try {
    const snapshot = getMetricsSnapshot();
    res.json(snapshot);
  } catch (err) {
    console.error('[metrics/snapshot] Error:', err.message);
    res.status(500).json({ error: 'Failed to generate metrics snapshot' });
  }
});

/**
 * GET /metrics/stream
 * Server-Sent Events endpoint.  Pushes a `data: <JSON>\n\n` frame every
 * {@link SSE_INTERVAL_MS} milliseconds.
 */
router.get('/stream', (req, res) => {
  // SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // disable Nginx buffering if proxied
  });

  // Send an initial snapshot immediately
  const sendSnapshot = () => {
    try {
      const snapshot = getMetricsSnapshot();
      res.write(`data: ${JSON.stringify(snapshot)}\n\n`);
    } catch (err) {
      console.error('[metrics/stream] Error generating snapshot:', err.message);
    }
  };

  sendSnapshot();

  const intervalId = setInterval(sendSnapshot, SSE_INTERVAL_MS);

  // Clean up when the client disconnects
  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
  });
});

module.exports = router;
