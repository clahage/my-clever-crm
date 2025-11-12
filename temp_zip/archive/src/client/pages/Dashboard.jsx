// Client Dashboard Shell
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, doc, getDoc, collection, query, getDocs } from 'firebase/firestore';
const logoLight = '/brand/default/logo-brand-tagline-1200.png';
const logoDark = '/brand/default/logo-fullcolor-darkmode-1200.png';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  return (
    <button
      className="ml-4 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
};

const quickActions = [
  { label: 'Credit Scores', href: '/client/reports', color: 'bg-blue-600' },
  { label: 'Dispute Letters', href: '/client/disputes', color: 'bg-yellow-500' },
  { label: 'Client Management', href: '/contacts', color: 'bg-green-600' },
  { label: 'Client Portal', href: '/client', color: 'bg-purple-600' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [score, setScore] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const db = getFirestore();
    const fetchData = async () => {
      const clientRef = doc(db, 'clients', user.uid);
      const clientSnap = await getDoc(clientRef);
      setScore(clientSnap.exists() ? clientSnap.data().creditScore : null);
      const disputesQ = query(collection(db, 'clients', user.uid, 'disputes'));
      const disputesSnap = await getDocs(disputesQ);
      const disputes = disputesSnap.docs.map(d => ({...d.data(), type: 'dispute'}));
      const docsQ = query(collection(db, 'clients', user.uid, 'documents'));
      const docsSnap = await getDocs(docsQ);
      const docs = docsSnap.docs.map(d => ({...d.data(), type: 'document'}));
      setActivity([...disputes, ...docs].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 5));
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header with logo and theme toggle */}
        <div className="flex items-center justify-between mb-8">
          <img
            src={window.matchMedia('(prefers-color-scheme: dark)').matches ? logoDark : logoLight}
            alt="Speedy Credit Repair Logo"
            className="h-10 md:h-10"
            style={{ maxHeight: 40 }}
          />
          <div className="flex items-center">
            <span className="text-sm text-gray-700 dark:text-gray-200 mr-2">
              Logged in as: <span className="font-semibold">{user?.email || user?.name || 'Unknown'}</span>
            </span>
            <ThemeToggle />
          </div>
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {quickActions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              className={`rounded-lg p-4 text-white font-semibold text-center shadow transition-colors ${action.color} hover:opacity-90 dark:bg-opacity-80`}
            >
              {action.label}
            </a>
          ))}
        </div>
        {/* Credit Score Card */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <span className="font-semibold text-gray-700 dark:text-gray-200">Credit Score:</span> <span className="text-xl font-bold text-blue-700 dark:text-blue-300">{score ?? 'N/A'}</span>
        </div>
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Recent Activity</h2>
          {activity.length === 0 ? <div className="text-gray-500 dark:text-gray-400">No recent activity.</div> : (
            <ul>
              {activity.map((item, i) => (
                <li key={i} className="mb-1 text-gray-700 dark:text-gray-200">
                  {item.type === 'dispute' ? `Dispute: ${item.status}` : `Document: ${item.name}`}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
