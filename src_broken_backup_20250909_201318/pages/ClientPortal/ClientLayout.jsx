import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  ChartBarIcon, 
  DocumentTextIcon,
  FolderIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const ClientLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const navigation = [
    { name: 'Dashboard', href: '/client-portal', icon: HomeIcon },
    { name: 'My Credit Scores', href: '/client-portal/scores', icon: ChartBarIcon },
    { name: 'Dispute Status', href: '/client-portal/disputes', icon: DocumentTextIcon },
    { name: 'Documents', href: '/client-portal/documents', icon: FolderIcon },
    { name: 'Messages', href: '/client-portal/messages', icon: ChatBubbleLeftRightIcon },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              SpeedyCRM
            </h1>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white dark:bg-gray-900 pt-16"
          >
            <nav className="px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              <button
                onClick={logout}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 w-full"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </nav>
          </motion.div>
        )}
      </div>
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              SpeedyCRM Client
            </h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={logout}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 w-full"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="px-4 py-20 lg:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
