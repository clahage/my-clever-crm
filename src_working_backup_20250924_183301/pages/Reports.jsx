import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, FileText, Download } from 'lucide-react';

export default function Reports() {
  const reportCards = [
    { title: 'Monthly Revenue', value: '$12,450', icon: DollarSign, trend: '+8%', color: 'bg-green-600' },
    { title: 'Active Clients', value: '156', icon: Users, trend: '+12%', color: 'bg-blue-600' },
    { title: 'Disputes Resolved', value: '89', icon: FileText, trend: '+23%', color: 'bg-purple-600' },
    { title: 'Conversion Rate', value: '68%', icon: TrendingUp, trend: '+5%', color: 'bg-yellow-600' }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="w-8 h-8" />
          Reports & Analytics
        </h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {reportCards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-green-600 font-semibold">{card.trend}</span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Revenue Trend</h2>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-2" />
              <p>Chart visualization coming soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Client Growth</h2>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-2" />
              <p>Chart visualization coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}