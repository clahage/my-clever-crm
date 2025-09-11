import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Title } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Title);

// Example Firestore schema for reference
// creditScores: {
//   clientId: string,
//   date: timestamp,
//   experian: number,
//   equifax: number,
//   transunion: number,
//   notes: string,
//   disputesActive: number
// }

const SCORE_COLORS = score => {
  if (score >= 750) return '#10b981'; // green
  if (score >= 650) return '#f59e42'; // yellow
  return '#ef4444'; // red
};

function CreditScoreTracker({ scoreHistory = [], goal = 750 }) {
  const [newScores, setNewScores] = useState({ experian: '', equifax: '', transunion: '', notes: '' });
  const [selectedDate, setSelectedDate] = useState('');

  // Prepare chart data
  const chartData = useMemo(() => {
    const labels = scoreHistory.map(s => new Date(s.date).toLocaleDateString());
    return {
      labels,
      datasets: [
        {
          label: 'Experian',
          data: scoreHistory.map(s => s.experian),
          borderColor: '#6366f1',
          backgroundColor: '#6366f133',
          pointBackgroundColor: scoreHistory.map(s => SCORE_COLORS(s.experian)),
          tension: 0.4,
        },
        {
          label: 'Equifax',
          data: scoreHistory.map(s => s.equifax),
          borderColor: '#8b5cf6',
          backgroundColor: '#8b5cf633',
          pointBackgroundColor: scoreHistory.map(s => SCORE_COLORS(s.equifax)),
          tension: 0.4,
        },
        {
          label: 'TransUnion',
          data: scoreHistory.map(s => s.transunion),
          borderColor: '#10b981',
          backgroundColor: '#10b98133',
          pointBackgroundColor: scoreHistory.map(s => SCORE_COLORS(s.transunion)),
          tension: 0.4,
        },
      ],
    };
  }, [scoreHistory]);

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#333' } },
      title: { display: true, text: 'Credit Score Progression' },
    },
    scales: {
      y: {
        min: 300,
        max: 850,
        ticks: { color: '#333' },
        grid: { color: 'rgba(0,0,0,0.1)' },
      },
      x: {
        ticks: { color: '#333' },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
  };

  // Handle score input
  const handleInputChange = e => {
    const { name, value } = e.target;
    setNewScores(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = e => {
    setSelectedDate(e.target.value);
  };

  const handleSubmit = e => {
    e.preventDefault();
    // TODO: Add Firestore integration to save new score
    alert('Score submitted! (Firestore integration pending)');
    setNewScores({ experian: '', equifax: '', transunion: '', notes: '' });
    setSelectedDate('');
  };

  // Milestone detection
  const milestones = scoreHistory.filter(s => s.experian >= goal || s.equifax >= goal || s.transunion >= goal);

  return (
    <section className="bg-white rounded-2xl shadow-2xl p-8 mb-8 w-full max-w-3xl mx-auto border border-gray-200">
      <h2 className="text-2xl font-bold mb-4">Credit Score Tracker</h2>
      <Line data={chartData} options={chartOptions} height={300} />
      <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="block font-semibold mb-1">Date</label>
          <input type="date" value={selectedDate} onChange={handleDateChange} className="w-full border rounded px-2 py-1" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Experian</label>
          <input type="number" name="experian" value={newScores.experian} onChange={handleInputChange} min={300} max={850} className="w-full border rounded px-2 py-1" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Equifax</label>
          <input type="number" name="equifax" value={newScores.equifax} onChange={handleInputChange} min={300} max={850} className="w-full border rounded px-2 py-1" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">TransUnion</label>
          <input type="number" name="transunion" value={newScores.transunion} onChange={handleInputChange} min={300} max={850} className="w-full border rounded px-2 py-1" required />
        </div>
        <div className="md:col-span-2">
          <label className="block font-semibold mb-1">Notes</label>
          <textarea name="notes" value={newScores.notes} onChange={handleInputChange} className="w-full border rounded px-2 py-1" rows={2} />
        </div>
        <button type="submit" className="md:col-span-2 px-4 py-2 bg-blue-600 text-white rounded font-bold shadow">Submit Score</button>
      </form>
      {milestones.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <h3 className="font-bold text-green-700 mb-2">Milestones Achieved!</h3>
          <ul className="list-disc ml-6">
            {milestones.map((m, idx) => (
              <li key={idx} className="text-green-700">{new Date(m.date).toLocaleDateString()}: Experian {m.experian}, Equifax {m.equifax}, TransUnion {m.transunion}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default CreditScoreTracker;
