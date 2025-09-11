import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data, title }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
    <h3 className="font-bold mb-2 text-lg">{title}</h3>
    <Pie data={data} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
  </div>
);

export default PieChart;
