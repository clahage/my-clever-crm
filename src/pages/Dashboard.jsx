import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import {
  BarChart3,
  FileText,
  Folder,
  Bell,
  TrendingUp,
  Users,
  DollarSign,
  AlertCircle
} from 'lucide-react';

const quickActions = [
  { label: 'Credit Scores', href: '/reports', color: 'bg-blue-600' },
  { label: 'Dispute Letters', href: '/disputes', color: 'bg-yellow-500' },
  { label: 'Client Management', href: '/clients', color: 'bg-green-600' },
  { label: 'Progress Portal', href: '/progress', color: 'bg-purple-600' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalClients: 0,
    activeDisputes: 0,
    monthlyRevenue: 0,
    pendingTasks: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch stats
    const fetchStats = async () => {
      try {
        // Get contacts count
        const contactsSnapshot = await getDocs(collection(db, 'contacts'));
        const clientCount = contactsSnapshot.docs.filter(doc => 
          doc.data().type === 'client'
        ).length;

        // Get disputes count
        const disputesSnapshot = await getDocs(collection(db, 'disputes'));
        const activeDisputesCount = disputesSnapshot.docs.filter(doc => 
          doc.data().status !== 'resolved'
        ).length;

        setStats({
          totalClients: clientCount,
          activeDisputes: activeDisputesCount,
          monthlyRevenue: 12450, // Demo value
          pendingTasks: 7 // Demo value
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();

    // Set up real-time activity listener
    const q = query(
      collection(db, 'contacts'),
      orderBy('createdAt', 'desc'),
      where('type', '==', 'lead')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.slice(0, 5).map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'New Lead'
      }));
      setRecentActivity(activities);
    }, (error) => {
      console.error('Activity listener error:', error);
    });

    return () => unsubscribe();
  }, [user]);

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.displayName || user?.email || 'User'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Here's your CRM overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Total Clients"
          value={stats.totalClients}
          color="bg-blue-600"
          trend="+12% this month"
        />
        <StatCard
          icon={FileText}
          label="Active Disputes"
          value={stats.activeDisputes}
          color="bg-yellow-500"
        />
        <StatCard
          icon={DollarSign}
          label="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          color="bg-green-600"
          trend="+8% vs last month"
        />
        <StatCard
          icon={Bell}
          label="Pending Tasks"
          value={stats.pendingTasks}
          color="bg-purple-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => window.location.href = action.href}
              className={`${action.color} text-white p-4 rounded-lg text-center hover:opacity-90 transition-opacity`}
            >
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500">No recent activity</p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {activity.type}: {activity.name || activity.email || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.createdAt ? new Date(activity.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Performance Overview
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-2" />
              <p>Chart visualization coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}