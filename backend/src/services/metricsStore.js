/**
 * In-memory metrics store for tracking API request activity.
 *
 * Maintains a rolling 5-minute window of request log entries and exposes
 * helper methods that aggregate the data into dashboard-friendly snapshots.
 *
 * @module services/metricsStore
 */

/** How long to keep individual log entries (5 minutes). */
const RETENTION_MS = 5 * 60 * 1000;

/** Width of each time bucket used for the timeline chart (10 seconds). */
const BUCKET_MS = 10 * 1000;

/**
 * @typedef {Object} LogEntry
 * @property {number}  timestamp - Unix epoch ms when the request arrived.
 * @property {string}  userId    - The API key / user identifier.
 * @property {string}  endpoint  - The request path, e.g. `/api/data`.
 * @property {'allowed'|'rejected'} status - Whether the request was allowed.
 * @property {string}  tier      - The tier name (`free` | `premium`).
 */

/** @type {LogEntry[]} */
let requestLog = [];

/**
 * Remove entries older than the retention window.
 *
 * @returns {void}
 */
function prune() {
  const cutoff = Date.now() - RETENTION_MS;
  requestLog = requestLog.filter((entry) => entry.timestamp >= cutoff);
}

/**
 * Record a new request event.
 *
 * @param {LogEntry} entry - The request details to log.
 * @returns {void}
 *
 * @example
 *   logRequest({
 *     timestamp: Date.now(),
 *     userId: 'free-user-1',
 *     endpoint: '/api/data',
 *     status: 'allowed',
 *     tier: 'free',
 *   });
 */
function logRequest(entry) {
  requestLog.push(entry);
  // Prune lazily – only when the log gets large
  if (requestLog.length > 5000) {
    prune();
  }
}

/**
 * Build time-bucketed counts of allowed vs. rejected requests.
 *
 * @returns {Array<{ time: string, allowed: number, rejected: number }>}
 *   One entry per 10-second bucket covering the last 5 minutes.
 */
function getTimeline() {
  prune();
  const now = Date.now();
  const bucketCount = Math.ceil(RETENTION_MS / BUCKET_MS);
  const startTime = now - RETENTION_MS;

  /** @type {Map<number, { allowed: number, rejected: number }>} */
  const buckets = new Map();

  for (let i = 0; i < bucketCount; i++) {
    const bucketStart = startTime + i * BUCKET_MS;
    buckets.set(bucketStart, { allowed: 0, rejected: 0 });
  }

  for (const entry of requestLog) {
    const bucketStart =
      startTime + Math.floor((entry.timestamp - startTime) / BUCKET_MS) * BUCKET_MS;
    const bucket = buckets.get(bucketStart);
    if (bucket) {
      bucket[entry.status === 'allowed' ? 'allowed' : 'rejected'] += 1;
    }
  }

  const timeline = [];
  for (const [ts, counts] of buckets) {
    timeline.push({
      time: new Date(ts).toISOString(),
      ...counts,
    });
  }
  return timeline;
}

/**
 * Aggregate rejection counts grouped by tier.
 *
 * @returns {Record<string, number>} e.g. `{ free: 12, premium: 3 }`
 */
function getRejectionsByTier() {
  prune();
  const result = {};
  for (const entry of requestLog) {
    if (entry.status === 'rejected') {
      result[entry.tier] = (result[entry.tier] || 0) + 1;
    }
  }
  return result;
}

/**
 * Rank users by total request count (descending).
 *
 * @param {number} [limit=10] - Maximum number of users to return.
 * @returns {Array<{ userId: string, tier: string, total: number, allowed: number, rejected: number }>}
 */
function getTopUsers(limit = 10) {
  prune();
  /** @type {Map<string, { tier: string, allowed: number, rejected: number }>} */
  const users = new Map();

  for (const entry of requestLog) {
    if (!users.has(entry.userId)) {
      users.set(entry.userId, { tier: entry.tier, allowed: 0, rejected: 0 });
    }
    const u = users.get(entry.userId);
    if (entry.status === 'allowed') {
      u.allowed += 1;
    } else {
      u.rejected += 1;
    }
  }

  return [...users.entries()]
    .map(([userId, data]) => ({
      userId,
      tier: data.tier,
      total: data.allowed + data.rejected,
      allowed: data.allowed,
      rejected: data.rejected,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

/**
 * Return a full dashboard-ready metrics snapshot.
 *
 * @returns {{
 *   totalRequests: number,
 *   allowedRequests: number,
 *   rejectedRequests: number,
 *   rejectionRate: number,
 *   timeline: Array,
 *   rejectionsByTier: Record<string, number>,
 *   topUsers: Array,
 *   generatedAt: string,
 * }}
 */
function getMetricsSnapshot() {
  prune();
  const allowed = requestLog.filter((e) => e.status === 'allowed').length;
  const rejected = requestLog.filter((e) => e.status === 'rejected').length;
  const total = allowed + rejected;

  return {
    totalRequests: total,
    allowedRequests: allowed,
    rejectedRequests: rejected,
    rejectionRate: total > 0 ? parseFloat(((rejected / total) * 100).toFixed(1)) : 0,
    timeline: getTimeline(),
    rejectionsByTier: getRejectionsByTier(),
    topUsers: getTopUsers(),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Clear all stored metrics (useful for testing).
 *
 * @returns {void}
 */
function reset() {
  requestLog = [];
}

module.exports = {
  logRequest,
  getTimeline,
  getRejectionsByTier,
  getTopUsers,
  getMetricsSnapshot,
  reset,
};
