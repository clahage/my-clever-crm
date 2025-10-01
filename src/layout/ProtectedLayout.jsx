import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Menu, 
  X, 
  LogOut, 
  User, 
  Sun, 
  Moon,
  ChevronDown,
  ChevronRight,
  Search,
  Bell
} from 'lucide-react';
import { navigationItems, filterNavigationByRole } from './navConfig';

const ProtectedLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNav, setFilteredNav] = useState([]);
  const [notificationCount, setNotificationCount] = useState(3); // Example notification count

  // Initialize expanded groups based on defaults and current location
  useEffect(() => {
    const initialExpanded = {};
    navigationItems.forEach(item => {
      if (item.isGroup) {
        // Check if current path is in this group
        const isCurrentInGroup = item.items?.some(subItem => 
          location.pathname === subItem.path
        );
        initialExpanded[item.id] = item.defaultExpanded || isCurrentInGroup || false;
      }
    });
    setExpandedGroups(initialExpanded);
  }, [location.pathname]);

  // Filter navigation based on user role and search
  useEffect(() => {
    const userRole = user?.role || 'user';
    let filtered = filterNavigationByRole(navigationItems, userRole);
    
    if (searchTerm) {
      filtered = filtered.reduce((acc, item) => {
        if (item.isGroup && item.items) {
          const filteredItems = item.items.filter(subItem =>
            subItem.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
          if (filteredItems.length > 0) {
            return [...acc, { ...item, items: filteredItems }];
          }
        } else if (item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          return [...acc, item];
        }
        return acc;
      }, []);
    }
    
    setFilteredNav(filtered);
  }, [user, searchTerm]);

  // Dark mode effect
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedMode);
    if (savedMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.documentElement.classList.toggle('dark');
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNotificationClick = () => {
    setNotificationCount(0); // Clear notification count when clicked
    navigate('/notifications');
  };

  const renderNavItem = (item) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    if (item.isGroup) {
      const isExpanded = expandedGroups[item.id];
      const hasActiveChild = item.items?.some(subItem => 
        location.pathname === subItem.path
      );

      return (
        <div key={item.id} className="mb-1">
          <button
            onClick={() => toggleGroup(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
              hasActiveChild 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Icon className="w-5 h-5" />
              <span className={`font-medium ${!isSidebarOpen && 'hidden'}`}>
                {item.title}
              </span>
            </div>
            {isSidebarOpen && (
              <div className="flex items-center">
                {item.items && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                    {item.items.length}
                  </span>
                )}
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            )}
          </button>
          
          {isExpanded && isSidebarOpen && item.items && (
            <div className="ml-4 mt-1 space-y-1">
              {item.items.map(subItem => {
                const SubIcon = subItem.icon;
                const isSubActive = location.pathname === subItem.path;
                
                // Handle special case for Add Contact modal
                if (subItem.path === '/contacts?status=new') {
                  return (
                    <button
                      key={subItem.id}
                      onClick={() => navigate('/contacts', { state: { openAddModal: true } })}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
                        isSubActive
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <SubIcon className="w-4 h-4" />
                      <span className="text-sm">{subItem.title}</span>
                    </button>
                  );
                }
                
                return (
                  <Link
                    key={subItem.id}
                    to={subItem.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isSubActive
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <SubIcon className="w-4 h-4" />
                    <span className="text-sm">{subItem.title}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        to={item.path}
        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <Icon className="w-5 h-5" />
        {isSidebarOpen && <span>{item.title}</span>}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col`}
        style={{
          width: isSidebarOpen ? (isMobile ? '100%' : '280px') : (isMobile ? '64px' : '64px'),
          position: isMobile ? 'fixed' : 'relative',
          zIndex: isMobile ? 1200 : 'auto',
          height: '100vh',
          left: isSidebarOpen ? 0 : (isMobile ? '-280px' : 0),
          top: 0,
          transition: 'width 0.3s, left 0.3s',
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              CleverCRM
            </h1>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Search Bar */}
        {isSidebarOpen && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredNav.map(item => renderNavItem(item))}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {isSidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.email || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role || 'Member'}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {filteredNav.reduce((title, item) => {
                if (item.isGroup && item.items) {
                  const found = item.items.find(subItem => subItem.path === location.pathname);
                  if (found) return found.title;
                } else if (item.path === location.pathname) {
                  return item.title;
                }
                return title;
              }, 'Dashboard')}
            </h2>
            
            <div className="flex items-center space-x-4">
              {/* Notifications - NOW CLICKABLE! */}
              <button 
                onClick={handleNotificationClick}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                title="View Notifications"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <>
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  </>
                )}
              </button>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {/* Profile Button */}
              <button
                onClick={() => navigate('/settings')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                title="Settings"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;