import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AnalyticsChart = ({ data, title }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
    <h3 className="font-bold mb-2 text-lg">{title}</h3>
    <Line data={data} options={{ responsive: true, plugins: { legend: { display: false } } }} />
  </div>
);

export default AnalyticsChart;
