import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ContactReports = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'contacts'), (snap) => {
      setContacts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // Example chart data
  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ label: 'Contacts Added', data: [5, 8, 6, 10, 7, 4, 3], backgroundColor: 'rgba(59,130,246,0.5)' }]
  };
  const conversionData = {
    labels: ['Lead', 'Prospect', 'Client'],
    datasets: [{ label: 'Conversions', data: [30, 15, 8], backgroundColor: ['#fbbf24', '#34d399', '#3b82f6'] }]
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Contact Reports & Analytics</h1>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Weekly Contact Summary</h2>
        <Bar data={weeklyData} />
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Conversion Analysis</h2>
        <Bar data={conversionData} />
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Contact Trends</h2>
        <Line data={weeklyData} />
      </div>
      {/* ...more charts and metrics... */}
    </div>
  );
};

export default ContactReports;
