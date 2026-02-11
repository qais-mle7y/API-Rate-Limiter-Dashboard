/**
 * Dashboard – main container that assembles all dashboard widgets
 * into a responsive grid layout.
 */

import React from 'react';
import StatsCards from './StatsCards';
import RequestChart from './RequestChart';
import RejectedChart from './RejectedChart';
import TopUsersTable from './TopUsersTable';
import ApiTester from './ApiTester';

/**
 * @param {{ metrics: Object|null }} props
 */
export default function Dashboard({ metrics }) {
  return (
    <div className="dashboard">
      {/* Row 1 – Summary stat cards */}
      <StatsCards metrics={metrics} />

      {/* Row 2 – Charts */}
      <div className="charts-row">
        <RequestChart timeline={metrics?.timeline} />
        <RejectedChart rejectionsByTier={metrics?.rejectionsByTier} />
      </div>

      {/* Row 3 – Table + Tester */}
      <div className="bottom-row">
        <TopUsersTable topUsers={metrics?.topUsers} />
        <ApiTester />
      </div>
    </div>
  );
}
