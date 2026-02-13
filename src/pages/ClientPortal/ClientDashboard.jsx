import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from "../../contexts/AuthContext";
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from "@/lib/firebase";
import { 
  ChartBarIcon, 
  DocumentTextIcon,
  FolderIcon,
  BellIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const ClientDashboard = () => {
  const { user, userProfile } = useAuth(); // ✅ Added userProfile
  const [clientData, setClientData] = useState(null);
  const [creditScores, setCreditScores] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, [user]);

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-8 mb-8 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {userProfile?.firstName || clientData?.firstName || user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there'}!
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
              <div className="p-3 rounded-lg bg-blue-100">
                <stat.icon className="h-6 w-6 text-blue-600" />
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {disputes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BellIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No recent activity</p>
            </div>
          ) : (
            disputes.slice(0, 3).map((dispute) => (
              <div key={dispute.id} className="flex items-start space-x-3">
                <DocumentTextIcon className="h-5 w-5 text-blue-600 mt-1" />
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-300">
                    A dispute letter was sent to {dispute.bureau} with status: {dispute.status}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {new Date(dispute.createdAt.toDate()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ClientDashboard;