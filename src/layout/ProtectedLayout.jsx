// src/layout/ProtectedLayout.jsx
// PROTECTED LAYOUT WITH ACCORDION NAVIGATION
// VERSION: 3.0 - ACCORDION BEHAVIOR + ROLE-BASED FILTERING
// LAST UPDATED: 2025-10-12

import React, { useState, useEffect, useMemo } from 'react';
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
  Bell,
  Settings as SettingsIcon,
  Home as HomeIcon,
  RefreshCw,
  Zap,
  Shield,
  Crown,
  MoreVertical,
  ExternalLink,
  HelpCircle,
  MessageSquare,
  Eye,
  Handshake,
  UserPlus,
  Users as UsersIcon
} from 'lucide-react';
import { 
  navigationItems, 
  filterNavigationByRole, 
  getMobileNavigation,
  ROLES 
} from './navConfig';

// ============================================================================
// PROTECTED LAYOUT COMPONENT
// ============================================================================
const ProtectedLayout = () => {
  const { user, logout, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ===== STATE MANAGEMENT =====
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 768;
  });
  
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  
  // ACCORDION BEHAVIOR: Only ONE group can be expanded at a time
  const [expandedGroupId, setExpandedGroupId] = useState(() => {
    // Load last expanded group from localStorage
    const saved = localStorage.getItem('expandedGroupId');
    return saved || null;
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNav, setFilteredNav] = useState([]);
  const [notificationCount, setNotificationCount] = useState(3);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Determine if mobile
  const isMobile = windowWidth < 768;

  // Get user role
  const userRole = userProfile?.role || user?.role || 'user';

  // ===== WINDOW RESIZE HANDLER =====
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      
      // Auto-close sidebar on mobile
      if (width < 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  // ===== PERSIST SIDEBAR STATE =====
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  // ===== PERSIST EXPANDED GROUP =====
  useEffect(() => {
    if (expandedGroupId) {
      localStorage.setItem('expandedGroupId', expandedGroupId);
    }
  }, [expandedGroupId]);

  // ===== DARK MODE EFFECT =====
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // ===== AUTO-EXPAND CURRENT ROUTE'S GROUP (Only on route change) =====
  useEffect(() => {
    // Find the group containing the current route
    navigationItems.forEach(item => {
      if (item.isGroup && item.items) {
        const isCurrentInGroup = item.items.some(subItem => 
          location.pathname === subItem.path || 
          location.pathname.startsWith(subItem.path + '/')
        );
        
        if (isCurrentInGroup) {
          setExpandedGroupId(item.id);
        }
      }
    });
  }, [location.pathname]); // Only run when route changes

  // ===== FILTER NAVIGATION BY ROLE AND SEARCH =====
  useEffect(() => {
    let filtered = filterNavigationByRole(navigationItems, userRole, isMobile);

    console.debug && console.debug('🔐 Navigation Filter:', {
      userRole,
      isMobile,
      totalItems: navigationItems.length,
      filteredItems: filtered.length
    });

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.reduce((acc, item) => {
        if (item.isGroup && item.items) {
          const filteredItems = item.items.filter(subItem =>
            subItem.title.toLowerCase().includes(searchLower) ||
            subItem.description?.toLowerCase().includes(searchLower)
          );
          if (filteredItems.length > 0) {
            return [...acc, { ...item, items: filteredItems }];
          }
        } else if (
          item.title.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
        ) {
          return [...acc, item];
        }
        return acc;
      }, []);
    }

    setFilteredNav(filtered);
  }, [user, userProfile, searchTerm, userRole, isMobile]);

  // ===== HELPER: TOGGLE DARK MODE =====
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // ===== HELPER: TOGGLE GROUP (ACCORDION BEHAVIOR) =====
  const toggleGroup = (groupId) => {
    // ACCORDION: If clicking the already-open group, close it. Otherwise, open the new group.
    setExpandedGroupId(prev => prev === groupId ? null : groupId);
  };

  // ===== HELPER: HANDLE NAVIGATION =====
  const handleNavigation = (item) => {
    if (item.isGroup) {
      toggleGroup(item.id);
    } else {
      navigate(item.path);
      // Close sidebar on mobile after navigation
      if (isMobile) {
        setIsSidebarOpen(false);
      }
    }
  };

  // ===== HELPER: HANDLE SUBMENU NAVIGATION =====
  const handleSubmenuNavigation = (subItem) => {
    navigate(subItem.path);
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // ===== HELPER: HANDLE LOGOUT =====
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // ===== HELPER: HANDLE NOTIFICATION CLICK =====
  const handleNotificationClick = () => {
    setNotificationCount(0);
    navigate('/notifications');
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // ===== HELPER: GET USER ROLE BADGE =====
  const getUserRoleBadge = () => {
    const roleInfo = ROLES[userRole] || ROLES.user;
    const RoleIcon = roleInfo.icon;
    
    const colorMap = {
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      orange: 'bg-orange-500',
      cyan: 'bg-cyan-500',
      gray: 'bg-gray-500'
    };

    return {
      icon: <RoleIcon className="w-3 h-3" />,
      color: colorMap[roleInfo.color] || 'bg-blue-500',
      label: roleInfo.label
    };
  };

  // ===== HELPER: GET QUICK ACTIONS =====
  const quickActions = useMemo(() => {
    const baseActions = [
      { label: 'New Contact', icon: <User className="w-4 h-4" />, path: '/contacts?action=new', roles: ['user', 'manager', 'admin', 'masterAdmin'] },
      { label: 'Contact Intake', icon: <UserPlus className="w-4 h-4" />, path: '/intake', roles: ['user', 'manager', 'admin', 'masterAdmin'] },
      { label: 'Send Dispute', icon: <MessageSquare className="w-4 h-4" />, path: '/dispute-letters', roles: ['user', 'manager', 'admin', 'masterAdmin', 'client'] },
      { label: 'View Reports', icon: <Eye className="w-4 h-4" />, path: '/reports', roles: ['manager', 'admin', 'masterAdmin'] },
      { label: 'My Portal', icon: <User className="w-4 h-4" />, path: '/client-portal', roles: ['client', 'prospect'] }
    ];

    // Filter actions by role
    return baseActions.filter(action => 
      !action.roles || action.roles.includes(userRole)
    );
  }, [userRole]);

  // ===== RENDER NAVIGATION ITEM =====
  const renderNavItem = (item) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    if (item.isGroup) {
      // ACCORDION: Only this group is expanded if its ID matches expandedGroupId
      const isExpanded = expandedGroupId === item.id;
      const hasActiveChild = item.items?.some(subItem => 
        location.pathname === subItem.path ||
        location.pathname.startsWith(subItem.path + '/')
      );

      return (
        <div key={item.id} className="mb-1">
          <button
            onClick={() => handleNavigation(item)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
              hasActiveChild 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <Icon className={`w-5 h-5 flex-shrink-0 ${hasActiveChild ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              {isSidebarOpen && (
                <span className={`font-medium truncate ${hasActiveChild ? 'font-semibold' : ''}`}>
                  {item.title}
                </span>
              )}
            </div>
            {isSidebarOpen && (
              <div className="flex items-center space-x-2 flex-shrink-0">
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-xs font-bold rounded bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    {item.badge}
                  </span>
                )}
                {item.items && (
                  <>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.items.length}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </>
                )}
              </div>
            )}
          </button>
          
          {/* SUBMENU - Only shown if expanded */}
          {isExpanded && isSidebarOpen && item.items && (
            <div className="ml-4 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
              {item.items.map(subItem => {
                const SubIcon = subItem.icon;
                const isSubActive = location.pathname === subItem.path;
                
                return (
                  <Link
                    key={subItem.id}
                    to={subItem.path}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmenuNavigation(subItem);
                    }}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                      isSubActive
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                    title={subItem.description}
                  >
                    <SubIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm flex-1 truncate">{subItem.title}</span>
                    {subItem.badge && (
                      <span className={`px-1.5 py-0.5 text-xs font-bold rounded ${
                        subItem.badge === 'NEW' ? 'bg-green-500 text-white' :
                        subItem.badge === 'AI' ? 'bg-purple-500 text-white' :
                        subItem.badge === 'PRO' ? 'bg-yellow-500 text-white' :
                        subItem.badge === 'FREE' ? 'bg-blue-500 text-white' :
                        subItem.badge === 'FAX' ? 'bg-cyan-500 text-white' :
                        subItem.badge === 'ADMIN' ? 'bg-red-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {subItem.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // Single navigation item
    return (
      <Link
        key={item.id}
        to={item.path}
        onClick={(e) => {
          e.preventDefault();
          handleNavigation(item);
        }}
        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
          isActive
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        title={item.description}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {isSidebarOpen && (
          <>
            <span className="flex-1 truncate">{item.title}</span>
            {item.badge && (
              <span className={`px-1.5 py-0.5 text-xs font-bold rounded ${
                item.badge === 'NEW' ? 'bg-green-500 text-white' :
                item.badge === 'AI' ? 'bg-purple-500 text-white' :
                item.badge === 'ADMIN' ? 'bg-red-500 text-white' :
                'bg-blue-500 text-white'
              }`}>
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );
  };

  // ===== GET CURRENT PAGE TITLE =====
  const currentPageTitle = useMemo(() => {
    for (const item of filteredNav) {
      if (item.isGroup && item.items) {
        const found = item.items.find(subItem => subItem.path === location.pathname);
        if (found) return found.title;
      } else if (item.path === location.pathname) {
        return item.title;
      }
    }
    return 'Dashboard';
  }, [filteredNav, location.pathname]);

  const roleBadge = getUserRoleBadge();

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* ===== MOBILE OVERLAY ===== */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col ${
          isMobile ? 'fixed z-50' : 'relative'
        }`}
        style={{
          width: isSidebarOpen ? '280px' : '64px',
          height: '100vh',
          left: isMobile ? (isSidebarOpen ? 0 : '-280px') : 0,
          top: 0,
        }}
      >
        {/* SIDEBAR HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          {isSidebarOpen && (
            <div className="flex items-center space-x-2">
              <img
                src="/brand/default/logo-brand-128.png"
                alt="SpeedyCRM Logo"
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
                  SpeedyCRM
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Credit Repair</p>
              </div>
            </div>
          )}
          {!isSidebarOpen && (
            <img
              src="/brand/default/logo-brand-128.png"
              alt="SpeedyCRM Logo"
              className="w-8 h-8 object-contain"
              title="SpeedyCRM"
            />
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* SEARCH BAR */}
        {isSidebarOpen && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* QUICK ACTIONS */}
        {isSidebarOpen && quickActions.length > 0 && (
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <span className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Quick Actions</span>
              </span>
              {showQuickActions ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {showQuickActions && (
              <div className="mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(action.path);
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {filteredNav.map(item => renderNavItem(item))}
          
          {filteredNav.length === 0 && searchTerm && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found</p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-2"
              >
                Clear search
              </button>
            </div>
          )}
        </nav>

        {/* USER SECTION */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {isSidebarOpen ? (
              <>
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {userProfile?.displayName || user?.email?.split('@')[0] || 'User'}
                    </p>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <span className={`w-5 h-5 ${roleBadge.color} rounded flex items-center justify-center`}>
                        {roleBadge.icon}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {roleBadge.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors relative"
                    title="User menu"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* USER MENU DROPDOWN */}
          {showUserMenu && isSidebarOpen && (
            <div className="absolute bottom-20 left-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 z-50 animate-in slide-in-from-bottom-2 duration-200">
              <button
                onClick={() => {
                  navigate('/settings');
                  setShowUserMenu(false);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors"
              >
                <SettingsIcon className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button
                onClick={() => {
                  navigate('/support');
                  setShowUserMenu(false);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help & Support</span>
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              <button
                onClick={() => {
                  window.open('https://speedycreditrepair.com', '_blank');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Visit Website</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP BAR */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              {isMobile && !isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 mr-2"
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
              
              {/* Page title */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {currentPageTitle}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {location.pathname}
                </p>
              </div>
            </div>
            
            {/* Top bar actions */}
            <div className="flex items-center space-x-3">
              {/* Quick home button */}
              <button 
                onClick={() => navigate('/')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                title="Go to home"
              >
                <HomeIcon className="w-5 h-5" />
              </button>

              {/* Refresh button */}
              <button 
                onClick={() => window.location.reload()}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                title="Refresh page"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <button 
                onClick={handleNotificationClick}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                title="View notifications"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {notificationCount}
                    </span>
                  </>
                )}
              </button>
              
              {/* Messages */}
              <button 
                onClick={() => navigate('/messages')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                title="Messages"
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {/* Settings Button */}
              <button
                onClick={() => navigate('/settings')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                title="Settings"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>

              {/* User avatar (desktop) */}
              {!isMobile && (
                <button
                  onClick={() => navigate('/settings')}
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          <Outlet />
        </main>
      </div>

      {/* CUSTOM SCROLLBAR STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.7);
        }
      `}</style>
    </div>
  );
};

export default ProtectedLayout;