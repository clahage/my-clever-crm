// src/pages/Home.jsx
// ============================================================================
// 🏠 WELCOME HUB - Landing Page & Navigation Center
// ============================================================================
// PURPOSE: Branded welcome experience and feature navigation
// NOT A DASHBOARD - For analytics, use SmartDashboard
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePermission } from '../usePermission';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { hasFeatureAccess, isMasterAdmin } = usePermission();
  const { user, userProfile } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute (not every second - better performance)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const FeatureCard = ({ title, description, icon, gradient, link, badge, comingSoon = false }) => (
    <Link
      to={comingSoon ? '#' : link}
      className={`group relative block overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${comingSoon ? 'cursor-not-allowed opacity-75' : ''}`}
    >
      {/* Header with gradient */}
      <div className={`h-28 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="relative z-10 p-6 flex items-center justify-between h-full">
          <div className="text-4xl">{icon}</div>
          {badge && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              badge === 'Primary' ? 'bg-blue-400/20 text-blue-100 border border-blue-400/30' :
              badge === 'AI-Powered' ? 'bg-green-400/20 text-green-100 border border-green-400/30' :
              badge === 'Coming Soon' ? 'bg-yellow-400/20 text-yellow-100 border border-yellow-400/30' :
              badge === 'Admin Only' ? 'bg-red-400/20 text-red-100 border border-red-400/30' :
              'bg-white/20 text-white border border-white/30'
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

        <div className="flex items-center justify-between">
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

  const QuickActionButton = ({ to, icon, label, gradient }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r ${gradient} text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
        <div className="absolute inset-0 bg-white bg-opacity-5"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            {/* Logo Area */}
            <div className="mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 inline-block">
                <img
                  src="/logo.png"
                  alt="Speedy Credit Repair"
                  className="h-20 w-auto drop-shadow-2xl"
                />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Speedy Credit Repair
              <span className="block text-3xl md:text-4xl bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                CRM Dashboard
              </span>
            </h1>

            <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
              Welcome back, <span className="font-bold text-yellow-300">{userProfile?.displayName || user?.email?.split('@')[0] || 'User'}</span>!
              Transform lives, one credit score at a time.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <div className={`px-4 py-2 rounded-full backdrop-blur-sm border border-white/30 ${
                isMasterAdmin ? 'bg-red-500/20 text-red-100' : 'bg-white/20 text-white'
              }`}>
                <span className="font-semibold text-sm">🔐 {userProfile?.role || 'user'}</span>
              </div>

              {isMasterAdmin && (
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm border border-yellow-400/30 text-yellow-100">
                  <span className="font-semibold text-sm">⚡ Master Admin</span>
                </div>
              )}

              <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white">
                <span className="font-semibold text-sm">📅 {currentTime.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating orbs animation */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-yellow-300/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-orange-300/20 rounded-full animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-10">
        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Quick Actions
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <QuickActionButton
              to="/smart-dashboard"
              icon="📊"
              label="Open Dashboard"
              gradient="from-blue-600 to-indigo-600"
            />
            <QuickActionButton
              to="/add-contact"
              icon="👤"
              label="Add Contact"
              gradient="from-green-500 to-emerald-600"
            />
            <QuickActionButton
              to="/disputes-hub"
              icon="⚖️"
              label="Create Dispute"
              gradient="from-purple-500 to-pink-600"
            />
            <QuickActionButton
              to="/communications-hub"
              icon="💬"
              label="Send Message"
              gradient="from-orange-500 to-red-500"
            />
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Explore Your CRM
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Primary Dashboard - Always show first */}
            <FeatureCard
              title="Smart Dashboard"
              description="Your customizable command center with role-based widgets, AI insights, and real-time analytics."
              icon="📊"
              gradient="from-blue-500 to-indigo-600"
              link="/smart-dashboard"
              badge="Primary"
            />

            {/* Clients Hub */}
            <FeatureCard
              title="Clients Hub"
              description="Manage all your clients, track their progress, and view credit improvement journeys."
              icon="👥"
              gradient="from-green-400 to-emerald-600"
              link="/clients-hub"
            />

            {/* Disputes Hub */}
            {hasFeatureAccess('dispute_center') && (
              <FeatureCard
                title="Disputes Hub"
                description="AI-powered dispute generation, document analysis, and intelligent challenge letter creation."
                icon="⚖️"
                gradient="from-purple-400 to-pink-600"
                link="/disputes-hub"
                badge="AI-Powered"
              />
            )}

            {/* Communications Hub */}
            <FeatureCard
              title="Communications Hub"
              description="Email, SMS, and call management. Track all client communications in one place."
              icon="💬"
              gradient="from-cyan-400 to-blue-600"
              link="/communications-hub"
            />

            {/* Analytics Hub */}
            <FeatureCard
              title="Analytics Hub"
              description="Comprehensive reporting, business intelligence, and performance metrics."
              icon="📈"
              gradient="from-yellow-400 to-orange-600"
              link="/analytics-hub"
            />

            {/* Billing Hub */}
            <FeatureCard
              title="Billing Hub"
              description="Invoices, payments, subscriptions, and revenue tracking."
              icon="💰"
              gradient="from-emerald-400 to-teal-600"
              link="/billing-hub"
            />

            {/* AI Hub */}
            <FeatureCard
              title="AI Super Hub"
              description="AI Receptionist, automated workflows, and intelligent credit analysis."
              icon="🤖"
              gradient="from-violet-400 to-purple-600"
              link="/ai-hub"
              badge="AI-Powered"
            />

            {/* Documents Hub */}
            <FeatureCard
              title="Documents Hub"
              description="Templates, contracts, forms, and document management."
              icon="📄"
              gradient="from-slate-400 to-gray-600"
              link="/documents-hub"
            />

            {/* Settings */}
            {hasFeatureAccess('admin_panel') && (
              <FeatureCard
                title="Settings & Admin"
                description="System configuration, user management, roles, and integrations."
                icon="⚙️"
                gradient="from-red-400 to-pink-600"
                link="/settings"
                badge="Admin Only"
              />
            )}
          </div>
        </div>

        {/* Getting Started Guide for New Users */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Getting Started</h3>
            <p className="text-gray-600">New to Speedy Credit Repair CRM? Follow these steps:</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Add Your First Client</h4>
              <p className="text-sm text-gray-600">Go to Clients Hub and click "Add Contact"</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Upload Credit Report</h4>
              <p className="text-sm text-gray-600">Import their credit report for analysis</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Create Disputes</h4>
              <p className="text-sm text-gray-600">Use AI to generate challenge letters</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">4️⃣</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Track Progress</h4>
              <p className="text-sm text-gray-600">Monitor scores on your Dashboard</p>
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Need help? Check out our resources:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/learning-hub" className="text-blue-600 hover:text-blue-700 font-medium">
              📚 Learning Center
            </Link>
            <Link to="/support" className="text-blue-600 hover:text-blue-700 font-medium">
              🎧 Support
            </Link>
            <a href="https://docs.speedycreditrepair.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">
              📖 Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
