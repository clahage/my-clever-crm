import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import disputeService from '../services/disputeService';
import { 
  FileText, 
  CreditCard, 
  Scale, 
  TrendingUp, 
  AlertCircle, 
  Send,
  Clock,
  CheckCircle,
  BarChart3,
  Users,
  ArrowRight,
  Activity,
  Target,
  Award
} from 'lucide-react';

const Disputes = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    sent: 0,
    pending: 0,
    resolved: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.uid) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Get letter statistics
      const letterStats = await disputeService.getLetterStats(user.uid);
      setStats(letterStats);

      // Get recent letters for activity feed
      const recentLetters = await disputeService.getLetters(user.uid, { limit: 5 });
      
      // Transform letters into activity items
      const activities = recentLetters.map(letter => ({
        id: letter.id,
        type: getActivityType(letter),
        message: getActivityMessage(letter),
        time: getRelativeTime(letter.updatedAt || letter.createdAt),
        color: getActivityColor(letter.status)
      }));
      
      setRecentActivity(activities);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty data on error
      setStats({
        total: 0,
        draft: 0,
        sent: 0,
        pending: 0,
        resolved: 0
      });
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityType = (letter) => {
    if (letter.status === 'resolved') return 'resolved';
    if (letter.status === 'sent') return 'sent';
    if (letter.status === 'pending') return 'pending';
    return 'created';
  };

  const getActivityMessage = (letter) => {
    const bureau = letter.bureau || 'Credit Bureau';
    switch (letter.status) {
      case 'resolved':
        return `Dispute resolved with ${bureau}`;
      case 'sent':
        return `Dispute letter sent to ${bureau}`;
      case 'pending':
        return `Awaiting response from ${bureau}`;
      default:
        return `New dispute letter created for ${bureau}`;
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-500';
      case 'sent': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const calculateSuccessRate = () => {
    if (stats.total === 0) return '0';
    const successRate = (stats.resolved / stats.total) * 100;
    return successRate.toFixed(1);
  };

  const features = [
    {
      title: 'Dispute Letters',
      description: 'Create, manage, and track dispute letters',
      icon: <FileText className="w-8 h-8" />,
      link: '/dispute-letters',
      color: 'bg-blue-500',
      stats: `${stats.total} letters`
    },
    {
      title: 'Credit Reports',
      description: 'View and analyze your credit reports',
      icon: <CreditCard className="w-8 h-8" />,
      link: '/credit-reports',
      color: 'bg-green-500',
      stats: '3 bureaus'
    },
    {
      title: 'Credit Scores',
      description: 'Track credit score improvements over time',
      icon: <TrendingUp className="w-8 h-8" />,
      link: '/credit-scores',
      color: 'bg-purple-500',
      stats: 'Live tracking'
    },
    {
      title: 'Business Credit',
      description: 'Manage business credit and disputes',
      icon: <Scale className="w-8 h-8" />,
      link: '/business-credit',
      color: 'bg-orange-500',
      stats: 'D&B, Experian'
    }
  ];

  const quickStats = [
    { 
      label: 'Active Disputes', 
      value: stats.sent + stats.pending, 
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'border-yellow-500'
    },
    { 
      label: 'Letters Sent', 
      value: stats.sent, 
      icon: <Send className="w-5 h-5" />,
      color: 'border-blue-500'
    },
    { 
      label: 'Resolved', 
      value: stats.resolved, 
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'border-green-500'
    },
    { 
      label: 'Success Rate', 
      value: `${calculateSuccessRate()}%`, 
      icon: <Award className="w-5 h-5" />,
      color: 'border-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dispute Center</h1>
        <p className="text-gray-600">Manage all aspects of credit disputes and improvements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${stat.color}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className="text-gray-400">{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={feature.link}
                  className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:-translate-y-1 p-6 border border-gray-200 group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${feature.color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {feature.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {feature.stats}
                        </span>
                        <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/dispute-letters"
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">New Dispute Letter</span>
              </Link>
              <Link
                to="/credit-reports"
                className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <BarChart3 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Import Report</span>
              </Link>
              <Link
                to="/clients"
                className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">View Clients</span>
              </Link>
              <Link
                to="/analytics"
                className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Target className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">View Analytics</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 h-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-3 pb-3 border-b last:border-0"
                  >
                    <div className={`w-2 h-2 ${activity.color} rounded-full mt-1.5`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No recent activity</p>
                <Link
                  to="/dispute-letters"
                  className="inline-block mt-3 text-blue-600 text-sm hover:underline"
                >
                  Create your first dispute letter →
                </Link>
              </div>
            )}
            
            {recentActivity.length > 0 && (
              <Link
                to="/dispute-letters"
                className="block mt-4 text-center text-sm text-blue-600 hover:underline"
              >
                View all disputes →
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Your Dispute Progress</h3>
            <p className="text-sm text-gray-600">
              You have {stats.pending} disputes pending response and {stats.draft} drafts ready to send.
            </p>
          </div>
          <Link
            to="/dispute-letters"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Manage Disputes
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Disputes;