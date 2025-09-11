import React, { useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chart.js/auto';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

const chartTypes = [
  { label: 'Line', value: 'line' },
  { label: 'Bar', value: 'bar' },
  { label: 'Doughnut', value: 'doughnut' },
];

const periods = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
];

const UserAnalyticsChart = ({ data, darkMode }) => {
  const [chartType, setChartType] = useState('line');
  const [period, setPeriod] = useState(30);

  // Filter data by selected period
  const filteredData = data.slice(-period);
  const labels = filteredData.map(d => d.date);
  const userCounts = filteredData.map(d => d.totalUsers);
  const activeCounts = filteredData.map(d => d.activeUsers);
  const adminCounts = filteredData.map(d => d.admins);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Total Users',
        data: userCounts,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.2)',
        fill: true,
      },
      {
        label: 'Active Users',
        data: activeCounts,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.2)',
        fill: true,
      },
      {
        label: 'Admins',
        data: adminCounts,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.2)',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: darkMode ? '#fff' : '#222',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: { color: darkMode ? '#fff' : '#222' },
        grid: { color: darkMode ? '#444' : '#eee' },
      },
      y: {
        ticks: { color: darkMode ? '#fff' : '#222' },
        grid: { color: darkMode ? '#444' : '#eee' },
      },
    },
  };

  return (
    <div className={`rounded-xl p-6 shadow-lg ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} transition-colors duration-300 w-full`}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h3 className="text-lg font-bold">User Analytics</h3>
        <div className="flex gap-2">
          <select value={chartType} onChange={e => setChartType(e.target.value)} className="rounded px-2 py-1 dark:bg-gray-800 dark:text-white bg-gray-100 text-gray-900">
            {chartTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={period} onChange={e => setPeriod(Number(e.target.value))} className="rounded px-2 py-1 dark:bg-gray-800 dark:text-white bg-gray-100 text-gray-900">
            {periods.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>
      <div className="w-full h-72">
        {chartType === 'line' && <Line data={chartData} options={options} />}
        {chartType === 'bar' && <Bar data={chartData} options={options} />}
        {chartType === 'doughnut' && <Doughnut data={chartData} options={options} />}
      </div>
    </div>
  );
};

export default UserAnalyticsChart;
