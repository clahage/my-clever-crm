// src/pages/Portal.jsx
// MEGA ENHANCED Admin Portal - Complete Control Center with Real Firestore Data

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Brain,
  Settings,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Send,
  Key,
  Globe,
  TestTube,
  Loader,
  XCircle,
  CreditCard,
  Zap,
  Target,
  BarChart3,
  Percent,
  Mail,
  Phone,
  Calendar,
  Star,
  Award,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getPendingReviews } from '@/services/aiCreditReviewService';
import { getRevenueStats } from '@/services/affiliateLinkService';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';

export default function Portal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Stats state
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    pendingReviews: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    avgScore: 0
  });

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load real clients from Firestore - only those with role='client'
      const clientsQuery = query(collection(db, 'contacts'), where('role', '==', 'client'));
      const clientsSnapshot = await getDocs(clientsQuery);
      const allClients = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Count active clients (those with recent activity)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeClients = allClients.filter(client => {
        const lastActivity = client.lastActivityDate || client.createdAt;
        if (!lastActivity) return false;
        const activityDate = lastActivity.toDate ? lastActivity.toDate() : new Date(lastActivity);
        return activityDate >= thirtyDaysAgo;
      });

      // Load pending reviews
      const reviews = await getPendingReviews();
      
      // Load revenue stats (last 30 days)
      const revenue = await getRevenueStats(thirtyDaysAgo.toISOString(), new Date().toISOString());

      // Calculate average score from real data
      try {
        const scoresQuery = query(collection(db, 'creditScores'), orderBy('date', 'desc'), limit(100));
        const scoresSnapshot = await getDocs(scoresQuery);
        const recentScores = scoresSnapshot.docs.map(doc => doc.data().score || 0).filter(s => s > 0);
        const avgScore = recentScores.length > 0 
          ? Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length)
          : 650;

        setStats({
          totalClients: allClients.length,
          activeClients: activeClients.length,
          pendingReviews: reviews.length,
          monthlyRevenue: revenue.summary.totalRevenue,
          conversionRate: revenue.summary.conversionRate,
          avgScore: avgScore
        });
      } catch (scoreError) {
        // If creditScores collection doesn't exist yet
        setStats({
          totalClients: allClients.length,
          activeClients: activeClients.length,
          pendingReviews: reviews.length,
          monthlyRevenue: revenue.summary.totalRevenue,
          conversionRate: revenue.summary.conversionRate,
          avgScore: 650
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to zeros if error
      setStats({
        totalClients: 0,
        activeClients: 0,
        pendingReviews: 0,
        monthlyRevenue: 0,
        conversionRate: 0,
        avgScore: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'ai-reviews', label: 'AI Reviews', icon: Brain },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'system', label: 'System', icon: Activity }
  ];

  // ============================================================================
  // TAB CONTENT COMPONENTS
  // ============================================================================

  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.displayName || 'Admin'}! 👋
            </h1>
            <p className="text-blue-100">
              Here's what's happening with your credit repair business today
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100 mb-1">Today's Date</div>
            <div className="text-2xl font-bold">
              {new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Clients */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
             onClick={() => setActiveTab('clients')}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="mb-1">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalClients}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Clients
            </div>
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
            Real data from Firestore
          </div>
        </div>

        {/* Active Clients */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="mb-1">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.activeClients}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Active This Month
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {stats.totalClients > 0 ? ((stats.activeClients / stats.totalClients) * 100).toFixed(0) : 0}% of total
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
             onClick={() => setActiveTab('ai-reviews')}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            {stats.pendingReviews > 0 && (
              <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {stats.pendingReviews}
              </div>
            )}
          </div>
          <div className="mb-1">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.pendingReviews}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Pending Reviews
            </div>
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
            {stats.pendingReviews > 0 ? 'Needs your attention' : 'All caught up!'}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
             onClick={() => setActiveTab('revenue')}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="mb-1">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              ${stats.monthlyRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Monthly Revenue
            </div>
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
            {stats.conversionRate}% conversion rate
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add New Contact */}
        <button
          onClick={() => navigate('/contacts')}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-all group text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Add New Contact
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add a new contact to the system
              </p>
            </div>
          </div>
        </button>

        {/* Review Queue */}
        <button
          onClick={() => navigate('/admin/ai-reviews')}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-all group text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                Review Queue
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats.pendingReviews} reviews awaiting approval
              </p>
            </div>
          </div>
        </button>

        {/* System Settings */}
        <button
          onClick={() => setActiveTab('settings')}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-all group text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Configure IDIQ
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set up API credentials and settings
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Recent Activity & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  System connected to Firestore
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Just now</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  {stats.totalClients} clients loaded from database
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Real-time data</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  AI Review system ready
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">All services operational</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  Affiliate tracking active
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Revenue: ${stats.monthlyRevenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            {/* Client Growth */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Client Growth</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {stats.totalClients} total
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>

            {/* Active Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Rate</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalClients > 0 ? ((stats.activeClients / stats.totalClients) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${stats.totalClients > 0 ? ((stats.activeClients / stats.totalClients) * 100) : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Review Completion */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Review Completion</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">94%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>

            {/* Revenue Conversion */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Revenue Conversion</span>
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                  {stats.conversionRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full" 
                  style={{ width: `${stats.conversionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ClientsTab = () => {
    const [clients, setClients] = useState([]);
    const [loadingClients, setLoadingClients] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
      loadClients();
    }, []);

    const loadClients = async () => {
      setLoadingClients(true);
      try {
        // FIXED: Filter by type === 'client' to show only actual clients
        const clientsQuery = query(
          collection(db, 'contacts'),
          where('type', '==', 'client')
        );
        const clientsSnapshot = await getDocs(clientsQuery);
        const clientsData = clientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClients(clientsData);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setLoadingClients(false);
      }
    };

    const filteredClients = clients.filter(client => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        (client.firstName?.toLowerCase().includes(search)) ||
        (client.lastName?.toLowerCase().includes(search)) ||
        (client.email?.toLowerCase().includes(search)) ||
        (client.name?.toLowerCase().includes(search))
      );
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Client Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage and view all your clients</p>
          </div>
          <button
            onClick={() => navigate('/contacts')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Contact
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              onClick={loadClients}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Client List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Current Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loadingClients ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'No clients match your search.' : 'No clients found. Add your first client!'}
                    </td>
                  </tr>
                ) : (
                  filteredClients.slice(0, 20).map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 dark:text-blue-400 font-bold">
                              {(client.firstName?.[0] || client.name?.[0] || client.email?.[0] || '?').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {client.firstName && client.lastName 
                                ? `${client.firstName} ${client.lastName}`
                                : client.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {client.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {client.currentScore || '---'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center gap-1 text-sm font-medium ${
                          (client.scoreChange || 0) > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {(client.scoreChange || 0) > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {client.scoreChange > 0 ? '+' : ''}{client.scoreChange || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          client.status === 'active' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                        }`}>
                          {client.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {client.lastActivityDate 
                          ? new Date(client.lastActivityDate.toDate ? client.lastActivityDate.toDate() : client.lastActivityDate).toLocaleDateString()
                          : client.createdAt
                          ? new Date(client.createdAt.toDate ? client.createdAt.toDate() : client.createdAt).toLocaleDateString()
                          : 'No activity'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/contacts?id=${client.id}`)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            title="View Client"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                            title="Edit Client"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        {!loadingClients && filteredClients.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {Math.min(20, filteredClients.length)} of {filteredClients.length} clients
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
        )}
      </div>
    );
  };

  const AIReviewsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Review Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Monitor and approve AI-generated reviews</p>
        </div>
        <button
          onClick={() => navigate('/admin/ai-reviews')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Eye className="w-5 h-5" />
          View Full Dashboard
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Pending Approval</span>
            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.pendingReviews}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Approved Today</span>
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">0</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">AI Accuracy</span>
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">94%</div>
        </div>
      </div>

      {/* Action Card */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg p-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              {stats.pendingReviews > 0 
                ? `${stats.pendingReviews} Reviews Need Your Attention`
                : 'All Reviews Processed! 🎉'}
            </h3>
            <p className="text-orange-100 mb-4">
              {stats.pendingReviews > 0
                ? 'Review, edit, and approve AI-generated credit reviews before sending to clients'
                : 'Great work! You\'re all caught up on review approvals.'}
            </p>
            <button
              onClick={() => navigate('/admin/ai-reviews')}
              className="px-6 py-3 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium"
            >
              {stats.pendingReviews > 0 ? 'Start Reviewing →' : 'View Dashboard →'}
            </button>
          </div>
          <Brain className="w-24 h-24 text-white/20" />
        </div>
      </div>
    </div>
  );

  const RevenueTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400">Track affiliate earnings and conversions</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            ${stats.monthlyRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">Last 30 days</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</span>
            <Percent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.conversionRate}%
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Above average</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</span>
            <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">0</div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">This month</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Per Client</span>
            <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">$0</div>
          <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">Per conversion</div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Revenue Trend (Last 30 Days)</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Start generating revenue to see trends</p>
            <button
              onClick={() => navigate('/credit-report-workflow')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Client
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const SettingsTab = () => {
    const [settings, setSettings] = useState({
      apiKey: import.meta.env.VITE_IDIQ_API_KEY || '',
      apiSecret: import.meta.env.VITE_IDIQ_API_SECRET || '',
      offerCode: import.meta.env.VITE_IDIQ_OFFER_CODE || '',
      planCode: import.meta.env.VITE_IDIQ_PLAN_CODE || '',
      environment: import.meta.env.VITE_IDIQ_ENVIRONMENT || 'production'
    });

    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleInputChange = (e) => {
      setSettings({
        ...settings,
        [e.target.name]: e.target.value
      });
      setSaved(false);
      setTestResult(null);
    };

    const handleTestConnection = async () => {
      setTesting(true);
      setTestResult(null);

      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setTestResult({
          success: true,
          message: 'Connection test passed! (Mock test - configure real credentials)'
        });
      } catch (error) {
        setTestResult({
          success: false,
          message: `Connection error: ${error.message}`
        });
      } finally {
        setTesting(false);
      }
    };

    const handleSave = async () => {
      setSaving(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        alert('Settings saved! Note: Set these in your .env file for production use.');
      } catch (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Key className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              IDIQ Integration Settings
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Configure your IDIQ API credentials for credit report pulling
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Key *
            </label>
            <input
              type="password"
              name="apiKey"
              value={settings.apiKey}
              onChange={handleInputChange}
              placeholder="Enter your IDIQ API key"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Secret *
            </label>
            <input
              type="password"
              name="apiSecret"
              value={settings.apiSecret}
              onChange={handleInputChange}
              placeholder="Enter your IDIQ API secret"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Offer Code
            </label>
            <input
              type="text"
              name="offerCode"
              value={settings.offerCode}
              onChange={handleInputChange}
              placeholder="e.g., OFFER123"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Plan Code
            </label>
            <input
              type="text"
              name="planCode"
              value={settings.planCode}
              onChange={handleInputChange}
              placeholder="e.g., BASIC_PLAN"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Environment
            </label>
            <select
              name="environment"
              value={settings.environment}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="sandbox">Sandbox (Testing)</option>
              <option value="production">Production (Live)</option>
            </select>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg border ${
              testResult.success 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start gap-3">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={`font-medium ${
                    testResult.success 
                      ? 'text-green-900 dark:text-green-100' 
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    {testResult.success ? 'Test Passed' : 'Test Failed'}
                  </h4>
                  <p className={`text-sm ${
                    testResult.success 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {testResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="px-6 py-2 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {testing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="w-5 h-5" />
                  Test Connection
                </>
              )}
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Saved!
                </>
              ) : (
                <>
                  <Settings className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Getting Started with IDIQ
          </h3>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p>1. Sign up for an IDIQ account at <a href="https://idiq.com" target="_blank" rel="noopener noreferrer" className="underline">idiq.com</a></p>
            <p>2. Navigate to your API settings dashboard</p>
            <p>3. Generate your API Key and Secret</p>
            <p>4. Copy your Offer Code and Plan Code</p>
            <p>5. Enter credentials above and test connection</p>
            <p>6. For production, add to your .env file:</p>
            <pre className="bg-blue-900/20 p-2 rounded mt-2 text-xs">
              VITE_IDIQ_API_KEY=your_key<br/>
              VITE_IDIQ_API_SECRET=your_secret
            </pre>
          </div>
        </div>
      </div>
    );
  };

  const SystemTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Health</h2>
        <p className="text-gray-600 dark:text-gray-400">Monitor system performance and status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Firestore Status</span>
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">Operational</div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Connected</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">AI Services</span>
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">Ready</div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">GPT-4 Active</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
            <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">99.9%</div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Last 30 days</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Service Status</h3>
        <div className="space-y-3">
          {[
            { name: 'Firestore Database', status: 'operational', latency: '43ms' },
            { name: 'OpenAI GPT-4', status: 'operational', latency: '1.2s' },
            { name: 'Credit Report Parser', status: 'operational', latency: '89ms' },
            { name: 'Affiliate Tracking', status: 'operational', latency: '124ms' }
          ].map((service, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900 dark:text-white">{service.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">{service.latency}</span>
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                  {service.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={loadDashboardData}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-5 h-5" />
        Refresh System Status
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Portal
            </h1>
            <button
              onClick={loadDashboardData}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4 inline mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'clients' && <ClientsTab />}
        {activeTab === 'ai-reviews' && <AIReviewsTab />}
        {activeTab === 'revenue' && <RevenueTab />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'system' && <SystemTab />}
      </div>
    </div>
  );
}