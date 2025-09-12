import React, { useState , useEffect } from "react";

import { db } from '../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { demoAnalytics } from "../data/demoData";
import { getApiKey } from '../openaiConfig';
import { callOpenAI } from '../openaiService';

export default function Analytics() {
  const [stats, setStats] = useState([]);
  const [insights, setInsights] = useState([]);
  const [useDemo, setUseDemo] = useState(true);

  useEffect(() => {
    let unsubscribe = null;
    async function fetchAnalytics() {
      try {
        const q = query(collection(db, 'analytics'));
        unsubscribe = onSnapshot(q,
          async (snapshot) => {
            const firebaseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStats(firebaseData);
            setUseDemo(false);
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
          (error) => {
            setStats(demoAnalytics);
            setUseDemo(true);
            setInsights([]);
          }
        );
      } catch (error) {
        setStats(demoAnalytics);
        setUseDemo(true);
        setInsights([]);
      }
    }
    fetchAnalytics();
    return () => unsubscribe && unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold mb-4">Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500">No analytics data found.</div>
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
