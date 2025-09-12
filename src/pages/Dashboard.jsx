import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  ChartBarIcon, 
  DocumentTextIcon,
  FolderIcon,
  BellIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import BrandLogo from "@/components/BrandLogo";
import { useTheme } from '@/theme/ThemeProvider';

const quickActions = [
  { label: 'Credit Scores', href: '/client/reports', color: 'bg-blue-600' },
  { label: 'Dispute Letters', href: '/client/disputes', color: 'bg-yellow-500' },
  { label: 'Client Management', href: '/contacts', color: 'bg-green-600' },
  { label: 'Client Portal', href: '/client', color: 'bg-purple-600' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [clientData, setClientData] = useState(null);
  const [creditScores, setCreditScores] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    if (!user) return;

    const loadClientData = async () => {
      try {
        const clientDoc = await getDoc(doc(db, 'clients', user.uid));
        if (clientDoc.exists()) {
          setClientData(clientDoc.data());
        } else {
          const q = query(collection(db, 'contacts'), where('email', '==', user.email));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            setClientData(snapshot.docs[0].data());
          }
        }
      } catch (error) {
        console.error('Error loading client data:', error);
      }
    };

    const scoresQuery = query(
      collection(db, 'creditScores'),
      where('clientEmail', '==', user.email),
      orderBy('date', 'desc')
    );
    const unsubscribeScores = onSnapshot(scoresQuery, (snapshot) => {
      const scoresData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCreditScores(scoresData);
    });

    const disputesQuery = query(
      collection(db, 'disputeLetters'),
      where('recipientEmail', '==', user.email),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeDisputes = onSnapshot(disputesQuery, (snapshot) => {
      const disputesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDisputes(disputesData);
    });

    loadClientData();
    setLoading(false);

    return () => {
      unsubscribeScores();
      unsubscribeDisputes();
    };
  }, [user]);

  useEffect(() => {
    if (creditScores.length > 0) {
      setScore(creditScores[0]?.score);
    }
  }, [creditScores]);

  useEffect(() => {
    if (disputes.length > 0) {
      const recentActivity = disputes.map(dispute => ({
        type: 'dispute',
        status: dispute.status,
        bureau: dispute.bureau
      }));
      setActivity(recentActivity);
    }
  }, [disputes]);

  const getScoreImprovement = () => {
    if (creditScores.length < 2) return 0;
    const latest = creditScores[0]?.score || 0;
    const previous = creditScores[1]?.score || 0;
    return latest - previous;
  };

  const stats = [
    {
      title: 'Current Credit Score',
      value: creditScores[0]?.score || '---',
      change: getScoreImprovement(),
      icon: ChartBarIcon,
      color: 'blue'
    },
    {
      title: 'Active Disputes',
      value: disputes.filter(d => d.status !== 'resolved').length,
      icon: DocumentTextIcon,
      color: 'green'
    },
    {
      title: 'Documents',
      value: documents.length,
      icon: FolderIcon,
      color: 'purple'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow mb-6">
        <BrandLogo portalType="admin" theme={theme === 'dark' ? 'dark' : 'default'} style={{height:48}} />
        <button
          className="ml-4 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with logo and theme toggle */}
        <div className="flex items-center justify-between mb-8">
          <img
            src={window.matchMedia('(prefers-color-scheme: dark)').matches ? logoDark : logoLight}
            alt="Speedy Credit Repair Logo"
            className="h-10 md:h-10"
            style={{ maxHeight: 40 }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-8 mb-8 text-white"
        >
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {clientData?.firstName || user?.displayName || user?.email?.split('@')[0] || 'Client'}!
          </h1>
          <p className="text-xl opacity-90">
            Track your credit repair journey and monitor your progress
          </p>
          {getScoreImprovement() > 0 && (
            <div className="mt-4 inline-flex items-center bg-white/20 backdrop-blur rounded-lg px-4 py-2">
              <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
              <span>Your score improved by {getScoreImprovement()} points!</span>
            </div>
          )}
        </motion.div>

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
                {stat.change > 0 && (
                  <span className="text-green-600 text-sm font-semibold">
                    +{stat.change}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.title}
              </div>
            </motion.div>
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
}
