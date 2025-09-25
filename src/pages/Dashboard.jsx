import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext'; // FIXED: contexts with 's'
import { 
  Users, UserCheck, Phone, TrendingUp, 
  Calendar, MessageSquare, Target, DollarSign,
  Clock, AlertCircle, CheckCircle, Activity,
  ArrowUp, ArrowDown, Briefcase, Award,
  BarChart3, PieChart, LineChart
} from 'lucide-react';
import QuickContactConverter from '../components/QuickContactConverter';
import HotLeadsWidget from '../components/HotLeadsWidget';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalClients: 0,
    aiCalls: 0,
    tasksToday: 0,
    hotLeads: 0,
    revenue: 0,
    conversionRate: 0,
    monthlyGrowth: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    const unsubscribers = [];

    // Listen to leads with enhanced stats
  const leadsQuery = query(collection(db, 'contacts'), where('roles', 'array-contains', 'lead'));
    unsubscribers.push(
      onSnapshot(leadsQuery, (snapshot) => {
        const hotLeadsCount = snapshot.docs.filter(doc => 
          doc.data().status === 'hot' || doc.data().leadScore >= 8
        ).length;
        setStats(prev => ({ 
          ...prev, 
          totalLeads: snapshot.size,
          hotLeads: hotLeadsCount 
        }));
      })
    );

    // Listen to clients with revenue calculation
  const clientsQuery = query(collection(db, 'contacts'), where('roles', 'array-contains', 'client'));
    unsubscribers.push(
      onSnapshot(clientsQuery, (snapshot) => {
        const totalRevenue = snapshot.docs.reduce((sum, doc) => {
          const data = doc.data();
          return sum + (data.revenue || 0) + (data.monthlyRevenue || 0) * 12;
        }, 0);
        setStats(prev => ({ 
          ...prev, 
          totalClients: snapshot.size,
          revenue: totalRevenue
        }));
      })
    );

    // Listen to AI calls
    const aiCallsQuery = query(
      collection(db, 'aiReceptionistCalls'), 
      orderBy('processedAt', 'desc'),
      limit(50)
    );
    unsubscribers.push(
      onSnapshot(aiCallsQuery, (snapshot) => {
        setStats(prev => ({ ...prev, aiCalls: snapshot.size }));
      })
    );

    // Listen to recent activities with more detail
    const activitiesQuery = query(
      collection(db, 'aiReceptionistCalls'),
      orderBy('processedAt', 'desc'),
      limit(10)
    );
    unsubscribers.push(
      onSnapshot(activitiesQuery, (snapshot) => {
        const activities = snapshot.docs.map(doc => ({
          id: doc.id,
          type: 'call',
          ...doc.data()
        }));
        setRecentActivities(activities);
        setLoading(false);
      })
    );

    // Calculate conversion rate
    const calculateConversionRate = () => {
      if (stats.totalLeads + stats.totalClients > 0) {
        const rate = (stats.totalClients / (stats.totalLeads + stats.totalClients)) * 100;
        setStats(prev => ({ ...prev, conversionRate: rate }));
      }
    };
    
    calculateConversionRate();

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [stats.totalLeads, stats.totalClients]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-3 rounded-lg ${color.bg}`}>
          <Icon className={`w-6 h-6 ${color.text}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{value}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{title}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {getTimeGreeting()}, {user?.displayName || user?.email?.split('@')[0] || 'User'}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Here's your business overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        {['today', 'week', 'month', 'year'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              timeRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="Active Leads"
          value={stats.totalLeads}
          icon={Users}
          color={{ bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' }}
          trend={12}
          subtitle={`${stats.hotLeads} hot leads`}
        />
        
        <StatCard
          title="Hot Leads"
          value={stats.hotLeads}
          icon={TrendingUp}
          color={{ bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' }}
          trend={25}
          subtitle="Require immediate attention"
        />
        
        <StatCard
          title="Active Clients"
          value={stats.totalClients}
          icon={UserCheck}
          color={{ bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' }}
          trend={8}
          subtitle="Lifetime value"
        />
        
        <StatCard
          title="AI Calls"
          value={stats.aiCalls}
          icon={Phone}
          color={{ bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' }}
          trend={15}
          subtitle="This period"
        />
        
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.revenue)}
          icon={DollarSign}
          color={{ bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' }}
          trend={18}
          subtitle="Total revenue"
        />
        
        <StatCard
          title="Conversion"
          value={`${stats.conversionRate.toFixed(1)}%`}
          icon={Target}
          color={{ bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' }}
          trend={5}
          subtitle="Lead to client"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hot Leads Widget - Takes 1 column */}
        <div className="lg:col-span-1">
          <HotLeadsWidget />
        </div>

        {/* Quick Contact Converter - Takes 2 columns */}
        <div className="lg:col-span-2">
          <QuickContactConverter />
        </div>

        {/* Recent AI Activities - Full width */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent AI Activities
            </h2>
          </div>
          <div className="p-6">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Phone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recent AI calls</p>
                <p className="text-xs mt-1">Calls will appear here as they come in</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.leadScore >= 8 ? 'bg-red-500' :
                      activity.leadScore >= 5 ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">
                            {activity.callerName || activity.caller || 'Unknown Caller'}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Score: {activity.leadScore || 0}/10 • Duration: {activity.duration || 0}s
                            {activity.urgencyLevel && ` • ${activity.urgencyLevel} urgency`}
                          </p>
                          {activity.summary && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
                              {activity.summary}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 flex-shrink-0">
                          {activity.processedAt ? 
                            new Date(activity.processedAt.toDate ? 
                              activity.processedAt.toDate() : 
                              activity.processedAt
                            ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                            'Recently'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/leads')}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-center group"
              >
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Add Lead</span>
              </button>
              
              <button
                onClick={() => navigate('/clients')}
                className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-center group"
              >
                <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Add Client</span>
              </button>
              
              <button
                onClick={() => navigate('/ai-receptionist')}
                className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-center group"
              >
                <Phone className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">AI Calls</span>
              </button>
              
              <button
                onClick={() => navigate('/calendar')}
                className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-center group"
              >
                <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Schedule</span>
              </button>
              
              <button
                onClick={() => navigate('/analytics')}
                className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-center group"
              >
                <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Analytics</span>
              </button>
              
              <button
                onClick={() => navigate('/messages')}
                className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors text-center group"
              >
                <MessageSquare className="w-6 h-6 text-pink-600 dark:text-pink-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Messages</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Lead Sources
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">AI Receptionist</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">45%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Website</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">30%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Referrals</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">25%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Top Performers
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-xs font-bold">
                  1
                </div>
                <span className="text-sm text-gray-800 dark:text-white">John Smith</span>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">12 deals</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-bold">
                  2
                </div>
                <span className="text-sm text-gray-800 dark:text-white">Sarah Johnson</span>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">10 deals</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                  3
                </div>
                <span className="text-sm text-gray-800 dark:text-white">Mike Williams</span>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">8 deals</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Monthly Trend
          </h3>
          <div className="flex items-end justify-between h-24 gap-2">
            {[40, 65, 45, 80, 55, 75, 90].map((height, index) => (
              <div key={index} className="flex-1">
                <div 
                  className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                  style={{ height: `${height}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">Mon</span>
            <span className="text-xs text-gray-500">Sun</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;