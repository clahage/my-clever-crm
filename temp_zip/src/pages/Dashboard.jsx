// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import DailyPriorities from '@/components/laurie/DailyPriorities';
import {
  Users, TrendingUp, DollarSign, Activity, CreditCard, Target, Clock,
  FileText, CheckCircle, XCircle, AlertCircle, Calendar, Mail, Phone,
  MessageSquare, Star, Award, Shield, BarChart3, PieChart, LineChart,
  ArrowUp, ArrowDown, Eye, Bell, Settings, RefreshCw, Filter,
  ChevronRight, ChevronDown, ChevronUp, MoreVertical, Download,
  UserPlus, UserCheck, UserX, Package, Send, Zap, Sparkles,
  Brain, Hash, Layers, Globe, Briefcase, Building, MapPin,
  ThumbsUp, Heart, Share2, Bookmark, Flag, Info, HelpCircle,
  Battery, Signal, Wifi, Video, PhoneCall, MessageCircle, Link2,
  GitBranch, Sun, Moon, Cloud, Droplet, Wind, Thermometer
} from 'lucide-react';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Real-time data simulation
  const [liveData, setLiveData] = useState({
    activeUsers: 42,
    pendingTasks: 18,
    newLeads: 5
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3 - 1),
        pendingTasks: prev.pendingTasks + Math.floor(Math.random() * 3 - 1),
        newLeads: prev.newLeads + Math.floor(Math.random() * 2)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  // Mock data
  const stats = {
    totalClients: { value: 342, change: '+12%', trend: 'up' },
    activeDisputes: { value: 89, change: '+5', trend: 'up' },
    avgScore: { value: 695, change: '+42', trend: 'up' },
    monthlyRevenue: { value: '$48.2K', change: '+18%', trend: 'up' },
    successRate: { value: '76%', change: '+3%', trend: 'up' },
    itemsRemoved: { value: 234, change: '+28', trend: 'up' },
    responseRate: { value: '94%', change: '-2%', trend: 'down' },
    satisfaction: { value: 4.8, change: '+0.2', trend: 'up' }
  };

  const recentActivities = [
    { id: 1, type: 'dispute', user: 'John Smith', action: 'Dispute sent to Equifax', time: '5 min ago', status: 'success' },
    { id: 2, type: 'payment', user: 'Sarah Johnson', action: 'Payment received - $150', time: '12 min ago', status: 'success' },
    { id: 3, type: 'lead', user: 'New Lead', action: 'Michael Brown signed up', time: '25 min ago', status: 'info' },
    { id: 4, type: 'response', user: 'Emma Wilson', action: 'Bureau response received', time: '1 hour ago', status: 'warning' },
    { id: 5, type: 'client', user: 'Robert Davis', action: 'Upgraded to Premium', time: '2 hours ago', status: 'success' }
  ];

  const upcomingTasks = [
    { id: 1, title: 'Follow up with Sarah Johnson', due: '10:00 AM', priority: 'high', type: 'call' },
    { id: 2, title: 'Send Round 2 disputes - 5 clients', due: '2:00 PM', priority: 'medium', type: 'dispute' },
    { id: 3, title: 'Review bureau responses', due: '3:30 PM', priority: 'high', type: 'review' },
    { id: 4, title: 'Team meeting - Weekly sync', due: '4:00 PM', priority: 'low', type: 'meeting' },
    { id: 5, title: 'Generate monthly reports', due: 'Tomorrow', priority: 'medium', type: 'report' }
  ];

  const topPerformers = [
    { name: 'John Smith', score: 745, increase: 68, disputes: 12, removed: 9, value: '$4,500' },
    { name: 'Emma Wilson', score: 720, increase: 55, disputes: 8, removed: 6, value: '$3,200' },
    { name: 'Michael Brown', score: 695, increase: 42, disputes: 10, removed: 7, value: '$6,200' }
  ];

  const notifications = [
    { id: 1, type: 'alert', message: '3 disputes need immediate attention', time: '2 min ago' },
    { id: 2, type: 'success', message: 'Collection removed for John Smith', time: '15 min ago' },
    { id: 3, type: 'info', message: '5 new leads from website', time: '1 hour ago' },
    { id: 4, type: 'warning', message: 'Payment failed for 2 clients', time: '3 hours ago' }
  ];

  const chartData = {
    scoreProgress: [
      { month: 'Jan', avg: 620 },
      { month: 'Feb', avg: 635 },
      { month: 'Mar', avg: 648 },
      { month: 'Apr', avg: 662 },
      { month: 'May', avg: 678 },
      { month: 'Jun', avg: 695 }
    ],
    disputeSuccess: [
      { bureau: 'Equifax', success: 78, pending: 12, failed: 10 },
      { bureau: 'Experian', success: 82, pending: 8, failed: 10 },
      { bureau: 'TransUnion', success: 75, pending: 15, failed: 10 }
    ],
    revenue: [
      { week: 'W1', amount: 12500 },
      { week: 'W2', amount: 14200 },
      { week: 'W3', amount: 11800 },
      { week: 'W4', amount: 15700 }
    ]
  };

  const getActivityIcon = (type) => {
    const icons = {
      dispute: <FileText className="w-4 h-4" />,
      payment: <DollarSign className="w-4 h-4" />,
      lead: <UserPlus className="w-4 h-4" />,
      response: <MessageSquare className="w-4 h-4" />,
      client: <UserCheck className="w-4 h-4" />
    };
    return icons[type] || <Activity className="w-4 h-4" />;
  };

  const getTaskIcon = (type) => {
    const icons = {
      call: <Phone className="w-4 h-4" />,
      dispute: <FileText className="w-4 h-4" />,
      review: <Eye className="w-4 h-4" />,
      meeting: <Users className="w-4 h-4" />,
      report: <BarChart3 className="w-4 h-4" />
    };
    return icons[type] || <Clock className="w-4 h-4" />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600 bg-red-50',
      medium: 'text-yellow-600 bg-yellow-50',
      low: 'text-green-600 bg-green-50'
    };
    return colors[priority] || 'text-gray-600 bg-gray-50';
  };

  const MetricDetailModal = ({ metric, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Metric Analysis</h3>
          <button onClick={onClose}>
            <XCircle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Current Performance</p>
            <p className="text-3xl font-bold">{metric?.value}</p>
            <p className={`text-sm mt-1 ${metric?.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {metric?.change} from last period
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">7-Day Trend</p>
              <div className="h-20 flex items-end space-x-1">
                {[65, 72, 68, 74, 71, 78, 82].map((height, i) => (
                  <div key={i} className="flex-1 bg-blue-500 rounded-t" style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Projections</p>
              <p className="text-lg font-semibold">Next Week: +5-8%</p>
              <p className="text-lg font-semibold">Next Month: +12-15%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
  {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your business overview.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-700">{liveData.activeUsers} Active Now</span>
          </div>
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button 
            onClick={handleRefresh}
            className={`p-2 border rounded-lg hover:bg-gray-50 ${refreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 border rounded-lg hover:bg-gray-50 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button className="p-2 border rounded-lg hover:bg-gray-50">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

            {/* Notifications Panel */}
      {showNotifications && (
        <div className="mb-6 bg-white rounded-lg border p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Notifications</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">Mark all as read</button>
          </div>
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div key={notif.id} className="flex items-start p-2 hover:bg-gray-50 rounded">
                <div className={`p-1 rounded-lg mr-3 ${
                  notif.type === 'alert' ? 'bg-red-100' :
                  notif.type === 'success' ? 'bg-green-100' :
                  notif.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  {notif.type === 'alert' && <AlertCircle className="w-4 h-4 text-red-600" />}
                  {notif.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                  {notif.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
                  {notif.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div 
          className="bg-white rounded-lg p-4 border hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setSelectedMetric(stats.totalClients)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className={`text-sm flex items-center ${
              stats.totalClients.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.totalClients.trend === 'up' ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
              {stats.totalClients.change}
            </span>
          </div>
          <p className="text-2xl font-bold">{stats.totalClients.value}</p>
          <p className="text-sm text-gray-600 mt-1">Total Clients</p>
          <div className="mt-3 h-12">
            <svg className="w-full h-full" viewBox="0 0 100 40">
              <polyline
                points="0,35 20,30 40,25 60,20 80,15 100,10"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
              />
              <polyline
                points="0,35 20,30 40,25 60,20 80,15 100,10 100,40 0,40"
                fill="url(#gradient)"
                fillOpacity="0.1"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm flex items-center text-green-600">
              <ArrowUp className="w-4 h-4 mr-1" />
              {stats.monthlyRevenue.change}
            </span>
          </div>
          <p className="text-2xl font-bold">{stats.monthlyRevenue.value}</p>
          <p className="text-sm text-gray-600 mt-1">Monthly Revenue</p>
          <div className="mt-3">
            <div className="flex items-end space-x-1 h-12">
              {[40, 65, 45, 70, 85, 75, 90].map((height, i) => (
                <div key={i} className="flex-1 bg-green-200 rounded-t hover:bg-green-300 transition-colors" 
                     style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm flex items-center text-green-600">
              <ArrowUp className="w-4 h-4 mr-1" />
              {stats.avgScore.change}
            </span>
          </div>
          <p className="text-2xl font-bold">{stats.avgScore.value}</p>
          <p className="text-sm text-gray-600 mt-1">Avg Credit Score</p>
          <div className="mt-3">
            <div className="relative h-12">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full" style={{ width: '78%' }}>
                    <div className="h-full bg-white bg-opacity-30 animate-pulse rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm flex items-center text-green-600">
              <ArrowUp className="w-4 h-4 mr-1" />
              {stats.successRate.change}
            </span>
          </div>
          <p className="text-2xl font-bold">{stats.successRate.value}</p>
          <p className="text-sm text-gray-600 mt-1">Success Rate</p>
          <div className="mt-3">
            <div className="relative h-12">
              <svg className="w-full h-full -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="#E5E7EB" strokeWidth="4" fill="none" />
                <circle cx="24" cy="24" r="20" stroke="#FB923C" strokeWidth="4" fill="none"
                        strokeDasharray={`${76 * 1.26} 126`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold">76%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Recent Activity</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className={`p-2 rounded-lg mr-3 ${
                    activity.status === 'success' ? 'bg-green-50' :
                    activity.status === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'
                  }`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Upcoming Tasks</h2>
              <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
                {liveData.pendingTasks} pending
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-start">
                  <div className={`p-2 rounded-lg mr-3 ${getPriorityColor(task.priority)}`}>
                    {getTaskIcon(task.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <div className="flex items-center mt-1">
                      <Clock className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-600">{task.due}</span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <input type="checkbox" className="mt-1" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Top Performers</h2>
              <Award className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{performer.name}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-600">Score: {performer.score}</span>
                      <span className="text-xs text-green-600 ml-2">+{performer.increase}</span>
                      <span className="text-xs text-gray-600 ml-3">{performer.value}</span>
                    </div>
                  </div>
                  {index === 0 && <Star className="w-5 h-5 text-yellow-500" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Score Progress Chart */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Average Score Progress</h3>
            <select className="text-sm border rounded px-2 py-1">
              <option>Last 6 Months</option>
              <option>Last Year</option>
              <option>All Time</option>
            </select>
          </div>
          <div className="h-64 relative">
            <div className="absolute inset-0 flex items-end">
              {chartData.scoreProgress.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <span className="text-xs text-gray-600 mb-2">{data.avg}</span>
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t hover:from-blue-600 hover:to-blue-400 transition-colors cursor-pointer"
                    style={{ height: `${(data.avg - 600) * 2}%` }}
                  />
                  <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dispute Success by Bureau */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Dispute Success by Bureau</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">Details</button>
          </div>
          <div className="space-y-4">
            {chartData.disputeSuccess.map((bureau) => (
              <div key={bureau.bureau}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{bureau.bureau}</span>
                  <span className="text-sm text-gray-600">{bureau.success}% success</span>
                </div>
                <div className="flex h-8 rounded-lg overflow-hidden">
                  <div className="bg-green-500 hover:bg-green-600 transition-colors" style={{ width: `${bureau.success}%` }}>
                    <span className="text-xs text-white px-2 py-1">Success</span>
                  </div>
                  <div className="bg-yellow-500 hover:bg-yellow-600 transition-colors" style={{ width: `${bureau.pending}%` }}>
                    <span className="text-xs text-white px-2 py-1">Pending</span>
                  </div>
                  <div className="bg-red-500 hover:bg-red-600 transition-colors" style={{ width: `${bureau.failed}%` }}>
                    <span className="text-xs text-white px-2 py-1">Failed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 opacity-50" />
            <span className="text-2xl font-bold">{stats.activeDisputes.value}</span>
          </div>
          <p className="text-sm">Active Disputes</p>
          <p className="text-xs opacity-75 mt-1">{stats.activeDisputes.change} from last week</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 opacity-50" />
            <span className="text-2xl font-bold">{stats.itemsRemoved.value}</span>
          </div>
          <p className="text-sm">Items Removed</p>
          <p className="text-xs opacity-75 mt-1">{stats.itemsRemoved.change} this month</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-8 h-8 opacity-50" />
            <span className="text-2xl font-bold">{stats.responseRate.value}</span>
          </div>
          <p className="text-sm">Response Rate</p>
          <p className="text-xs opacity-75 mt-1">{stats.responseRate.change} from target</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-8 h-8 opacity-50" />
            <span className="text-2xl font-bold">{stats.satisfaction.value}</span>
          </div>
          <p className="text-sm">Client Satisfaction</p>
          <p className="text-xs opacity-75 mt-1">{stats.satisfaction.change} stars</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-6 gap-3">
          <button className="p-3 border rounded-lg hover:bg-gray-50 flex flex-col items-center">
            <UserPlus className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-xs">Add Client</span>
          </button>
          <button className="p-3 border rounded-lg hover:bg-gray-50 flex flex-col items-center">
            <FileText className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-xs">New Dispute</span>
          </button>
          <button className="p-3 border rounded-lg hover:bg-gray-50 flex flex-col items-center">
            <Mail className="w-6 h-6 text-purple-600 mb-2" />
            <span className="text-xs">Send Letter</span>
          </button>
          <button className="p-3 border rounded-lg hover:bg-gray-50 flex flex-col items-center">
            <Phone className="w-6 h-6 text-orange-600 mb-2" />
            <span className="text-xs">Schedule Call</span>
          </button>
          <button className="p-3 border rounded-lg hover:bg-gray-50 flex flex-col items-center">
            <BarChart3 className="w-6 h-6 text-indigo-600 mb-2" />
            <span className="text-xs">View Reports</span>
          </button>
          <button className="p-3 border rounded-lg hover:bg-gray-50 flex flex-col items-center">
            <Download className="w-6 h-6 text-gray-600 mb-2" />
            <span className="text-xs">Export Data</span>
          </button>
        </div>
      </div>

      {/* Metric Detail Modal */}
      {selectedMetric && (
        <MetricDetailModal 
          metric={selectedMetric} 
          onClose={() => setSelectedMetric(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;