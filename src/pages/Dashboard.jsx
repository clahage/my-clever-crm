import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/AuthProvider';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { 
  ChartBarIcon, 
  DocumentTextIcon,
  FolderIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const quickActions = [
  { label: 'Credit Scores', href: '/reports', color: 'bg-blue-600' },
  { label: 'Dispute Letters', href: '/disputes', color: 'bg-yellow-500' },
  { label: 'Client Management', href: '/clients', color: 'bg-green-600' },
  { label: 'Progress Portal', href: '/progress', color: 'bg-purple-600' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [clientData, setClientData] = useState(null);
  const [creditScores, setCreditScores] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

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

    // Simplified queries with error handling
    try {
      const scoresQuery = query(
        collection(db, 'creditScores'),
        where('clientEmail', '==', user.email),
        orderBy('date', 'desc')
      );
      const unsubscribeScores = onSnapshot(scoresQuery, 
        (snapshot) => {
          const scoresData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCreditScores(scoresData);
        },
        (error) => {
          console.log('Scores collection not ready:', error);
          setCreditScores([]);
        }
      );

      const disputesQuery = query(
        collection(db, 'disputeLetters'),
        where('recipientEmail', '==', user.email),
        orderBy('createdAt', 'desc')
      );
      const unsubscribeDisputes = onSnapshot(disputesQuery, 
        (snapshot) => {
          const disputesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setDisputes(disputesData);
        },
        (error) => {
          console.log('Disputes collection not ready:', error);
          setDisputes([]);
        }
      );

      loadClientData();
      setLoading(false);

      return () => {
        unsubscribeScores();
        unsubscribeDisputes();
      };
    } catch (error) {
      console.error('Firebase error:', error);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (creditScores.length > 0) {
      setScore(creditScores[0]?.score);
    }
  }, [creditScores]);

  useEffect(() => {
    if (disputes.length > 0) {
      const recentActivity = disputes.slice(0, 5).map(dispute => ({
        type: 'dispute',
        status: dispute.status || 'pending',
        bureau: dispute.bureau || 'Unknown'
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
    <div className="min-h-screen bg-gray-50">
      <header className="p-4 bg-white shadow mb-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">SpeedyCRM Dashboard</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-8 mb-8 text-white"
        >
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'Administrator'}!
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

        <div className="grid grid-cols-2 gap-4 mb-8">
          {quickActions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              className={`rounded-lg p-4 text-white font-semibold text-center shadow transition-colors ${action.color} hover:opacity-90`}
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
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
                {stat.change > 0 && (
                  <span className="text-green-600 text-sm font-semibold">
                    +{stat.change}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.title}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <span className="font-semibold text-gray-700">Credit Score:</span> 
          <span className="text-xl font-bold text-blue-700 ml-2">
            {score ?? 'N/A'}
          </span>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Recent Activity</h2>
          {activity.length === 0 ? (
            <div className="text-gray-500">No recent activity.</div>
          ) : (
            <ul className="space-y-2">
              {activity.map((item, i) => (
                <li key={i} className="text-gray-700">
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