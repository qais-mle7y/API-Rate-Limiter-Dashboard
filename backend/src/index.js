/**
 * Express application entry point.
 *
 * Configures middleware (CORS, JSON parsing) and mounts route handlers
 * for the sample API endpoints and the metrics / SSE stream.
 *
 * @module index
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const apiRoutes = require('./routes/api');
const metricsRoutes = require('./routes/metrics');

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// --------------- Middleware ---------------

app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-api-key'],
  })
);

app.use(express.json());

// --------------- Routes ---------------

app.use('/api', apiRoutes);
app.use('/metrics', metricsRoutes);

// --------------- Health check ---------------

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// --------------- Global error handler ---------------

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(`[ERROR] ${err.name}: ${err.message}`);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred',
    ...(err.retryAfter != null && { retryAfter: err.retryAfter }),
  });
});

// --------------- Start server ---------------

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Rate Limiter API running on http://localhost:${PORT}`);
    console.log(`   CORS origin: ${CORS_ORIGIN}`);
  });
}

module.exports = app;
