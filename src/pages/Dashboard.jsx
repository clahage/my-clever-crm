import React, { useState, useEffect } from 'react';
import { Users, FileText, DollarSign, TrendingUp, Calendar, Bell, Activity, CreditCard, AlertCircle, Clock, CheckCircle } from 'lucide-react';

import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const Dashboard = () => {
  const currentUser = { email: 'test@test.com' };
  const [stats, setStats] = useState({
    activeClients: 0,
    totalDisputes: 0,
    revenue: 0,
    successRate: 78
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const contactsSnapshot = await getDocs(collection(db, 'contacts'));
        const clients = contactsSnapshot.docs.filter(doc => doc.data().category === 'client');
        const leads = contactsSnapshot.docs.filter(doc => doc.data().category === 'lead');
        
        setStats({
          activeClients: clients.length,
          totalDisputes: 87,
          revenue: 15420,
          successRate: 78
        });
      } catch (error) {
        console.log('Stats loading error:', error);
      }
    };
    
    loadStats();
  }, []);

  const disputeStages = [
    { stage: 'Intake', count: 23, color: 'bg-blue-500' },
    { stage: 'In Progress', count: 34, color: 'bg-yellow-500' },
    { stage: 'Pending Response', count: 18, color: 'bg-purple-500' },
    { stage: 'Resolved', count: 12, color: 'bg-green-500' }
  ];

  const recentActivity = [
    { id: 1, type: 'client', icon: Users, message: 'New client John Smith signed up', time: '2 hours ago', color: 'text-blue-600' },
    { id: 2, type: 'dispute', icon: CheckCircle, message: 'Dispute resolved for Sarah Johnson', time: '4 hours ago', color: 'text-green-600' },
    { id: 3, type: 'payment', icon: DollarSign, message: 'Payment received from Mike Davis - $250', time: '6 hours ago', color: 'text-green-600' },
    { id: 4, type: 'dispute', icon: FileText, message: 'New dispute filed for Emily Brown', time: '1 day ago', color: 'text-purple-600' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {currentUser?.email}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <Users className="h-10 w-10 text-blue-600 mb-2" />
          <h3 className="text-2xl font-bold">{stats.activeClients}</h3>
          <p className="text-gray-600 dark:text-gray-400">Active Clients</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <FileText className="h-10 w-10 text-purple-600 mb-2" />
          <h3 className="text-2xl font-bold">{stats.totalDisputes}</h3>
          <p className="text-gray-600 dark:text-gray-400">Total Disputes</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <DollarSign className="h-10 w-10 text-green-600 mb-2" />
          <h3 className="text-2xl font-bold">${stats.revenue.toLocaleString()}</h3>
          <p className="text-gray-600 dark:text-gray-400">Monthly Revenue</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <TrendingUp className="h-10 w-10 text-yellow-600 mb-2" />
          <h3 className="text-2xl font-bold">{stats.successRate}%</h3>
          <p className="text-gray-600 dark:text-gray-400">Success Rate</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Dispute Pipeline</h2>
        <div className="grid grid-cols-4 gap-4">
          {disputeStages.map((stage) => (
            <div key={stage.stage} className="text-center">
              <div className={`${stage.color} text-white rounded-lg p-4 mb-2`}>
                <div className="text-2xl font-bold">{stage.count}</div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stage.stage}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Activity</h2>
        </div>
        <div className="p-6 space-y-4">
          {recentActivity.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex items-start space-x-3">
                <Icon className={`h-5 w-5 mt-0.5 ${item.color}`} />
                <div>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{item.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
