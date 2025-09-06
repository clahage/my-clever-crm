import React, { useState } from 'react';
import { 
  Users, UserPlus, FileText, CreditCard, BarChart3, Settings, 
  Shield, Database, Upload, Download,
  Calendar, Mail, Phone, MessageSquare, Bell, Search,
  ChevronDown, ChevronUp, Menu, X, Home, Building,
  DollarSign, TrendingUp, FileCheck, UserCheck
} from 'lucide-react';

const CRMLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFirebaseStatus, setShowFirebaseStatus] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Core CRM Navigation Items
  const navigationItems = [
    {
      section: 'Dashboard',
      items: [
        { id: 'dashboard', label: 'Dashboard Overview', icon: Home, path: '/' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' }
      ]
    },
    {
      section: 'Contact Management',
      items: [
        { id: 'contacts', label: 'All Contacts', icon: Users, path: '/contacts' },
        { id: 'leads', label: 'Leads', icon: UserPlus, path: '/leads' },
        { id: 'clients', label: 'Active Clients', icon: UserCheck, path: '/clients' },
        { id: 'prospects', label: 'Prospects', icon: Search, path: '/prospects' }
      ]
    },
    {
      section: 'Credit Repair',
      items: [
        { id: 'disputes', label: 'Dispute Center', icon: FileText, path: '/disputes' },
        { id: 'letters', label: 'Letter Templates', icon: Mail, path: '/letters' },
        { id: 'reports', label: 'Credit Reports', icon: FileCheck, path: '/reports' },
        { id: 'progress', label: 'Progress Tracking', icon: TrendingUp, path: '/progress' },
        { id: 'idiq', label: 'IDIQ Integration', icon: Shield, path: '/idiq' }
      ]
    },
    {
      section: 'Business Operations',
      items: [
        { id: 'billing', label: 'Billing & Invoices', icon: DollarSign, path: '/billing' },
        { id: 'contracts', label: 'E-Contracts', icon: FileText, path: '/contracts' },
        { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
        { id: 'communications', label: 'Communications', icon: MessageSquare, path: '/communications' }
      ]
    },
    {
      section: 'Tools & Utilities',
      items: [
        { id: 'import', label: 'Import Data', icon: Upload, path: '/import' },
        { id: 'export', label: 'Export Data', icon: Download, path: '/export' },
        { id: 'bulk-actions', label: 'Bulk Actions', icon: Database, path: '/bulk' },
        { id: 'automation', label: 'Automation Rules', icon: Settings, path: '/automation' }
      ]
    },
    {
      section: 'Administration',
      items: [
        { id: 'admin-panel', label: 'Admin Panel', icon: Settings, path: '/admin' },
        { id: 'user-management', label: 'User Management', icon: Users, path: '/admin/users' },
        { id: 'roles', label: 'Roles & Permissions', icon: Shield, path: '/admin/roles' },
        { id: 'settings', label: 'System Settings', icon: Settings, path: '/settings' }
      ]
    }
  ];

  // Mock Firebase Check Component
  const FirebaseStatus = () => (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-green-800">🔥 Firebase Status</h4>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="text-green-600">✅</div>
          <div>Auth</div>
        </div>
        <div className="text-center">
          <div className="text-green-600">✅</div>
          <div>Firestore</div>
        </div>
        <div className="text-center">
          <div className="text-green-600">✅</div>
          <div>Storage</div>
        </div>
      </div>
      <div className="text-center text-xs text-green-700 mt-2 font-medium">
        All Systems Connected
      </div>
    </div>
  );

  // Stats for dashboard
  const stats = [
    { label: 'Total Contacts', value: '2,543', change: '+12%', trend: 'up', icon: Users },
    { label: 'Active Clients', value: '1,823', change: '+5%', trend: 'up', icon: UserCheck },
    { label: 'This Month Revenue', value: '$45,230', change: '+18%', trend: 'up', icon: DollarSign },
    { label: 'Conversion Rate', value: '68%', change: '+3%', trend: 'up', icon: TrendingUp }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h2 className="text-lg font-bold text-gray-800">Credit Repair CRM</h2>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Firebase Status Toggle */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setShowFirebaseStatus(!showFirebaseStatus)}
              className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-800"
            >
              <span className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                System Status
              </span>
              {showFirebaseStatus ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showFirebaseStatus && <FirebaseStatus />}
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          {navigationItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="py-2">
              {sidebarOpen && (
                <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.section}
                </h3>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && <span className="ml-3">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">CA</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Chris Admin</p>
                <p className="text-xs text-gray-500">Master Admin</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeSection === 'dashboard' ? 'Dashboard' : 
                 navigationItems.flatMap(s => s.items).find(i => i.id === activeSection)?.label || 'Dashboard'}
              </h1>
              <p className="text-gray-600">
                {activeSection === 'dashboard' 
                  ? "Welcome back! Here's what's happening with your credit repair business."
                  : "Manage your credit repair operations efficiently"
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Bell className="h-5 w-5 text-gray-600" />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Quick Action
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeSection === 'dashboard' ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <Icon className="h-8 w-8 text-blue-600 mb-2" />
                          <span className={`text-sm font-medium ${
                            stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.change}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              </div>
            </>
          ) : (
            // Placeholder for other sections
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {navigationItems.flatMap(s => s.items).find(i => i.id === activeSection)?.label}
              </h2>
              <p className="text-gray-600 mb-6">This feature is coming soon...</p>
              <div className="flex justify-center">
                {navigationItems.flatMap(s => s.items).find(i => i.id === activeSection)?.icon && 
                  React.createElement(navigationItems.flatMap(s => s.items).find(i => i.id === activeSection).icon, 
                  { className: "h-16 w-16 text-gray-400" })
                }
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CRMLayout;
