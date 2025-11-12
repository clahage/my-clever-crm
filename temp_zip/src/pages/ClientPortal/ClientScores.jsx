import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon,
  AcademicCapIcon,
  SparklesIcon,
  LockClosedIcon,
  BeakerIcon,
  DocumentChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ClientScores = () => {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [selectedView, setSelectedView] = useState('overview'); // overview, details, simulator
  const [selectedBureau, setSelectedBureau] = useState('all');
  const [loading, setLoading] = useState(true);
  const [simulatorEnabled, setSimulatorEnabled] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const scoresQuery = query(
      collection(db, 'creditScores'),
      where('clientEmail', '==', user.email),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(scoresQuery, (snapshot) => {
      const scoresData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setScores(scoresData);
      setLoading(false);
    }, (error) => {
      console.log('Scores collection not ready:', error);
      setScores([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const latestScore = scores.length > 0 ? scores[0] : null;

  const ScoreViewHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Credit Scores</h1>
    </div>
  );

  const EducationalBanner = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8 flex items-center space-x-4 border border-blue-200 dark:border-blue-800"
    >
      <InformationCircleIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Understanding Your Credit Score
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          Your credit score is a numerical summary of your credit history. It is used by lenders to assess your creditworthiness.
        </p>
      </div>
    </motion.div>
  );
  
  const ViewTabs = () => (
    <div className="flex space-x-2 mb-6">
      {['overview', 'details', 'simulator'].map((view) => (
        <button
          key={view}
          onClick={() => setSelectedView(view)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedView === view
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {view.charAt(0).toUpperCase() + view.slice(1)}
        </button>
      ))}
    </div>
  );

  const ScoreModelCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {['fico', 'vantagescore'].map((model, index) => (
        <motion.div
          key={model}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {model === 'fico' ? 'FICO Score' : 'VantageScore'}
            </h3>
            {latestScore && latestScore[model] && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                latestScore.change && latestScore.change[model] > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {latestScore.change && latestScore.change[model] > 0 ? '+' : ''}
                {latestScore.change ? latestScore.change[model] : 0}
              </span>
            )}
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            {latestScore ? latestScore[model] : 'N/A'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last updated: {latestScore ? new Date(latestScore.date).toLocaleDateString() : 'N/A'}
          </p>
        </motion.div>
      ))}
    </div>
  );

  const AIReportSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg flex items-start space-x-4 border border-gray-200 dark:border-gray-700"
    >
      <SparklesIcon className="h-8 w-8 text-purple-600 flex-shrink-0" />
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          AI-Powered Credit Report Summary
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Our AI has analyzed your credit report and provided a simple summary of the key factors affecting your score.
        </p>
        <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium">
          View Full AI Summary →
        </button>
      </div>
    </motion.div>
  );

  const SimulatorTool = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg flex items-start space-x-4 border border-gray-200 dark:border-gray-700"
    >
      <BeakerIcon className="h-8 w-8 text-teal-600 flex-shrink-0" />
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Credit Score Simulator
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          See how different actions could impact your credit score. Try scenarios like paying off debt or opening a new credit card.
        </p>
        <button
          onClick={() => alert('Simulator functionality coming soon!')}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
        >
          Launch Simulator →
        </button>
      </div>
    </motion.div>
  );

  const getScoreImprovementAnalysis = (latest, previous) => {
    const improvement = latest - previous;
    return (
      <div className={`flex items-center space-x-2 mt-1`}>
        {improvement > 0 ? (
          <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
        ) : improvement < 0 ? (
          <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
        ) : null}
        <span className={`text-sm ${improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {improvement !== 0 ? `${improvement > 0 ? '+' : ''}${improvement} points` : 'No change'}
        </span>
      </div>
    );
  };
  
  const ScoreOverviewCard = ({ title, value, previousValue, lastUpdated }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{value}</p>
      {previousValue && getScoreImprovementAnalysis(value, previousValue)}
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Last updated: {lastUpdated}
      </p>
    </motion.div>
  );

  const ScoreHistoryChart = () => {
    const data = {
      labels: scores.map(s => new Date(s.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Credit Score',
          data: scores.map(s => s.score),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          fill: true,
        },
      ],
    };
    
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Score History</h2>
        {/* <Line data={data} options={options} /> */}
      </div>
    );
  };

  const ScoreExplanationCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg flex items-start space-x-4 border border-gray-200 dark:border-gray-700"
    >
      <AcademicCapIcon className="h-8 w-8 text-orange-600 flex-shrink-0" />
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Your Credit Score Breakdown
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Payment history, credit utilization, and credit age are the primary factors affecting your score.
        </p>
        <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium">
          Read the Full Guide →
        </button>
      </div>
    </motion.div>
  );

  const ScoreSimulatorSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SimulatorTool />
      <ScoreExplanationCard />
    </div>
  );

  const ScoreDetailView = () => (
    <AnimatePresence>
      <motion.div
        key="details-view"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Detailed Score History</h2>
        {scores.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {scores.map((score) => (
                  <tr key={score.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(score.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {score.score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {score.bureau}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No score history available.</p>
        )}
      </motion.div>
    </AnimatePresence>
  );

  const ScoreSimulatorView = () => (
    <AnimatePresence>
      <motion.div
        key="simulator-view"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <div className="flex items-center space-x-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Score Simulator</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Beta
          </span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Toggle actions to see their potential impact on your credit score.
        </p>

        {/* Simulator actions list */}
        <div className="space-y-4">
          {[{ label: 'Pay down $500 in credit card debt', impact: '+15 points' }, { label: 'Open a new store credit card', impact: '-5 points' }].map((action, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</span>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{action.impact}</span>
            </div>
          ))}
        </div>
        <button
          className="mt-6 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
          onClick={() => alert('Simulating action...')}
        >
          Run Simulation
        </button>
      </motion.div>
    </AnimatePresence>
  );

  const EmptyState = () => (
    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Credit Data Found</h3>
      <p className="mt-1 text-sm text-gray-500">
        We couldn't find any credit scores for your account. Please check back later or contact support.
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ScoreViewHeader />
      <EducationalBanner />
      <ViewTabs />
      {scores.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {selectedView === 'overview' && (
            <AnimatePresence>
              <motion.div key="overview-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ScoreOverviewCard
                    title="Latest FICO Score"
                    value={latestScore?.fico || 'N/A'}
                    previousValue={scores[1]?.fico}
                    lastUpdated={latestScore?.date ? new Date(latestScore.date).toLocaleDateString() : 'N/A'}
                  />
                  <ScoreOverviewCard
                    title="Latest VantageScore"
                    value={latestScore?.vantagescore || 'N/A'}
                    previousValue={scores[1]?.vantagescore}
                    lastUpdated={latestScore?.date ? new Date(latestScore.date).toLocaleDateString() : 'N/A'}
                  />
                </div>
                <ScoreHistoryChart />
                <ScoreExplanationCard />
              </motion.div>
            </AnimatePresence>
          )}
          {selectedView === 'details' && <ScoreDetailView />}
          {selectedView === 'simulator' && <ScoreSimulatorView />}
        </>
      )}
    </div>
  );
};

export default ClientScores;