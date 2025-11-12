// scr-admin-vite/src/components/RevenueEstimator.jsx
import React, { useEffect, useState } from 'react'; // NEW: Added useState and useEffect for dynamic chart colors
import Card from './ui/card';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function RevenueEstimator() {
  // NEW: State for chart colors to update dynamically with dark/light mode toggle
  const [chartColors, setChartColors] = useState({
    textColor: '#343a40', // speedy-dark-neutral-700 (light mode default)
    secondaryTextColor: '#6c757d', // speedy-dark-neutral-500 (light mode default)
    gridColor: 'rgba(108, 117, 125, 0.2)', // speedy-dark-neutral-500 alpha
  });

  useEffect(() => {
    // Update chart colors when dark mode changes
    if (document.body.classList.contains('dark-mode')) {
      setChartColors({
        textColor: '#f0f4f8', // primary dark text color
        secondaryTextColor: '#adb5bd', // speedy-dark-neutral-400
        gridColor: 'rgba(173, 181, 189, 0.2)', // speedy-dark-neutral-400 alpha
      });
    } else {
      setChartColors({
        textColor: '#343a40',
        secondaryTextColor: '#6c757d',
        gridColor: 'rgba(108, 117, 125, 0.2)',
      });
    }
  }, [document.body.classList.contains('dark-mode')]); // Dependency on dark-mode class

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Actual Revenue',
        data: [10000, 12000, 11000, 13000, 15000, 14500],
        borderColor: '#007bff', // speedy-blue-500
        backgroundColor: 'rgba(0, 123, 255, 0.5)', // speedy-blue-500 with alpha
        tension: 0.1,
      },
      {
        label: 'Estimated Revenue',
        data: [11000, 12500, 11500, 13500, 16000, 15500],
        borderColor: '#28a745', // speedy-green-500
        backgroundColor: 'rgba(40, 167, 69, 0.5)', // speedy-green-500 with alpha
        borderDash: [5, 5],
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: chartColors.textColor, // Use dynamic color
        },
      },
      title: {
        display: true,
        text: 'Revenue Performance',
        color: chartColors.textColor, // Use dynamic color
      },
    },
    scales: {
      x: {
        ticks: {
          color: chartColors.secondaryTextColor, // Use dynamic color
        },
        grid: {
          color: chartColors.gridColor, // Use dynamic color
        },
      },
      y: {
        ticks: {
          color: chartColors.secondaryTextColor, // Use dynamic color
        },
        grid: {
          color: chartColors.gridColor, // Use dynamic color
        },
      },
    },
  };

  return (
    <Card className="h-96 flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Revenue Estimator</h3>
      <div className="flex-1">
        <Line data={data} options={options} />
      </div>
      <p className="text-sm text-speedy-dark-neutral-500 dark:text-speedy-dark-neutral-400 mt-4">
        Projected vs. Actual Revenue.
      </p>
    </Card>
  );
}

export default RevenueEstimator;