/**
 * App – root component.  Sets up the SSE connection and renders the
 * application header + Dashboard.
 */

import React from 'react';
import useMetricsSSE from './hooks/useMetricsSSE';
import Dashboard from './components/Dashboard';

export default function App() {
  const { metrics, connected } = useMetricsSSE();

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <span>Rate&nbsp;Limiter</span> Dashboard
        </h1>
        <div className={`connection-badge ${connected ? '' : 'disconnected'}`}>
          <span className="connection-dot" />
          {connected ? 'Live' : 'Reconnecting...'}
        </div>
      </header>

      <Dashboard metrics={metrics} />
    </div>
  );
}
