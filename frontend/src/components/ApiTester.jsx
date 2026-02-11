/**
 * ApiTester – interactive panel for sending API requests and triggering
 * rate limits from the dashboard.
 */

import React, { useState, useCallback } from 'react';
import { sendApiRequest } from '../services/api';

const ENDPOINTS = [
  { value: '/api/data', label: 'GET /api/data', method: 'GET' },
  { value: '/api/users', label: 'GET /api/users', method: 'GET' },
  {
    value: '/api/echo',
    label: 'POST /api/echo',
    method: 'POST',
    body: { ping: 'pong' },
  },
];

const USERS = [
  { key: 'free-user-1', label: 'free-user-1  (Free)' },
  { key: 'free-user-2', label: 'free-user-2  (Free)' },
  { key: 'premium-user-1', label: 'premium-user-1  (Premium)' },
  { key: 'premium-user-2', label: 'premium-user-2  (Premium)' },
];

const MAX_LOG = 50;

export default function ApiTester() {
  const [endpoint, setEndpoint] = useState(ENDPOINTS[0]);
  const [user, setUser] = useState(USERS[0].key);
  const [log, setLog] = useState([]);
  const [sending, setSending] = useState(false);

  const appendLog = useCallback((entry) => {
    setLog((prev) => [entry, ...prev].slice(0, MAX_LOG));
  }, []);

  const fire = useCallback(
    async (count = 1) => {
      setSending(true);
      const promises = [];
      for (let i = 0; i < count; i++) {
        promises.push(
          sendApiRequest(endpoint.value, user, {
            method: endpoint.method,
            body: endpoint.body,
          })
        );
      }
      const results = await Promise.all(promises);
      results.forEach((r) => {
        appendLog({
          id: Date.now() + Math.random(),
          status: r.status,
          endpoint: endpoint.value,
          duration: r.duration,
          time: new Date().toLocaleTimeString(),
        });
      });
      setSending(false);
    },
    [endpoint, user, appendLog]
  );

  return (
    <div className="card">
      <div className="card-title">API Tester</div>
      <div className="tester-controls">
        <div className="tester-row">
          <label>Endpoint</label>
          <select
            className="tester-select"
            value={endpoint.value}
            onChange={(e) =>
              setEndpoint(ENDPOINTS.find((ep) => ep.value === e.target.value))
            }
          >
            {ENDPOINTS.map((ep) => (
              <option key={ep.value} value={ep.value}>
                {ep.label}
              </option>
            ))}
          </select>
        </div>

        <div className="tester-row">
          <label>API Key</label>
          <select
            className="tester-select"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          >
            {USERS.map((u) => (
              <option key={u.key} value={u.key}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        <div className="btn-row">
          <button
            className="btn btn-primary"
            disabled={sending}
            onClick={() => fire(1)}
          >
            {sending ? 'Sending...' : 'Send Request'}
          </button>
          <button
            className="btn btn-danger"
            disabled={sending}
            onClick={() => fire(20)}
          >
            Burst 20 Requests
          </button>
        </div>
      </div>

      {log.length > 0 && (
        <div className="response-log">
          {log.map((entry) => (
            <div key={entry.id} className="response-entry">
              <span
                className={`status-dot ${entry.status === 200 ? 'ok' : 'error'}`}
              />
              <span>{entry.status || 'ERR'}</span>
              <span style={{ color: 'var(--text-muted)' }}>
                {entry.endpoint}
              </span>
              <span className="response-time">{entry.duration}ms</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
