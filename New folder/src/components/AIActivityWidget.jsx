import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getApiKey } from '../openaiConfig';
import { callOpenAI } from '../openaiService';

function useAIActivity() {
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    async function fetchActivity() {
      setLoading(true);
      setError(null);
      try {
        const apiKey = getApiKey();
        if (!apiKey) throw new Error('No OpenAI API key');
        // Prompt OpenAI for recent CRM AI activity (customize as needed)
        const prompt = `You are the AI activity monitor for a CRM. Summarize the last 10 OpenAI-powered actions (lead scoring, email generation, etc) with timestamp, type, action, status, and cost. Return as JSON array.`;
        const result = await callOpenAI([
          { role: 'system', content: 'You are a CRM AI activity logger.' },
          { role: 'user', content: prompt }
        ], apiKey);
        const parsed = JSON.parse(result);
        if (!cancelled) setActivity(parsed);
      } catch (err) {
        setError('Failed to load AI activity. Showing demo data.');
        // Demo fallback
        setActivity([
          {
            type: 'OpenAI',
            action: 'Lead Scored',
            status: 'success',
            cost: Math.random() * 0.02,
            timestamp: new Date().toISOString(),
          },
          {
            type: 'MyAIReceptionist',
            action: 'Webhook Lead Received',
            status: 'success',
            cost: 0,
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
    const interval = setInterval(fetchActivity, 60000); // refresh every 60s
    return () => { cancelled = true; clearInterval(interval); };
  }, []);
  return { activity, error, loading };
}

export default function AIActivityWidget() {
  const { activity, error, loading } = useAIActivity();
  const totalCost = activity.filter(a => a.type === 'OpenAI').reduce((sum, a) => sum + (a.cost || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="bg-gradient-to-r from-blue-100 via-green-100 to-purple-100 rounded-2xl p-6 shadow-xl glassmorphism mb-6"
      style={{ backdropFilter: 'blur(12px)', border: '1px solid #e0e7ff' }}
    >
      <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">AI Activity Monitor</h2>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">Total OpenAI Cost: <span className="font-bold text-blue-600">${totalCost.toFixed(4)}</span></div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-50 dark:bg-gray-800">
              <th className="px-2 py-1">Time</th>
              <th className="px-2 py-1">System</th>
              <th className="px-2 py-1">Action</th>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Cost</th>
            </tr>
          </thead>
          <tbody>
            {activity.map((a, i) => (
              <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-2 py-1">{new Date(a.timestamp).toLocaleTimeString()}</td>
                <td className="px-2 py-1 font-semibold">{a.type}</td>
                <td className="px-2 py-1">{a.action}</td>
                <td className={`px-2 py-1 font-bold ${a.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>{a.status}</td>
                <td className="px-2 py-1">{a.cost ? `$${a.cost.toFixed(4)}` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && <div className="text-gray-500 mt-2">Loading activity...</div>}
    </motion.div>
  );
}
