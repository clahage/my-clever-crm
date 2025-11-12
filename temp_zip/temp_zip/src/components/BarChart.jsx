import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BarChart = ({ data, title }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
    <h3 className="font-bold mb-2 text-lg">{title}</h3>
    <Bar data={data} options={{ responsive: true, plugins: { legend: { display: false } } }} />
  </div>
);

export default BarChart;
