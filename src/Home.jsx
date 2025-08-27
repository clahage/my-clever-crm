
import React, { useState } from 'react';
import FirebaseCheck from './components/FirebaseCheck';
import {
  Users, UserPlus, FileText, BarChart3, DollarSign, TrendingUp, Mail, Bell
} from 'lucide-react';

const stats = [
  { label: 'Total Contacts', value: '2,543', change: '+12%', trend: 'up', icon: Users },
  { label: 'Active Clients', value: '1,823', change: '+5%', trend: 'up', icon: UserPlus },
  { label: 'This Month Revenue', value: '$45,230', change: '+18%', trend: 'up', icon: DollarSign },
  { label: 'Conversion Rate', value: '68%', change: '+3%', trend: 'up', icon: TrendingUp },
  // Ultra-wide extra cards
  { label: 'Pending Disputes', value: '312', change: '-2%', trend: 'down', icon: FileText },
  { label: 'Letters Sent', value: '1,204', change: '+8%', trend: 'up', icon: FileText },
  { label: 'Payments Received', value: '$12,400', change: '+6%', trend: 'up', icon: DollarSign },
  { label: 'New Leads', value: '97', change: '+11%', trend: 'up', icon: Users }
];

export default function Home() {
  const [showFirebaseStatus, setShowFirebaseStatus] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-auto">
      {/* Main Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-4 xl:p-6 2xl:p-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your credit repair business.</p>
        </div>
        <div className="flex items-center gap-4">
          <Bell className="h-5 w-5 text-gray-600" />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
            Quick Action
          </button>
        </div>
      </header>

      {/* Firebase Status Toggle */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-6">
        <button
          onClick={() => setShowFirebaseStatus(!showFirebaseStatus)}
          className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-lg p-3 mb-6"
        >
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            System Status
          </span>
          <span>{showFirebaseStatus ? 'Hide' : 'Show'}</span>
        </button>
        {showFirebaseStatus && <FirebaseCheck />}
      </div>

      {/* Stats Cards - More columns on ultra-wide screens */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 xl:gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-4 xl:p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-xl xl:text-2xl font-bold text-gray-900">{stat.value}</p>
                <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>{stat.change}</span>
              </div>
              <Icon className="h-6 w-6 xl:h-8 xl:w-8 text-blue-600" />
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Recent Activity - Better layout for wide screens */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pb-10 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
              <UserPlus className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-blue-800">Add Contact</span>
            </button>
            <button className="p-3 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors">
              <FileText className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-green-800">New Dispute</span>
            </button>
            <button className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
              <Mail className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-purple-800">Send Letter</span>
            </button>
            <button className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors">
              <BarChart3 className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-orange-800">View Reports</span>
            </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">New contact added: John Doe</span>
              <span className="text-xs text-gray-400">2 min ago</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Dispute letter sent for Client #12345</span>
              <span className="text-xs text-gray-400">15 min ago</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Payment received: $199</span>
              <span className="text-xs text-gray-400">1 hour ago</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Credit report updated: Jane Smith</span>
              <span className="text-xs text-gray-400">2 hours ago</span>
            </div>
          </div>
        </div>
        {/* Additional cards for ultra-wide screens */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hidden 2xl:block">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ultra-Wide Card</h3>
          <div className="text-gray-600">This space is optimized for your 49" screen!</div>
        </div>
      </div>
    </div>
  );
}
