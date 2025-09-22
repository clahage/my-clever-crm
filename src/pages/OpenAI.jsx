import React, { useState, useEffect } from 'react';
console.log('📍 OpenAI page loaded at:', new Date().toISOString());
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import QuickContactConverter from '../components/QuickContactConverter';

export default function OpenAI() {
  const [recentCalls, setRecentCalls] = useState([]);
  const [stats, setStats] = useState({ total: 0, hot: 0, warm: 0, cold: 0 });
  const [webhookUrl] = useState(`${window.location.origin}/api/webhooks/myaifrontdesk`);

  useEffect(() => {
    // Monitor aiReceptionistCalls collection
    const q = query(
      collection(db, 'aiReceptionistCalls'),
      orderBy('processedAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const calls = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentCalls(calls);

      // Calculate stats
      const totals = calls.reduce((acc, call) => {
        acc.total++;
        if (call.urgencyLevel === 'high' || call.leadScore >= 8) acc.hot++;
        else if (call.urgencyLevel === 'medium' || call.leadScore >= 5) acc.warm++;
        else acc.cold++;
        return acc;
      }, { total: 0, hot: 0, warm: 0, cold: 0 });

      setStats(totals);
    });

    return () => unsubscribe();
  }, []);

  // DEBUG: Check if data is real or demo
  useEffect(() => {
    const checkDataFreshness = () => {
      if (recentCalls && recentCalls.length > 0) {
        const latestCall = recentCalls[0];
        const callTime = new Date(latestCall.timestamp);
        const now = new Date();
        const hoursSinceCall = (now - callTime) / (1000 * 60 * 60);

        console.log('🔍 AI RECEPTIONIST CHECK:');
        console.log('Latest call:', latestCall);
        console.log('Hours since last call:', hoursSinceCall);
        console.log('Is this LIVE data?', hoursSinceCall < 24 ? 'YES - Recent!' : 'Possibly old/demo');
      }
    };
    checkDataFreshness();
  }, [recentCalls]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">AI Receptionist Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Calls</h3>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-red-600">Hot Leads</h3>
          <p className="text-3xl font-bold text-red-600">{stats.hot}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-yellow-600">Warm Leads</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.warm}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-blue-600">Cold Leads</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.cold}</p>
        </div>
      </div>

      {/* Webhook Configuration */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-blue-700">MyAIFrontDesk Webhook</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Webhook URL</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={webhookUrl}
                readOnly
                className="flex-1 p-2 border rounded bg-gray-100"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl);
                  alert('Copied to clipboard!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded border border-green-200 text-sm text-green-800">
            ✅ Your AI Receptionist is connected and processing calls automatically
          </div>
        </div>
      </div>

      {/* Unprocessed AI Calls */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Unprocessed AI Calls - Convert to Contacts</h2>
        <QuickContactConverter />
      </div>

      {/* Recent AI-Processed Calls */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Recent AI-Processed Calls</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Time</th>
                <th className="text-left p-2">Caller</th>
                <th className="text-left p-2">Score</th>
                <th className="text-left p-2">Urgency</th>
                <th className="text-left p-2">Pain Points</th>
                <th className="text-left p-2">Conversion %</th>
                <th className="text-left p-2">Duration</th>
              </tr>
            </thead>
            <tbody>
              {recentCalls.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No calls yet. Waiting for MyAIFrontDesk to send data...
                  </td>
                </tr>
              ) : (
                recentCalls.map((call) => (
                  <tr key={call.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-sm">
                      {call.processedAt ? new Date(call.processedAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="p-2">{call.username || 'Unknown'}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        call.leadScore >= 8 ? 'bg-red-100 text-red-800' :
                        call.leadScore >= 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {call.leadScore}/10
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        call.urgencyLevel === 'high' ? 'bg-red-100 text-red-800' :
                        call.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {call.urgencyLevel?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2 text-xs">
                      {call.painPoints?.slice(0, 3).join(', ')}
                    </td>
                    <td className="p-2">
                      <span className="font-bold">{call.conversionProbability}%</span>
                    </td>
                    <td className="p-2">{call.duration}s</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Scoring Breakdown Legend */}
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-bold mb-2">AI Scoring Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <div>Conversation Quality: 25%</div>
            <div>Pain Points: 30%</div>
            <div>Urgency: 25%</div>
            <div>Demographics: 15%</div>
            <div>Engagement: 5%</div>
          </div>
        </div>
      </div>
    </div>
  );
}