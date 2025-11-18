import React, { useState , useEffect } from "react";

import { db } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { getApiKey } from '../openaiConfig';
import { callOpenAI } from '../openaiService';

export default function Analytics() {
  const [stats, setStats] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = null;
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);
        const q = query(collection(db, 'analytics'));
        unsubscribe = onSnapshot(q,
          async (snapshot) => {
            const firebaseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStats(firebaseData);
            setLoading(false);

            // LLM-powered insights
            const apiKey = getApiKey();
            if (apiKey && firebaseData.length > 0) {
              const prompt = `Analyze the following CRM analytics data and provide 3 actionable insights for business growth. Data: ${JSON.stringify(firebaseData)}`;
              try {
                const result = await callOpenAI([
                  { role: 'system', content: 'You are a CRM analytics expert.' },
                  { role: 'user', content: prompt }
                ], apiKey);
                setInsights(result.split('\n').filter(Boolean));
              } catch (err) {
                setInsights(['AI insights unavailable.']);
              }
            }
          },
          (err) => {
            setError(err.message);
            setLoading(false);
            setStats([]);
            setInsights([]);
          }
        );
      } catch (err) {
        setError(err.message);
        setLoading(false);
        setStats([]);
        setInsights([]);
      }
    }
    fetchAnalytics();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <main className="mx-auto max-w-4xl px-6 py-10">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <h3 className="font-semibold mb-2">Error Loading Analytics</h3>
            <p>{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold mb-4">Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
              <p className="text-gray-500">Start tracking your business metrics to see analytics here.</p>
            </div>
          ) : (
            stats.map((stat) => (
              <div key={stat.id} className="bg-white shadow rounded-lg p-6 flex flex-col items-center">
                <div className="text-2xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg text-gray-700">{stat.label}</div>
              </div>
            ))
          )}
        </div>
        {insights.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <h2 className="text-lg font-semibold mb-2 text-blue-700">AI-Powered Insights</h2>
            <ul className="list-disc pl-6 text-blue-900">
              {insights.map((insight, i) => <li key={i}>{insight}</li>)}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
