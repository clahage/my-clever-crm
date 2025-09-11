import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
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
  Title,
  Filler,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';
import { motion } from 'framer-motion';
import Particles from '@tsparticles/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import useSound from 'use-sound';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  Filler,
  zoomPlugin,
  annotationPlugin
);

const TIME_PERIODS = [
  { label: 'Last 3 Months', value: '3m' },
  { label: 'Last 6 Months', value: '6m' },
  { label: 'Year to Date', value: 'ytd' },
  { label: 'All Time', value: 'all' },
];

const CHART_TYPES = [
  { label: 'Line', value: 'line' },
  { label: 'Bar', value: 'bar' },
  { label: 'Area', value: 'area' },
];

const INDUSTRY_BENCHMARKS = {
  revenueGrowth: 8,
  conversionRate: 35,
  forecastAccuracy: 90,
};

function filterByPeriod(data, period, startDate, endDate) {
  if (!Array.isArray(data)) return [];
  if (period === 'all' && !startDate && !endDate) return data;
  const now = new Date();
  let start;
  switch (period) {
    case '3m':
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      break;
    case '6m':
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      break;
    case 'ytd':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = null;
  }
  return data.filter(item => {
    let d;
    if (/^[A-Za-z]{3}$/.test(item.label)) {
      d = new Date(`${now.getFullYear()}-${item.label}-01`);
    } else {
      d = new Date(item.label);
    }
    if (startDate && endDate) {
      return d >= startDate && d <= endDate;
    }
    if (start) {
      return d >= start && d <= now;
    }
    return true;
  });
}

// AI-powered insights (simple version)
function getInsights(revenueHistory) {
  if (!revenueHistory.length) return [];
  const last = revenueHistory[revenueHistory.length - 1];
  const prev = revenueHistory[revenueHistory.length - 2] || last;
  const trend = last.actual > prev.actual ? 'up' : last.actual < prev.actual ? 'down' : 'flat';
  const anomaly = last.actual > last.forecast * 1.2 ? 'High anomaly detected' : last.actual < last.forecast * 0.8 ? 'Low anomaly detected' : null;
  const recommendation = trend === 'up'
    ? 'Revenue is trending up. Consider investing in top-performing channels.'
    : trend === 'down'
    ? 'Revenue is trending down. Review conversion strategies.'
    : 'Revenue is stable. Maintain current strategies.';
  return [
    { label: 'Trend', value: trend },
    anomaly && { label: 'Anomaly', value: anomaly },
    { label: 'Recommendation', value: recommendation },
  ].filter(Boolean);
}

const chartOptions = (dynamicColor, darkMode, legendFilter, onChartClick) => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: 'category',
      grid: {
        color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
      },
      ticks: {
        color: darkMode ? '#fff' : '#666'
      }
    },
    y: {
      type: 'linear',
      beginAtZero: true,
      grid: {
        color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
      },
      ticks: {
        color: darkMode ? '#fff' : '#666'
      }
    }
  },
  plugins: {
    legend: {
      labels: {
        color: darkMode ? '#fff' : '#666',
        filter: legendFilter
      }
    }
  },
  onClick: onChartClick
});

function getDynamicColor(totalRevenue) {
  if (totalRevenue > 13000) return '#10b981';
  if (totalRevenue > 10000) return '#2563eb';
  return '#ef4444';
}

function getKPI(revenueHistory, conversionTrends, forecastAccuracy) {
  const totalRevenue = revenueHistory.reduce((sum, r) => sum + r.actual, 0);
  const revenueGrowth = revenueHistory.length > 1
    ? Math.round(((revenueHistory[revenueHistory.length - 1].actual - revenueHistory[0].actual) / revenueHistory[0].actual) * 100)
    : 0;
  const conversionRate = conversionTrends.length
    ? Math.round(conversionTrends.reduce((sum, c) => sum + c.rate, 0) / conversionTrends.length)
    : 0;
  const forecastAcc = forecastAccuracy.length
    ? Math.round(
        100 -
          (forecastAccuracy.reduce((sum, f) => sum + Math.abs(f.actual - f.predicted), 0) /
            forecastAccuracy.length /
            (forecastAccuracy.reduce((sum, f) => sum + f.actual, 0) / forecastAccuracy.length)) *
            100
      )
    : 0;
  return { totalRevenue, revenueGrowth, conversionRate, forecastAcc };
}

function AdvancedAnalytics({
  revenueHistory = [],
  forecastAccuracy = [],
  conversionTrends = [],
  leadSourceStats = [],
}) {
  // --- Enterprise Feature States ---
  const [period, setPeriod] = useState('3m');
  const [chartType, setChartType] = useState('line');
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [drillPath, setDrillPath] = useState([]);
  const [legendFilterState, setLegendFilterState] = useState({ revenue: [], accuracy: [], conversion: [], leadsource: [] });
  const [playClick] = useSound('/sounds/click.mp3', { volume: 0.3 });
  const [playSuccess] = useSound('/sounds/success.mp3', { volume: 0.3 });

  // Chart refs for export
  const revenueChartRef = useRef();
  const accuracyChartRef = useRef();
  const conversionChartRef = useRef();
  const leadSourceChartRef = useRef();

  // Simulate loading skeleton
  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  // Filtered data
  const filteredRevenue = useMemo(
    () => filterByPeriod(revenueHistory, period, startDate, endDate),
    [revenueHistory, period, startDate, endDate]
  );
  const filteredForecast = useMemo(
    () => filterByPeriod(forecastAccuracy, period, startDate, endDate),
    [forecastAccuracy, period, startDate, endDate]
  );
  const filteredConversion = useMemo(
    () => filterByPeriod(conversionTrends, period, startDate, endDate),
    [conversionTrends, period, startDate, endDate]
  );
  const filteredLeadSource = useMemo(
    () => filterByPeriod(leadSourceStats, period, startDate, endDate),
    [leadSourceStats, period, startDate, endDate]
  );

  // Dynamic color scheme
  const { totalRevenue, revenueGrowth, conversionRate, forecastAcc } = getKPI(
    filteredRevenue,
    filteredConversion,
    filteredForecast
  );
  const dynamicColor = getDynamicColor(totalRevenue);

  // --- Drill-down logic ---
  const handleChartClick = (event, elements, chartType) => {
    if (elements.length) {
      const idx = elements[0].index;
      setDrillPath([...drillPath, { chartType, idx }]);
      playClick();
    }
  };

  // --- Interactive legend logic ---
  const legendFilter = chartKey => idx => {
    setLegendFilterState(prev => {
      const arr = prev[chartKey] || [];
      return {
        ...prev,
        [chartKey]: arr.includes(idx) ? arr.filter(i => i !== idx) : [...arr, idx],
      };
    });
  };

  // --- Chart Data with legend filtering ---
  const revenueChartData = {
    labels: filteredRevenue.map(r => r.label),
    datasets: [
      {
        label: 'Actual Revenue',
        data: filteredRevenue.map(r => r.actual),
        borderColor: dynamicColor,
        backgroundColor: chartType === 'area' ? dynamicColor + '33' : dynamicColor + '22',
        fill: chartType === 'area',
        tension: 0.4,
        pointBackgroundColor: dynamicColor,
        pointRadius: 5,
        pointHoverRadius: 8,
        hidden: legendFilterState.revenue.includes(0),
      },
      {
        label: 'Forecasted Revenue',
        data: filteredRevenue.map(r => r.forecast),
        borderColor: '#10b981',
        backgroundColor: chartType === 'area' ? '#10b98133' : '#10b98122',
        fill: chartType === 'area',
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointRadius: 5,
        pointHoverRadius: 8,
        hidden: legendFilterState.revenue.includes(1),
      },
    ],
  };

  const accuracyChartData = {
    labels: filteredForecast.map(f => f.label),
    datasets: [
      {
        label: 'Actual',
        data: filteredForecast.map(f => f.actual),
        backgroundColor: dynamicColor + 'bb',
        borderColor: dynamicColor,
        type: 'bar',
        hidden: legendFilterState.accuracy.includes(0),
      },
      {
        label: 'Predicted',
        data: filteredForecast.map(f => f.predicted),
        backgroundColor: '#10b981bb',
        borderColor: '#10b981',
        type: 'bar',
        hidden: legendFilterState.accuracy.includes(1),
      },
    ],
  };

  const conversionChartData = {
    labels: filteredConversion.map(c => c.label),
    datasets: [
      {
        label: 'Conversion Rate (%)',
        data: filteredConversion.map(c => c.rate),
        borderColor: '#8b5cf6',
        backgroundColor: chartType === 'area' ? '#8b5cf633' : '#8b5cf622',
        fill: chartType === 'area',
        tension: 0.4,
        pointBackgroundColor: '#8b5cf6',
        pointRadius: 5,
        pointHoverRadius: 8,
        hidden: legendFilterState.conversion.includes(0),
      },
    ],
  };

  const leadSourceChartData = {
    labels: filteredLeadSource.map(l => l.source),
    datasets: [
      {
        label: 'Leads',
        data: filteredLeadSource.map(l => l.value),
        backgroundColor: [
          dynamicColor + 'bb',
          '#10b981bb',
          '#f59e42bb',
          '#8b5cf6bb',
          '#ef4444bb',
          '#6366f1bb',
        ],
        borderColor: [
          dynamicColor,
          '#10b981',
          '#f59e42',
          '#8b5cf6',
          '#ef4444',
          '#6366f1',
        ],
        borderWidth: 2,
        hoverOffset: 12,
        hidden: legendFilterState.leadsource.includes(0),
      },
    ],
  };

  // --- Chart Annotations ---
  const annotationConfig = {
    annotations: {
      line1: {
        type: 'line',
        scaleID: 'y',
        value: 10000,
        borderColor: 'red',
        borderWidth: 2,
        label: {
          content: 'Target',
          enabled: true,
          position: 'end',
          color: darkMode ? '#fff' : '#222',
        },
      },
    },
  };

  // --- AI-powered insights ---
  const insights = getInsights(filteredRevenue);

  // --- Export chart as PNG/PDF ---
  const exportChart = async (ref, type = 'png', chartName = 'chart') => {
    playClick();
    const chartElem = ref.current?.canvas;
    if (!chartElem) return;
    const canvas = await html2canvas(chartElem);
    if (type === 'png') {
      const link = document.createElement('a');
      link.download = `${chartName}.png`;
      link.href = canvas.toDataURL();
      link.click();
      playSuccess();
    } else {
      const pdf = new jsPDF();
      pdf.addImage(canvas.toDataURL(), 'PNG', 10, 10, 180, 100);
      pdf.save(`${chartName}.pdf`);
      playSuccess();
    }
  };

  // --- Real-time refresh ---
  const refreshData = () => {
    setRefreshing(true);
    playClick();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // --- Particle options ---
  const particlesOptions = {
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    particles: {
      color: { value: dynamicColor },
      links: { enable: true, color: dynamicColor, distance: 120 },
      move: { enable: true, speed: 1, direction: 'none', outModes: 'bounce' },
      number: { value: 20 },
      opacity: { value: 0.3 },
      shape: { type: 'circle' },
      size: { value: { min: 2, max: 6 } },
    },
    detectRetina: true,
  };

  // --- Animated loading skeletons ---
  if (loading) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`relative ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} rounded-2xl shadow-2xl p-8 mb-8 w-full max-w-7xl mx-auto border border-gray-200`}
        style={{
          background: darkMode
            ? 'linear-gradient(135deg, #222 0%, #333 100%)'
            : 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(16,185,129,0.12) 100%)',
          boxShadow: darkMode
            ? '0 8px 32px rgba(37,99,235,0.12), 0 1.5px 8px rgba(16,185,129,0.08)'
            : '0 8px 32px rgba(37,99,235,0.12), 0 1.5px 8px rgba(16,185,129,0.08)',
          overflow: 'hidden',
          transition: 'background 0.5s, color 0.5s',
        }}
        aria-label="Advanced Analytics"
      >
        <div className="flex flex-col gap-8">
          <div className="animate-pulse h-64 w-full flex items-center justify-center">
            <div className="rounded-2xl bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 w-full h-64" />
          </div>
          <div className="animate-pulse h-64 w-full flex items-center justify-center">
            <div className="rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 w-48 h-48" />
          </div>
        </div>
        <span className="ml-4 text-2xl font-bold">Loading Analytics...</span>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={`relative ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8 w-full max-w-7xl mx-auto border border-gray-200`}
      style={{
        background: darkMode
          ? 'linear-gradient(135deg, #222 0%, #333 100%)'
          : 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(16,185,129,0.12) 100%)',
        boxShadow: darkMode
          ? '0 8px 32px rgba(37,99,235,0.12), 0 1.5px 8px rgba(16,185,129,0.08)'
          : '0 8px 32px rgba(37,99,235,0.12), 0 1.5px 8px rgba(16,185,129,0.08)',
        overflow: 'hidden',
        transition: 'background 0.5s, color 0.5s',
      }}
      aria-label="Advanced Analytics"
    >
      {/* Particle Animation */}
      <Particles options={particlesOptions} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />

      {/* Dark Mode Toggle */}
      <button
        className="absolute top-4 left-4 z-30 p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-blue-100 dark:hover:bg-gray-700 transition"
        onClick={() => setDarkMode(dm => !dm)}
        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {darkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
        )}
      </button>

      {/* Executive Summary KPI Cards */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl p-4 shadow-lg"
        >
          <div className="text-lg font-bold dark:text-white">Total Revenue</div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-2xl dark:text-gray-100"
          >
            ${totalRevenue.toLocaleString()}
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-green-500 to-purple-500 text-white rounded-xl p-4 shadow-lg"
        >
          <div className="text-lg font-bold dark:text-white">Revenue Growth</div>
          <div className="text-2xl dark:text-gray-100">{revenueGrowth}%</div>
          <div className="text-xs dark:text-gray-100">Industry: {INDUSTRY_BENCHMARKS.revenueGrowth}%</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl p-4 shadow-lg"
        >
          <div className="text-lg font-bold dark:text-white">Conversion Rate</div>
          <div className="text-2xl dark:text-gray-100">{conversionRate}%</div>
          <div className="text-xs dark:text-gray-100">Industry: {INDUSTRY_BENCHMARKS.conversionRate}%</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-4 shadow-lg"
        >
          <div className="text-lg font-bold dark:text-white">Forecast Accuracy</div>
          <div className="text-2xl dark:text-gray-100">{forecastAcc}%</div>
          <div className="text-xs dark:text-gray-100">Industry: {INDUSTRY_BENCHMARKS.forecastAccuracy}%</div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="relative z-10 flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex space-x-2">
          {TIME_PERIODS.map(tp => (
            <button
              key={tp.value}
              className={
                period === tp.value
                  ? 'px-3 py-1 rounded font-semibold border bg-blue-600 text-white border-blue-600 shadow-lg'
                  : 'px-3 py-1 rounded font-semibold border bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50 transition-all duration-200'
              }
              onClick={() => { setPeriod(tp.value); playClick(); }}
              aria-pressed={period === tp.value}
            >
              {tp.label}
            </button>
          ))}
        </div>
        <div className="flex space-x-2 ml-2">
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Start Date"
            className="px-2 py-1 rounded border"
          />
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="End Date"
            className="px-2 py-1 rounded border"
          />
        </div>
        <div className="flex space-x-2 ml-2">
          {CHART_TYPES.map(ct => (
            <button
              key={ct.value}
              className={
                chartType === ct.value
                  ? 'px-3 py-1 rounded font-semibold border bg-purple-600 text-white border-purple-600 shadow-lg'
                  : 'px-3 py-1 rounded font-semibold border bg-gray-100 text-gray-700 border-gray-300 hover:bg-purple-50 transition-all duration-200'
              }
              onClick={() => { setChartType(ct.value); playClick(); }}
              aria-pressed={chartType === ct.value}
            >
              {ct.label}
            </button>
          ))}
        </div>
        <button
          className="px-3 py-1 rounded font-semibold border bg-green-600 text-white border-green-600 shadow-lg ml-2"
          onClick={refreshData}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Data Storytelling Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 via-green-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 shadow-lg dark:text-gray-100"
      >
        <h4 className="font-bold mb-2 dark:text-white">Data Storytelling</h4>
        <ol className="list-decimal ml-6 space-y-1">
          {insights.map((insight, idx) => (
            <li key={idx} className="text-base dark:text-gray-100">{insight.label}: {insight.value}</li>
          ))}
        </ol>
      </motion.div>

      {/* AI-powered Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-r from-blue-100 via-green-100 to-purple-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-xl p-4 shadow-lg flex items-center gap-2"
            style={{
              borderLeft: insight.label === 'Anomaly' ? '6px solid #ef4444' : '6px solid #2563eb',
              boxShadow: insight.label === 'Anomaly' ? '0 0 16px #ef4444' : '0 0 8px #2563eb',
            }}
          >
            <span className="font-bold text-lg dark:text-white">{insight.label}:</span>
            <span className="text-gray-800 dark:text-gray-100">{insight.value}</span>
            {insight.label === 'Trend' && (
              <span>
                {insight.value === 'up' ? '⬆️' : insight.value === 'down' ? '⬇️' : '➡️'}
              </span>
            )}
            {insight.label === 'Anomaly' && <span className="animate-pulse text-red-600 font-bold ml-2">!</span>}
          </div>
        ))}
      </motion.div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Revenue Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          whileHover={{ scale: 1.03, boxShadow: `0 0 32px ${dynamicColor}` }}
          className={`relative bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-xl p-6 shadow-xl glassmorphism ${darkMode ? 'bg-gray-800' : ''}`}
        >
          {/* Breadcrumbs for drill-down */}
          {drillPath.length > 0 && (
            <div className="mb-2 flex gap-2 items-center">
              <span className="font-semibold">Drill Path:</span>
              {drillPath.map((step, i) => (
                <button key={i} onClick={() => setDrillPath(drillPath.slice(0, i + 1))} className="text-blue-500 underline">
                  {step.chartType} {step.idx + 1}
                </button>
              ))}
            </div>
          )}
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <button
              className="p-2 rounded-full bg-white shadow hover:bg-blue-100 transition"
              title="Export PNG"
              onClick={() => exportChart(revenueChartRef, 'png', 'revenue')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
            </button>
            <button
              className="p-2 rounded-full bg-white shadow hover:bg-green-100 transition"
              title="Export PDF"
              onClick={() => exportChart(revenueChartRef, 'pdf', 'revenue')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-8m0 8l-4-4m4 4l4-4" />
              </svg>
            </button>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            Revenue Trends
            {insights[0]?.value === 'up' && <span className="text-green-500 animate-bounce">⬆️</span>}
            {insights[0]?.value === 'down' && <span className="text-red-500 animate-bounce">⬇️</span>}
          </h3>
          <div className="h-64" id="revenue-chart">
            {chartType === 'bar' ? (
              <Bar
                ref={revenueChartRef}
                data={revenueChartData}
                options={chartOptions(dynamicColor, darkMode, legendFilter('revenue'), (e, els) => handleChartClick(e, els, 'revenue'))}
              />
            ) : (
              <Line
                ref={revenueChartRef}
                data={revenueChartData}
                options={chartOptions(dynamicColor, darkMode, legendFilter('revenue'), (e, els) => handleChartClick(e, els, 'revenue'))}
              />
            )}
          </div>
        </motion.div>

        {/* Forecast Accuracy Chart */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          whileHover={{ scale: 1.03, boxShadow: '0 0 32px #10b981' }}
          className={`relative bg-gradient-to-br from-green-50 via-white to-purple-50 rounded-xl p-6 shadow-xl glassmorphism ${darkMode ? 'bg-gray-800' : ''}`}
        >
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <button
              className="p-2 rounded-full bg-white shadow hover:bg-blue-100 transition"
              title="Export PNG"
              onClick={() => exportChart(accuracyChartRef, 'png', 'accuracy')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
            </button>
            <button
              className="p-2 rounded-full bg-white shadow hover:bg-green-100 transition"
              title="Export PDF"
              onClick={() => exportChart(accuracyChartRef, 'pdf', 'accuracy')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-8m0 8l-4-4m4 4l4-4" />
              </svg>
            </button>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Forecast Accuracy</h3>
          <div className="h-64" id="accuracy-chart">
            <Bar
              ref={accuracyChartRef}
              data={accuracyChartData}
              options={chartOptions(dynamicColor, darkMode, legendFilter('accuracy'), (e, els) => handleChartClick(e, els, 'accuracy'))}
            />
          </div>
        </motion.div>

        {/* Conversion Rate Trends */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          whileHover={{ scale: 1.03, boxShadow: '0 0 32px #8b5cf6' }}
          className={`relative bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-xl p-6 shadow-xl glassmorphism ${darkMode ? 'bg-gray-800' : ''}`}
        >
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <button
              className="p-2 rounded-full bg-white shadow hover:bg-blue-100 transition"
              title="Export PNG"
              onClick={() => exportChart(conversionChartRef, 'png', 'conversion')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
            </button>
            <button
              className="p-2 rounded-full bg-white shadow hover:bg-green-100 transition"
              title="Export PDF"
              onClick={() => exportChart(conversionChartRef, 'pdf', 'conversion')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-8m0 8l-4-4m4 4l4-4" />
              </svg>
            </button>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Conversion Rate Trends</h3>
          <div className="h-64" id="conversion-chart">
            {chartType === 'bar' ? (
              <Bar
                ref={conversionChartRef}
                data={conversionChartData}
                options={chartOptions(dynamicColor, darkMode, legendFilter('conversion'), (e, els) => handleChartClick(e, els, 'conversion'))}
              />
            ) : (
              <Line
                ref={conversionChartRef}
                data={conversionChartData}
                options={chartOptions(dynamicColor, darkMode, legendFilter('conversion'), (e, els) => handleChartClick(e, els, 'conversion'))}
              />
            )}
          </div>
        </motion.div>

        {/* Lead Source Performance */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.03, boxShadow: '0 0 32px #6366f1' }}
          className={`relative bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-xl p-6 shadow-xl glassmorphism flex items-center justify-center ${darkMode ? 'bg-gray-800' : ''}`}
        >
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <button
              className="p-2 rounded-full bg-white shadow hover:bg-blue-100 transition"
              title="Export PNG"
              onClick={() => exportChart(leadSourceChartRef, 'png', 'leadsource')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
            </button>
            <button
              className="p-2 rounded-full bg-white shadow hover:bg-green-100 transition"
              title="Export PDF"
              onClick={() => exportChart(leadSourceChartRef, 'pdf', 'leadsource')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-8m0 8l-4-4m4 4l4-4" />
              </svg>
            </button>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Lead Source Performance</h3>
          <div className="h-64 flex items-center justify-center" id="leadsource-chart">
            <Pie
              ref={leadSourceChartRef}
              data={leadSourceChartData}
              options={chartOptions(dynamicColor, darkMode, legendFilter('leadsource'), (e, els) => handleChartClick(e, els, 'leadsource'))}
            />
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default AdvancedAnalytics;