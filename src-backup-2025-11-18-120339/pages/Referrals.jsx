import React from 'react';
import { Award, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function Referrals() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Referrals & Affiliates</h1>
        <p className="text-gray-600">Manage referral partners and track commissions</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <Award className="h-8 w-8 text-yellow-500 mb-2" />
          <h3 className="font-semibold">Active Partners</h3>
          <p className="text-2xl font-bold">47</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <Users className="h-8 w-8 text-blue-600 mb-2" />
          <h3 className="font-semibold">Referrals This Month</h3>
          <p className="text-2xl font-bold">124</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <DollarSign className="h-8 w-8 text-green-600 mb-2" />
          <h3 className="font-semibold">Commissions Due</h3>
          <p className="text-2xl font-bold">$8,450</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
          <h3 className="font-semibold">Conversion Rate</h3>
          <p className="text-2xl font-bold">28%</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Top Performing Partners</h2>
        <div className="text-gray-600">Partner leaderboard and performance metrics will display here...</div>
      </div>
    </div>
  );
}
