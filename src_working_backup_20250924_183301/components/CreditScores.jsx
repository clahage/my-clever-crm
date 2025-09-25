import React from 'react';
import { Activity, TrendingUp, Users } from 'lucide-react';

export default function CreditScores() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Credit Scores Tracking</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <Activity className="h-8 w-8 text-blue-600 mb-2" />
          <h3 className="font-semibold">Average Score</h3>
          <p className="text-2xl font-bold">652</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
          <h3 className="font-semibold">Avg Improvement</h3>
          <p className="text-2xl font-bold">+78</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <Users className="h-8 w-8 text-purple-600 mb-2" />
          <h3 className="font-semibold">Clients Tracked</h3>
          <p className="text-2xl font-bold">156</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Score History</h2>
        <p className="text-gray-600">Credit score tracking charts will appear here...</p>
      </div>
    </div>
  );
}
