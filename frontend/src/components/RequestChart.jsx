/**
 * RequestChart – Line chart showing accepted vs. rejected requests over time.
 *
 * Uses 10-second buckets across a 5-minute rolling window.
 */

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

/**
 * @param {{ timeline: Array }} props
 */
export default function RequestChart({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Requests Over Time</div>
        <div className="empty-state">Waiting for data...</div>
      </div>
    );
  }

  // Show only the last 30 buckets (5 min of 10s buckets)
  const sliced = timeline.slice(-30);

  const labels = sliced.map((b) => {
    const d = new Date(b.time);
    return d.toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Accepted',
        data: sliced.map((b) => b.allowed),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
      {
        label: 'Rejected',
        data: sliced.map((b) => b.rejected),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#8b8fa3', font: { size: 11 }, usePointStyle: true },
      },
      tooltip: {
        backgroundColor: '#1e2230',
        borderColor: '#2a2e3d',
        borderWidth: 1,
        titleColor: '#e4e6ef',
        bodyColor: '#8b8fa3',
      },
    },
    scales: {
      x: {
        ticks: { color: '#5c6078', font: { size: 10 }, maxRotation: 0 },
        grid: { color: 'rgba(42,46,61,0.5)' },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#5c6078', font: { size: 10 }, precision: 0 },
        grid: { color: 'rgba(42,46,61,0.5)' },
      },
    },
  };

  return (
    <div className="card">
      <div className="card-title">Requests Over Time</div>
      <div className="chart-wrapper">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
