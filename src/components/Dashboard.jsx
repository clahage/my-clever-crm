import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SocialMediaAlert from './SocialMediaAlert';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalLeads: 0,
    totalClients: 0,
    conversionRate: 0,
    totalRequests: 0,
    totalDisputes: 0,
    financialAccuracy: 0
  });
  const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [expandedCards, setExpandedCards] = useState({});

    const toggleCard = (cardId) => {
      setExpandedCards(prev => ({
        ...prev,
        [cardId]: !prev[cardId]
      }));
    };

  // Chart data
  const leadSourceData = [
    { name: 'Website', value: 45, color: '#3b82f6' },
    { name: 'Referral', value: 30, color: '#10b981' },
    { name: 'Social Media', value: 15, color: '#8b5cf6' },
    { name: 'Other', value: 10, color: '#f59e0b' }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 45000, clients: 12 },
    { month: 'Feb', revenue: 52000, clients: 15 },
    { month: 'Mar', revenue: 48000, clients: 13 },
    { month: 'Apr', revenue: 61000, clients: 18 },
    { month: 'May', revenue: 55000, clients: 16 },
    { month: 'Jun', revenue: 67000, clients: 20 }
  ];

  const conversionData = [
    { week: 'Week 1', rate: 12 },
    { week: 'Week 2', rate: 15 },
    { week: 'Week 3', rate: 18 },
    { week: 'Week 4', rate: 22 }
  ];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const contactsSnap = await getDocs(collection(db, 'contacts'));
      const leadsSnap = await getDocs(query(collection(db, 'contacts'), where('category', '==', 'Lead')));
      const clientsSnap = await getDocs(query(collection(db, 'contacts'), where('category', '==', 'Client')));
      
      const totalContacts = contactsSnap.size;
      const totalLeads = leadsSnap.size;
      const totalClients = clientsSnap.size;
      const conversionRate = totalLeads > 0 ? Math.round((totalClients / totalLeads) * 100) : 0;

      setStats({
        totalContacts,
        totalLeads,
        totalClients,
        conversionRate,
        totalRequests: 127,
        totalDisputes: 43,
        financialAccuracy: 98.5
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="mb-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Speedy Credit Repair Dashboard</h1>
            <p className="text-lg opacity-90 mb-3">AI-Powered Credit Repair Management</p>
            {user && (
              <div className="text-sm opacity-80">
                <p>Logged in as: {user.displayName || user.email}</p>
                <p className="text-xs">{user.email}</p>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>
      </div>

      {/* Social Media Alert */}
      <div className="mb-6">
        <SocialMediaAlert />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Requests Card */}
        <div className="bg-blue-500 text-white rounded-lg overflow-hidden">
          <div 
            className="p-6 cursor-pointer hover:bg-blue-600 transition-colors"
            onClick={() => toggleCard('requests')}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">Total Requests</p>
                <p className="text-3xl font-bold mt-2">{stats.totalRequests}</p>
                <p className="text-sm mt-2">↑ 12% from last month</p>
              </div>
              <span className="text-3xl">📊</span>
            </div>
          </div>
          {expandedCards.requests && (
            <div className="bg-blue-600 p-4 border-t border-blue-400">
              <p className="text-sm mb-2">Detailed Breakdown:</p>
              <div className="space-y-1 text-sm">
                <div>• New requests today: 12</div>
                <div>• Pending review: 34</div>
                <div>• Completed this week: 45</div>
                <div>• Average processing time: 2.3 days</div>
              </div>
            </div>
          )}
        </div>

        {/* Disputes Card */}
        <div className="bg-green-500 text-white rounded-lg overflow-hidden">
          <div 
            className="p-6 cursor-pointer hover:bg-green-600 transition-colors"
            onClick={() => toggleCard('disputes')}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">Disputes Resolved</p>
                <p className="text-3xl font-bold mt-2">{stats.totalDisputes}</p>
                <p className="text-sm mt-2">This Quarter</p>
              </div>
              <span className="text-3xl">✓</span>
            </div>
          </div>
          {expandedCards.disputes && (
            <div className="bg-green-600 p-4 border-t border-green-400">
              <p className="text-sm mb-2">Resolution Details:</p>
              <div className="space-y-1 text-sm">
                <div>• Successful removals: 38</div>
                <div>• Partial wins: 3</div>
                <div>• Pending response: 2</div>
                <div>• Success rate: 88%</div>
              </div>
            </div>
          )}
        </div>

        {/* Conversion Card */}
        <div className="bg-purple-500 text-white rounded-lg overflow-hidden">
          <div 
            className="p-6 cursor-pointer hover:bg-purple-600 transition-colors"
            onClick={() => toggleCard('conversion')}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">Conversion Rate</p>
                <p className="text-3xl font-bold mt-2">{stats.conversionRate}%</p>
                <p className="text-sm mt-2">Lead to Client</p>
              </div>
              <span className="text-3xl">📈</span>
            </div>
          </div>
          {expandedCards.conversion && (
            <div className="bg-purple-600 p-4 border-t border-purple-400">
              <p className="text-sm mb-2">Conversion Funnel:</p>
              <div className="space-y-1 text-sm">
                <div>• Leads: {stats.totalLeads}</div>
                <div>• Qualified: {Math.round(stats.totalLeads * 0.6)}</div>
                <div>• Converted: {stats.totalClients}</div>
                <div>• Avg time to convert: 4.2 days</div>
              </div>
            </div>
          )}
        </div>

        {/* Financial Card */}
        <div className="bg-orange-500 text-white rounded-lg overflow-hidden">
          <div 
            className="p-6 cursor-pointer hover:bg-orange-600 transition-colors"
            onClick={() => toggleCard('financial')}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">Financial Accuracy</p>
                <p className="text-3xl font-bold mt-2">{stats.financialAccuracy}%</p>
                <p className="text-sm mt-2">Score Predictions</p>
              </div>
              <span className="text-3xl">💯</span>
            </div>
          </div>
          {expandedCards.financial && (
            <div className="bg-orange-600 p-4 border-t border-orange-400">
              <p className="text-sm mb-2">Accuracy Metrics:</p>
              <div className="space-y-1 text-sm">
                <div>• Predictions made: 127</div>
                <div>• Within 10 points: 125</div>
                <div>• Average variance: 7 points</div>
                <div>• Best streak: 23 accurate</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button onClick={() => navigate('/add-client')} 
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all">
            <span className="text-2xl mb-2 block">➕</span>
            <div className="text-sm font-medium">Add Client</div>
          </button>
          <button onClick={() => navigate('/leads')} 
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-lg transition-all">
            <span className="text-2xl mb-2 block">📊</span>
            <div className="text-sm font-medium">View Leads</div>
          </button>
          <button onClick={() => navigate('/reports')} 
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-lg transition-all">
            <span className="text-2xl mb-2 block">📈</span>
            <div className="text-sm font-medium">Reports</div>
          </button>
          <button onClick={() => navigate('/social-admin')} 
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-lg transition-all">
            <span className="text-2xl mb-2 block">💬</span>
            <div className="text-sm font-medium">Social Admin</div>
          </button>
        </div>
      </div>

      {/* Analytics Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Lead Source Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Lead Source Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={leadSourceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {leadSourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {leadSourceData.map((item) => (
              <div key={item.name} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="clients" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analytics Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Data Storytelling */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Data Storytelling</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded">
              <p className="text-sm font-medium text-blue-900">Best Performing Month</p>
              <p className="text-2xl font-bold text-blue-600">June</p>
              <p className="text-xs text-blue-700">$67,000 revenue</p>
            </div>
            <div className="p-3 bg-green-50 rounded">
              <p className="text-sm font-medium text-green-900">Top Lead Source</p>
              <p className="text-2xl font-bold text-green-600">Website</p>
              <p className="text-xs text-green-700">45% of all leads</p>
            </div>
          </div>
        </div>

        {/* Conversion Rate Trends */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Conversion Rate Trends</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rate" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              <div>
                <p className="font-medium">New lead from website</p>
                <p className="text-sm text-gray-500">John Smith - 2 minutes ago</p>
              </div>
            </div>
            <button className="text-blue-500 text-sm hover:underline">View</button>
          </div>
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              <div>
                <p className="font-medium">Dispute resolved</p>
                <p className="text-sm text-gray-500">Sarah Johnson - 15 minutes ago</p>
              </div>
            </div>
            <button className="text-blue-500 text-sm hover:underline">View</button>
          </div>
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
              <div>
                <p className="font-medium">Credit score updated</p>
                <p className="text-sm text-gray-500">Mike Williams - 1 hour ago</p>
              </div>
            </div>
            <button className="text-blue-500 text-sm hover:underline">View</button>
          </div>
        </div>
      </div>
    </div>
  );
}