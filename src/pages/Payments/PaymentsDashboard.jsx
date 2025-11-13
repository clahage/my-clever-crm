// src/pages/Payments/PaymentsDashboard.jsx
// ============================================================================
// 💳 PAYMENTS DASHBOARD - HYBRID PAYMENT MANAGEMENT HUB
// ============================================================================
// Main hub for Chase ACH + Zelle payment automation
// Features: Payment tracking, reconciliation, collection management, automation
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Settings,
  Download,
  Upload,
  Mail,
  RefreshCw,
  Plus,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const PaymentsDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [todaysCollections, setTodaysCollections] = useState([]);

  // ===== LOAD DASHBOARD DATA =====
  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load payment statistics
      await loadStats();

      // Load recent payments
      await loadRecentPayments();

      // Load today's collections
      await loadTodaysCollections();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const paymentsRef = collection(db, 'payments');
      const today = new Date();
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      // Get this month's payments
      const monthQuery = query(
        paymentsRef,
        where('dueDate', '>=', thisMonthStart),
        where('dueDate', '<=', today)
      );
      const monthSnapshot = await getDocs(monthQuery);

      let monthlyTotal = 0;
      let successfulPayments = 0;
      let pendingPayments = 0;
      let failedPayments = 0;
      let achCount = 0;
      let zelleCount = 0;

      monthSnapshot.forEach((doc) => {
        const payment = doc.data();
        monthlyTotal += payment.amount || 0;

        if (payment.status === 'completed') successfulPayments++;
        if (payment.status === 'pending') pendingPayments++;
        if (payment.status === 'failed') failedPayments++;

        if (payment.paymentMethod === 'ACH') achCount++;
        if (payment.paymentMethod === 'Zelle') zelleCount++;
      });

      setStats({
        monthlyRevenue: monthlyTotal,
        totalPayments: monthSnapshot.size,
        successfulPayments,
        pendingPayments,
        failedPayments,
        successRate: monthSnapshot.size > 0 ? ((successfulPayments / monthSnapshot.size) * 100).toFixed(1) : 0,
        achCount,
        zelleCount
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentPayments = async () => {
    try {
      const paymentsRef = collection(db, 'payments');
      const recentQuery = query(
        paymentsRef,
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(recentQuery);

      const payments = [];
      snapshot.forEach((doc) => {
        payments.push({ id: doc.id, ...doc.data() });
      });

      setRecentPayments(payments);
    } catch (error) {
      console.error('Error loading recent payments:', error);
    }
  };

  const loadTodaysCollections = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const paymentsRef = collection(db, 'payments');
      const todayQuery = query(
        paymentsRef,
        where('dueDate', '>=', today),
        where('dueDate', '<', tomorrow),
        where('status', 'in', ['pending', 'scheduled'])
      );

      const snapshot = await getDocs(todayQuery);
      const collections = [];
      snapshot.forEach((doc) => {
        collections.push({ id: doc.id, ...doc.data() });
      });

      setTodaysCollections(collections);
    } catch (error) {
      console.error('Error loading today\'s collections:', error);
    }
  };

  // ===== QUICK ACTION HANDLERS =====
  const handleQuickAction = (action) => {
    switch (action) {
      case 'add-payment':
        navigate('/payments/setup');
        break;
      case 'collection-list':
        navigate('/payments/collections');
        break;
      case 'reconcile':
        navigate('/payments/reconciliation');
        break;
      case 'tracking':
        navigate('/payments/tracking');
        break;
      case 'history':
        navigate('/payments/history');
        break;
      case 'recurring':
        navigate('/payments/recurring');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payment dashboard...</p>
        </div>
      </div>
    );
  }

  // ===== PERMISSION CHECK =====
  const isMasterAdmin = userProfile?.role === 'masterAdmin';
  const isAdmin = userProfile?.role === 'admin' || isMasterAdmin;

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">Access Denied</span>
          </div>
          <p className="text-sm text-red-600 mt-2">
            You need Master Admin or Admin privileges to access the Payment Management system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span>Payment Management</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Hybrid Chase ACH + Zelle payment automation system
            </p>
          </div>
          <button
            onClick={() => handleQuickAction('add-payment')}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Payment Method</span>
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                ${stats?.monthlyRevenue?.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stats?.totalPayments || 0} payments this month
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats?.successRate || 0}%
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {stats?.successfulPayments || 0} / {stats?.totalPayments || 0} successful
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats?.pendingPayments || 0}
              </p>
              <p className="text-xs text-yellow-600 mt-1">Awaiting processing</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats?.failedPayments || 0}
              </p>
              <p className="text-xs text-red-600 mt-1">Requires attention</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Settings className="w-6 h-6 text-blue-600" />
          <span>Quick Actions</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button
            onClick={() => handleQuickAction('collection-list')}
            className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
          >
            <Calendar className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
              Today's Collections
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {todaysCollections.length} due
            </span>
          </button>

          <button
            onClick={() => handleQuickAction('reconcile')}
            className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
          >
            <Upload className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
              Reconcile Chase
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Import CSV
            </span>
          </button>

          <button
            onClick={() => handleQuickAction('tracking')}
            className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
          >
            <Search className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
              Track Payments
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Search & Filter
            </span>
          </button>

          <button
            onClick={() => handleQuickAction('recurring')}
            className="flex flex-col items-center justify-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors group"
          >
            <RefreshCw className="w-8 h-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
              Recurring Payments
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Schedules
            </span>
          </button>

          <button
            onClick={() => handleQuickAction('history')}
            className="flex flex-col items-center justify-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors group"
          >
            <FileText className="w-8 h-8 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
              Payment History
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              View All
            </span>
          </button>

          <button
            onClick={() => handleQuickAction('add-payment')}
            className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
          >
            <Plus className="w-8 h-8 text-gray-600 dark:text-gray-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
              Setup Client
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              New Method
            </span>
          </button>
        </div>
      </div>

      {/* TODAY'S COLLECTIONS */}
      {todaysCollections.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              <span>Today's Collections ({todaysCollections.length})</span>
            </h2>
            <button
              onClick={() => handleQuickAction('collection-list')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {todaysCollections.slice(0, 5).map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {payment.clientName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {payment.paymentMethod} • {payment.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    ${payment.amount?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Due today
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECENT PAYMENTS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>Recent Payments</span>
          </h2>
          <button
            onClick={() => handleQuickAction('history')}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {recentPayments.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              No payments yet. Start by setting up client payment methods.
            </p>
          ) : (
            recentPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => navigate(`/payments/tracking?id=${payment.id}`)}
              >
                <div className="flex items-center space-x-3">
                  {payment.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {payment.status === 'pending' && <Clock className="w-5 h-5 text-yellow-600" />}
                  {payment.status === 'failed' && <AlertCircle className="w-5 h-5 text-red-600" />}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {payment.clientName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {payment.paymentMethod} • {new Date(payment.createdAt?.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    ${payment.amount?.toLocaleString()}
                  </p>
                  <p className={`text-xs capitalize ${
                    payment.status === 'completed' ? 'text-green-600' :
                    payment.status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {payment.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsDashboard;
