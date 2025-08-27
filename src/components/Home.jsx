
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePermission } from '../usePermission';
import { useAuth } from '../authContext';

const Home = () => {
  const { hasFeatureAccess, isMasterAdmin, userRole } = usePermission();
  const { user, userProfile } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Enhanced mock data for impressive stats
  const stats = {
    totalClients: 1247,
    activeDisputes: 189,
    resolvedThisMonth: 134,
    successRate: 94.7,
    revenue: 187650,
    newLeads: 67,
    clientSatisfaction: 98.2,
    avgCreditIncrease: 127
  };

  const recentActivity = [
    { type: 'success', icon: '🎉', message: 'Credit score increased by 45 points for John D.', time: '2 min ago', color: 'green' },
    { type: 'dispute', icon: '⚖️', message: 'New dispute filed against Experian', time: '5 min ago', color: 'blue' },
    { type: 'client', icon: '👤', message: 'Sarah M. signed new credit repair contract', time: '12 min ago', color: 'purple' },
    { type: 'ai', icon: '🤖', message: 'AI generated 3 challenge letters', time: '18 min ago', color: 'orange' },
    { type: 'payment', icon: '💰', message: 'Payment received: $495 from Mike R.', time: '25 min ago', color: 'green' }
  ];

  const topClients = [
    { name: 'John Davis', score: '+127 pts', status: 'excellent', avatar: '👨‍💼' },
    { name: 'Sarah Miller', score: '+89 pts', status: 'very-good', avatar: '👩‍💻' },
    { name: 'Mike Rodriguez', score: '+156 pts', status: 'excellent', avatar: '👨‍🔬' },
    { name: 'Lisa Chen', score: '+78 pts', status: 'good', avatar: '👩‍🎨' }
  ];

  const PremiumStatCard = ({ title, value, icon, gradient, trend, subtitle, isLoading = false }) => (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 group`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/5 rounded-full"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <p className="text-white/80 text-sm font-medium uppercase tracking-wider">{title}</p>
            <div className="mt-2">
              {isLoading ? (
                <div className="animate-pulse bg-white/20 rounded-lg h-10 w-24"></div>
              ) : (
                <p className="text-4xl font-bold leading-none">{value}</p>
              )}
              {subtitle && <p className="text-white/90 text-sm mt-1">{subtitle}</p>}
            </div>
            {trend && (
              <div className="flex items-center mt-4 text-white/90 text-sm">
                <span className="mr-2 text-lg">↗</span>
                <span className="font-semibold">+{trend}%</span>
                <span className="ml-1">this month</span>
              </div>
            )}
          </div>
          <div className="text-6xl opacity-80 group-hover:scale-110 transition-transform duration-500">
            {icon}
          </div>
        </div>
      </div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    </div>
  );

  const FeatureCard = ({ title, description, icon, gradient, link, badge, comingSoon = false, stats = null }) => (
    <Link
      to={comingSoon ? '#' : link}
      className={`group relative block overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${comingSoon ? 'cursor-not-allowed opacity-75' : ''}`}
    >
      {/* Header with gradient */}
      <div className={`h-32 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="relative z-10 p-6 flex items-center justify-between h-full">
          <div className="text-4xl">{icon}</div>
          {badge && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              badge === 'AI-Powered' ? 'bg-green-400/20 text-green-100 border border-green-400/30' :
              badge === 'Coming Soon' ? 'bg-yellow-400/20 text-yellow-100 border border-yellow-400/30' :
              badge === 'Admin Only' ? 'bg-red-400/20 text-red-100 border border-red-400/30' :
              'bg-blue-400/20 text-blue-100 border border-blue-400/30'
            }`}>
              {badge}
            </span>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">{description}</p>
        
        {stats && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
            {comingSoon ? 'Coming Soon' : 'Open →'}
          </span>
          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <svg className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );

  const ActivityItem = ({ activity }) => (
    <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group">
      <div className={`w-10 h-10 rounded-full bg-${activity.color}-100 flex items-center justify-center flex-shrink-0`}>
        <span className="text-lg">{activity.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
          {activity.message}
        </p>
        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
      </div>
    </div>
  );

  const ClientItem = ({ client }) => (
    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
          {client.avatar}
        </div>
        <div>
          <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{client.name}</p>
          <p className="text-sm text-green-600 font-semibold">{client.score}</p>
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
        client.status === 'excellent' ? 'bg-green-100 text-green-800' :
        client.status === 'very-good' ? 'bg-blue-100 text-blue-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {client.status.replace('-', ' ')}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
        <div className="absolute inset-0 bg-white bg-opacity-5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Logo Area */}
            <div className="flex items-center justify-center mb-8">
              <div className="p-6 bg-white/20 rounded-3xl backdrop-blur-sm border border-white/30 shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Speedy Credit Repair
              <span className="block text-4xl md:text-5xl bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                CRM Dashboard
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Welcome back, <span className="font-bold text-yellow-300">{userProfile?.displayName || user?.email?.split('@')[0] || 'User'}</span>! 
              Transform lives, one credit score at a time.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className={`px-6 py-3 rounded-full backdrop-blur-sm border border-white/30 ${
                isMasterAdmin ? 'bg-red-500/20 text-red-100' : 'bg-white/20 text-white'
              }`}>
                <span className="font-semibold">🔑 {userProfile?.role || 'user'}</span>
              </div>
              
              {isMasterAdmin && (
                <div className="px-6 py-3 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm border border-yellow-400/30 text-yellow-100">
                  <span className="font-semibold">⚡ Master Admin</span>
                </div>
              )}
              
              <div className="px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white">
                <span className="font-semibold">🕒 {currentTime.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating orbs animation */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-yellow-300/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-orange-300/20 rounded-full animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-16 relative z-10">
        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <PremiumStatCard
            title="Total Clients"
            value={stats.totalClients.toLocaleString()}
            icon="👥"
            gradient="from-blue-500 via-blue-600 to-blue-700"
            trend="12"
            subtitle="Growing strong"
          />
          <PremiumStatCard
            title="Active Disputes"
            value={stats.activeDisputes}
            icon="⚖️"
            gradient="from-emerald-500 via-green-600 to-emerald-700"
            trend="8"
            subtitle="In progress"
          />
          <PremiumStatCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            icon="🎯"
            gradient="from-purple-500 via-purple-600 to-indigo-700"
            trend="2.3"
            subtitle="Industry leading"
          />
          <PremiumStatCard
            title="Monthly Revenue"
            value={`$${(stats.revenue / 1000).toFixed(0)}K`}
            icon="�"
            gradient="from-orange-500 via-red-500 to-pink-600"
            trend="23"
            subtitle="Record breaking"
          />
        </div>

        {/* Feature Cards Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Powerful Features at Your Fingertips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hasFeatureAccess('dispute_center') && (
              <FeatureCard
                title="AI Dispute Center"
                description="Automated dispute generation, document analysis, and intelligent challenge letter creation powered by advanced AI."
                icon="🤖"
                gradient="from-green-400 to-emerald-600"
                link="/dispute-center"
                badge="AI-Powered"
                stats={[
                  { label: 'Active Disputes', value: '189' },
                  { label: 'Success Rate', value: '94%' }
                ]}
              />
            )}

            {hasFeatureAccess('progress_portal') && (
              <FeatureCard
                title="Progress Analytics"
                description="Real-time credit score tracking, predictive analytics, and comprehensive progress visualization."
                icon="📊"
                gradient="from-blue-400 to-indigo-600"
                link="/progress-portal"
                badge="Coming Soon"
                comingSoon={true}
                stats={[
                  { label: 'Avg Increase', value: '+127' },
                  { label: 'Client Satisfaction', value: '98%' }
                ]}
              />
            )}

            {hasFeatureAccess('page_leads') && (
              <FeatureCard
                title="Lead Management"
                description="Advanced lead scoring, automated follow-ups, and conversion optimization with built-in CRM tools."
                icon="🎯"
                gradient="from-purple-400 to-pink-600"
                link="/leads"
                stats={[
                  { label: 'New Leads', value: '67' },
                  { label: 'Conversion', value: '31%' }
                ]}
              />
            )}

            {hasFeatureAccess('admin_panel') && (
              <FeatureCard
                title="Admin Command Center"
                description="Complete system control, user management, role assignments, and comprehensive analytics dashboard."
                icon="🛡️"
                gradient="from-red-400 to-pink-600"
                link="/admin"
                badge="Admin Only"
                stats={[
                  { label: 'Total Users', value: '1.2K' },
                  { label: 'System Health', value: '99%' }
                ]}
              />
            )}

            <FeatureCard
              title="Smart Reports"
              description="Automated reporting, business intelligence, and customizable dashboards with export capabilities."
              icon="�"
              gradient="from-yellow-400 to-orange-600"
              link="#"
              badge="Coming Soon"
              comingSoon={true}
              stats={[
                { label: 'Reports Generated', value: '450' },
                { label: 'Data Points', value: '50K+' }
              ]}
            />

            <FeatureCard
              title="Client Portal"
              description="Branded client experience with progress tracking, document uploads, and communication tools."
              icon="🏠"
              gradient="from-cyan-400 to-blue-600"
              link="#"
              badge="Coming Soon"
              comingSoon={true}
              stats={[
                { label: 'Active Clients', value: '890' },
                { label: 'Engagement', value: '87%' }
              ]}
            />
          </div>
        </div>

        {/* Activity & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Recent Activity</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              {recentActivity.map((activity, idx) => (
                <ActivityItem key={idx} activity={activity} />
              ))}
            </div>
          </div>

          {/* Top Performing Clients */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Top Performers</h3>
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              {topClients.map((client, idx) => (
                <ClientItem key={idx} client={client} />
              ))}
            </div>
          </div>
        </div>

        {/* System Status Bar */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">System Performance</h3>
              <p className="text-blue-100">All systems operational • Last updated: {currentTime.toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-blue-200 text-sm">Uptime</div>
              </div>
              <div>
                <div className="text-2xl font-bold">47ms</div>
                <div className="text-blue-200 text-sm">Response</div>
              </div>
              <div>
                <div className="text-2xl font-bold">Active</div>
                <div className="text-blue-200 text-sm">AI Engine</div>
              </div>
              <div>
                <div className="text-2xl font-bold">Secure</div>
                <div className="text-blue-200 text-sm">Data</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;