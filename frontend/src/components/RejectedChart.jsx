/**
 * RejectedChart – Doughnut chart breaking down rejected requests by tier.
 */

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const TIER_COLORS = {
  free: { bg: '#f59e0b', border: '#d97706' },
  premium: { bg: '#a855f7', border: '#9333ea' },
};

/**
 * @param {{ rejectionsByTier: Record<string, number> }} props
 */
export default function RejectedChart({ rejectionsByTier }) {
  const tiers = Object.keys(rejectionsByTier || {});
  const hasData = tiers.length > 0 && tiers.some((t) => rejectionsByTier[t] > 0);

  if (!hasData) {
    return (
      <div className="card">
        <div className="card-title">Rejections by Tier</div>
        <div className="empty-state">No rejections yet</div>
      </div>
    );
  }

  const labels = tiers.map((t) => t.charAt(0).toUpperCase() + t.slice(1));
  const values = tiers.map((t) => rejectionsByTier[t]);
  const bgColors = tiers.map((t) => TIER_COLORS[t]?.bg || '#6b7280');
  const borderColors = tiers.map((t) => TIER_COLORS[t]?.border || '#4b5563');

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#8b8fa3',
          font: { size: 11 },
          usePointStyle: true,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#1e2230',
        borderColor: '#2a2e3d',
        borderWidth: 1,
        titleColor: '#e4e6ef',
        bodyColor: '#8b8fa3',
      },
    },
  };

  return (
    <div className="card">
      <div className="card-title">Rejections by Tier</div>
      <div className="chart-wrapper">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}
