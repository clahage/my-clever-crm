import React, { useState } from 'react';
import { Moon, Sun, LayoutDashboard, Users, UserPlus, FileText, Settings, TrendingUp, AlertTriangle, BarChart } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import SocialMediaAdmin from './pages/SocialMediaAdmin';
import './index.css';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  const user = { email: 'chris@speedycreditrepair.com' };

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'social-admin', label: 'Social Media Admin', icon: FileText },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'leads', label: 'Leads', icon: UserPlus },
    { id: 'progress', label: 'Progress Portal', icon: TrendingUp },
    { id: 'disputes', label: 'Dispute Center', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: BarChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Speedy Credit</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Repair CRM</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{user.email}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  currentPage === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <span className="flex items-center gap-3">
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'social-admin' && <SocialMediaAdmin />}
          {/* Temporarily show placeholders for broken components */}
          {currentPage === 'clients' && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-3xl font-bold mb-4">Clients</h2>
              <p>Client management will be restored</p>
            </div>
          )}
          {currentPage === 'leads' && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-3xl font-bold mb-4">Leads</h2>
              <p>Lead tracking will be restored</p>
            </div>
          )}
          {currentPage === 'progress' && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-3xl font-bold mb-4">Progress Portal</h2>
              <p>Progress tracking will be restored</p>
            </div>
          )}
          {currentPage === 'disputes' && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-3xl font-bold mb-4">Dispute Center</h2>
              <p>Dispute management will be restored</p>
            </div>
          )}
          {currentPage === 'reports' && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-3xl font-bold mb-4">Reports</h2>
              <p>Analytics will be restored</p>
            </div>
          )}
          {currentPage === 'settings' && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-3xl font-bold mb-4">Settings</h2>
              <p>Configuration options</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;