/**
 * TopUsersTable – ranked table of users by request volume.
 *
 * Shows tier badges and highlights users who are currently rate-limited.
 */

import React from 'react';

/**
 * @param {{ topUsers: Array }} props
 */
export default function TopUsersTable({ topUsers }) {
  if (!topUsers || topUsers.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Top Users</div>
        <div className="empty-state">No user activity yet</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">Top Users</div>
      <table className="users-table">
        <thead>
          <tr>
            <th>#</th>
            <th>User</th>
            <th>Tier</th>
            <th>Total</th>
            <th>Accepted</th>
            <th>Rejected</th>
          </tr>
        </thead>
        <tbody>
          {topUsers.map((u, idx) => {
            const isLimited = u.rejected > 0;
            return (
              <tr key={u.userId}>
                <td>{idx + 1}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                  {u.userId}
                </td>
                <td>
                  <span className={`tier-badge ${u.tier}`}>{u.tier}</span>
                </td>
                <td>{u.total}</td>
                <td style={{ color: 'var(--accent-green)' }}>{u.allowed}</td>
                <td className={isLimited ? 'rate-limited' : ''}>
                  {u.rejected}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
