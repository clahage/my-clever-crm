import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from "@/lib/firebase";
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
  Filler
} from 'chart.js';
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
  const [simulatorEnabled, setSimulatorEnabled] = useState(false); // Admin controlled
  const [showEducation, setShowEducation] = useState(true);

  // Score model definitions
  const scoreModels = {
    'FICO8': { name: 'FICO® Score 8', range: '300-850', usage: 'Most common for credit cards & loans' },
    'VantageScore3': { name: 'VantageScore® 3.0', range: '300-850', usage: 'Used by many free credit monitoring services' },
    'FICOAuto': { name: 'FICO® Auto Score', range: '250-900', usage: 'Used for auto loan applications' },
    'FICOMortgage': { name: 'FICO® Mortgage Score', range: '300-850', usage: 'Used for home loan applications' },
    'FICOBankcard': { name: 'FICO® Bankcard Score', range: '250-900', usage: 'Used for credit card applications' }
  };

  useEffect(() => {
    if (!user) return;

    const scoresQuery = query(
      collection(db, 'creditScores'),
      where('clientEmail', '==', user.email),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(scoresQuery, (snapshot) => {
      const scoresData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate ? doc.data().date.toDate() : new Date(doc.data().date)
      }));
      setScores(scoresData);
      setLoading(false);
      checkSimulatorAccess();
    });

    return () => unsubscribe();
  }, [user]);

  const checkSimulatorAccess = async () => {
    setSimulatorEnabled(false);
  };

  // Get scores organized by model and bureau
  const getScoresByModel = () => {
    const organized = {};
    const bureaus = ['Equifax', 'Experian', 'TransUnion'];
    Object.keys(scoreModels).forEach(model => {
      organized[model] = {};
      bureaus.forEach(bureau => {
        const modelScores = scores.filter(s => 
          s.bureau === bureau && (s.model === model || (!s.model && model === 'FICO8'))
        );
        organized[model][bureau] = {
          current: modelScores[0]?.score || null,
          previous: modelScores[1]?.score || null,
          change: modelScores[0] && modelScores[1] 
            ? modelScores[0].score - modelScores[1].score 
            : 0,
          date: modelScores[0]?.date || null
        };
      });
    });
    return organized;
  };

  // Educational banner component
  const EducationalBanner = () => (
    <AnimatePresence>
      {showEducation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-8 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-start gap-4">
            <AcademicCapIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                Did You Know? You Don't Have Just One Credit Score!
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                You actually have dozens of different credit scores. Each lender may use a different scoring model 
                depending on what you're applying for. Your auto lender sees different scores than your credit card company!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">FICO® Score 8</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Most common for general credit</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Auto Scores</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Range 250-900 for car loans</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Mortgage Scores</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Specific models for home loans</p>
                </div>
              </div>
              <button
                onClick={() => setShowEducation(false)}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ScoreView™ Header
  const ScoreViewHeader = () => (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          ScoreView™
        </h1>
        <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
          Credit Intelligence
        </span>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Your complete credit score analysis across all bureaus and scoring models
      </p>
    </div>
  );

  // View tabs
  const ViewTabs = () => (
    <div className="flex gap-2 mb-8">
      <button
        onClick={() => setSelectedView('overview')}
        className={`px-6 py-3 rounded-lg font-medium transition-all ${
          selectedView === 'overview'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <DocumentChartBarIcon className="h-5 w-5 inline mr-2" />
        Overview
      </button>
      <button
        onClick={() => setSelectedView('details')}
        className={`px-6 py-3 rounded-lg font-medium transition-all ${
          selectedView === 'details'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <ChartBarIcon className="h-5 w-5 inline mr-2" />
        All Scores
      </button>
      <button
        onClick={() => setSelectedView('simulator')}
        className={`px-6 py-3 rounded-lg font-medium transition-all relative ${
          selectedView === 'simulator'
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <BeakerIcon className="h-5 w-5 inline mr-2" />
        SmartSim™
        {!simulatorEnabled && (
          <span className="absolute -top-2 -right-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
            Coming Soon
          </span>
        )}
      </button>
    </div>
  );

  // Overview cards with all score models
  const ScoreModelCards = () => {
    const scoreData = getScoresByModel();
    return (
      <div className="space-y-6">
        {Object.entries(scoreModels).map(([modelKey, modelInfo]) => {
          const modelScores = scoreData[modelKey];
          const hasData = Object.values(modelScores).some(bureau => bureau.current !== null);
          return (
            <motion.div
              key={modelKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg ${
                !hasData ? 'opacity-60' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {modelInfo.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {modelInfo.usage}
                  </p>
                  <span className="text-xs text-gray-500">
                    Range: {modelInfo.range}
                  </span>
                </div>
                {!hasData && (
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                    Data not available
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {['Equifax', 'Experian', 'TransUnion'].map(bureau => {
                  const bureauScore = modelScores[bureau];
                  return (
                    <div key={bureau} className="text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {bureau}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {bureauScore.current || '---'}
                      </p>
                      {bureauScore.change !== 0 && (
                        <div className={`text-xs mt-1 ${
                          bureauScore.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {bureauScore.change > 0 ? '+' : ''}{bureauScore.change}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  // SmartSim™ Simulator placeholder
  const SmartSimulator = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-8 text-center"
    >
      <BeakerIcon className="h-16 w-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        SmartSim™ Credit Score Simulator
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
        Coming soon! Test "what-if" scenarios to see how different actions could impact your credit scores. 
        Pay down debt, remove collections, or add new accounts to see projected score changes.
      </p>
      {!simulatorEnabled ? (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg">
          <LockClosedIcon className="h-5 w-5" />
          <span>Available in Premium Plans</span>
        </div>
      ) : (
        <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-shadow">
          <SparklesIcon className="h-5 w-5 inline mr-2" />
          Launch Simulator
        </button>
      )}
    </motion.div>
  );

  // Monthly AI Report placeholder
  const AIReportSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <SparklesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          AI Monthly Intelligence Report
        </h3>
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">
          New Feature
        </span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Your personalized credit analysis will appear here each month, explaining changes and providing actionable recommendations.
      </p>
      <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium">
        Learn More →
      </button>
    </motion.div>
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
      {selectedView === 'overview' && (
        <>
          <ScoreModelCards />
          <AIReportSection />
        </>
      )}
      {selectedView === 'details' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Detailed Score History
          </h2>
          {/* Add detailed charts and history here */}
          <p className="text-gray-600 dark:text-gray-400">
            Full score history and trending analysis coming soon...
          </p>
        </div>
      )}
      {selectedView === 'simulator' && <SmartSimulator />}
    </div>
  );
};

export default ClientScores;
