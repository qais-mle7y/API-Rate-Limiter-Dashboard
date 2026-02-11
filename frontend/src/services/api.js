/**
 * Lightweight HTTP helpers for talking to the rate-limiter backend.
 *
 * @module services/api
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Send a request to one of the sample API endpoints.
 *
 * @param {string} endpoint - Path such as `/api/data`.
 * @param {string} apiKey   - Value for the `x-api-key` header.
 * @param {Object} [options] - Extra fetch options (method, body, etc.).
 * @returns {Promise<{ status: number, data: any, duration: number }>}
 */
export async function sendApiRequest(endpoint, apiKey, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const method = options.method || 'GET';

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  };

  const start = performance.now();

  try {
    const res = await fetch(url, {
      method,
      headers,
      ...(method === 'POST' && options.body
        ? { body: JSON.stringify(options.body) }
        : {}),
    });

    const data = await res.json();
    const duration = Math.round(performance.now() - start);

    return { status: res.status, data, duration };
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    return {
      status: 0,
      data: { error: 'NetworkError', message: err.message },
      duration,
    };
  }
}

/**
 * Fetch a single metrics snapshot.
 *
 * @returns {Promise<Object>} The metrics snapshot JSON.
 */
export async function fetchMetricsSnapshot() {
  const res = await fetch(`${API_BASE}/metrics/snapshot`);
  return res.json();
}

/**
 * Return the SSE stream URL.
 *
 * @returns {string}
 */
export function getStreamUrl() {
  return `${API_BASE}/metrics/stream`;
}
