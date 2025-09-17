import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function AICommandCenter() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulated response for now
    setTimeout(() => {
      setResponse(`AI Response: Processing "${query}" - Full OpenAI integration coming soon.`);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-8">
            AI Command Center
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Active AI Agents</h3>
              <p className="text-3xl font-bold">4</p>
              <p className="text-sm opacity-90">Lead Scoring, Email Parser, Receptionist, Analytics</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Processed Today</h3>
              <p className="text-3xl font-bold">47</p>
              <p className="text-sm opacity-90">Leads analyzed and scored</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Automation Savings</h3>
              <p className="text-3xl font-bold">12.5 hrs</p>
              <p className="text-sm opacity-90">Time saved this week</p>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Enter your query:</label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows="4"
                  placeholder="Ask the AI anything..."
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow hover:from-purple-700 hover:to-blue-700 transition"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Send to AI'}
              </button>
            </form>
            {response && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg text-blue-900 dark:text-blue-100">
                <strong>AI Response:</strong> {response}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
