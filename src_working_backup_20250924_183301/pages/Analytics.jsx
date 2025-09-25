import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Users, Phone, Calendar, DollarSign, Activity, PieChart, Download } from 'lucide-react';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('30days');
  const [activeTab, setActiveTab] = useState('overview');

  // Sample analytics data
  const stats = {
    totalLeads: 247,
    leadChange: 12,
    conversionRate: 34.5,
    conversionChange: 5.2,
    totalRevenue: 45680,
    revenueChange: 8.7,
    avgDealSize: 1850,
    dealSizeChange: -2.3
  };

  const leadsBySource = [
    { source: 'AI Receptionist', count: 89, percentage: 36 },
    { source: 'Website', count: 67, percentage: 27 },
    { source: 'Referrals', count: 52, percentage: 21 },
    { source: 'Social Media', count: 24, percentage: 10 },
    { source: 'Other', count: 15, percentage: 6 }
  ];

  const monthlyPerformance = [
    { month: 'Jan', leads: 42, clients: 12, revenue: 8200 },
    { month: 'Feb', leads: 38, clients: 10, revenue: 7500 },
    { month: 'Mar', leads: 45, clients: 15, revenue: 9800 },
    { month: 'Apr', leads: 52, clients: 18, revenue: 11200 },
    { month: 'May', leads: 48, clients: 14, revenue: 10500 },
    { month: 'Jun', leads: 55, clients: 20, revenue: 13500 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your business performance and metrics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            {stats.leadChange > 0 ? (
              <span className="flex items-center text-green-600 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{stats.leadChange}%
              </span>
            ) : (
              <span className="flex items-center text-red-600 text-sm">
                <TrendingDown className="w-4 h-4 mr-1" />
                {stats.leadChange}%
              </span>
            )}
          </div>
          <h3 className="text-gray-600 text-sm">Total Leads</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <span className="flex items-center text-green-600 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{stats.conversionChange}%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm">Conversion Rate</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <span className="flex items-center text-green-600 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{stats.revenueChange}%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <span className="flex items-center text-red-600 text-sm">
              <TrendingDown className="w-4 h-4 mr-1" />
              {stats.dealSizeChange}%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm">Avg Deal Size</h3>
          <p className="text-2xl font-bold text-gray-900">${stats.avgDealSize}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`py-4 border-b-2 font-medium text-sm ${
                activeTab === 'leads'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Lead Analytics
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`py-4 border-b-2 font-medium text-sm ${
                activeTab === 'revenue'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Revenue Analytics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Lead Sources */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Lead Sources</h3>
                <div className="space-y-3">
                  {leadsBySource.map((item) => (
                    <div key={item.source} className="flex items-center">
                      <div className="w-32 text-sm text-gray-600">{item.source}</div>
                      <div className="flex-1">
                        <div className="bg-gray-200 rounded-full h-6 relative">
                          <div
                            className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${item.percentage}%` }}
                          >
                            <span className="text-xs text-white font-medium">{item.count}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-16 text-right text-sm text-gray-600 ml-3">
                        {item.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Performance Chart (Simplified) */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Monthly Performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Month</th>
                        <th className="text-center py-2 text-sm font-medium text-gray-600">Leads</th>
                        <th className="text-center py-2 text-sm font-medium text-gray-600">Clients</th>
                        <th className="text-right py-2 text-sm font-medium text-gray-600">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyPerformance.map((month) => (
                        <tr key={month.month} className="border-b">
                          <td className="py-3 text-sm">{month.month}</td>
                          <td className="text-center py-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                              {month.leads}
                            </span>
                          </td>
                          <td className="text-center py-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                              {month.clients}
                            </span>
                          </td>
                          <td className="text-right py-3 text-sm font-medium">
                            ${month.revenue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="text-center py-12">
              <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Detailed lead analytics coming soon</p>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Detailed revenue analytics coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;