/**
 * StatsCards – four summary metric cards displayed at the top of the dashboard.
 *
 * Cards: Total Requests, Accepted, Rejected, Rejection Rate (%).
 */

import React from 'react';

/**
 * @param {{ metrics: Object|null }} props
 */
export default function StatsCards({ metrics }) {
  const total = metrics?.totalRequests ?? 0;
  const allowed = metrics?.allowedRequests ?? 0;
  const rejected = metrics?.rejectedRequests ?? 0;
  const rate = metrics?.rejectionRate ?? 0;

  const cards = [
    {
      label: 'Total Requests',
      value: total.toLocaleString(),
      icon: '\u21C5',
      bg: 'var(--accent-blue-dim)',
      color: 'var(--accent-blue)',
    },
    {
      label: 'Accepted',
      value: allowed.toLocaleString(),
      icon: '\u2713',
      bg: 'var(--accent-green-dim)',
      color: 'var(--accent-green)',
    },
    {
      label: 'Rejected',
      value: rejected.toLocaleString(),
      icon: '\u2717',
      bg: 'var(--accent-red-dim)',
      color: 'var(--accent-red)',
    },
    {
      label: 'Rejection Rate',
      value: `${rate}%`,
      icon: '%',
      bg: 'var(--accent-amber-dim)',
      color: 'var(--accent-amber)',
    },
  ];

  return (
    <div className="stats-row">
      {cards.map((c) => (
        <div key={c.label} className="card stat-card">
          <div
            className="stat-icon"
            style={{ background: c.bg, color: c.color }}
          >
            {c.icon}
          </div>
          <span className="stat-label">{c.label}</span>
          <span className="stat-value" style={{ color: c.color }}>
            {c.value}
          </span>
        </div>
      ))}
    </div>
  );
}
