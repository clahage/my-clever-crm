import { User, LogOut, Shield ,
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  Settings,
  TrendingUp,
  AlertTriangle,
  Activity,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Star,
  Calendar,
  Bell,
  Search,
  Plus,
  Eye,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
// import { useAuth } from '../authContext';
// import { usePermission } from '../usePermission';
import { usePermission } from '../usePermission';
import { useAuth } from '../authContext';
  // ...existing code...
  let isDarkMode = false;
  let toggleTheme = () => {};
  try {
    const theme = useTheme();
    if (theme) {
      isDarkMode = theme.isDarkMode;
      toggleTheme = theme.toggleTheme;
    }
  } catch (error) {
    console.warn('Theme context not available');
  }
// Sidebar user section for authentication UI
const SidebarUserSection = () => {
  const { user, userProfile, signOut } = useAuth();
  const { isAuthenticated, isMasterAdmin } = usePermission();

  if (!isAuthenticated) {
    return (
      <div className="p-4 border-t border-slate-700">
        <div className="text-center text-sm text-slate-400">Not authenticated</div>
      </div>
    );
  }

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        await signOut();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  return (
    <div className="p-4 border-t border-slate-700">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <User size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{user?.email}</p>
          <p className="text-xs text-slate-400 flex items-center">
            {isMasterAdmin && <Shield size={12} className="mr-1" />}
            {isMasterAdmin ? 'Master Admin' : userProfile?.role || 'User'}
          </p>
        </div>
      </div>
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
      >
        <LogOut size={16} />
        <span>Sign Out</span>
      </button>
    </div>
  );
};
// src/layout/Sidebar.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { usePermission } from '../usePermission';
import { useLocation, useNavigate } from 'react-router-dom';

// import { useAuth } from '../authContext';

// Persistent state hook
const usePersistentState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }, [key, state]);

  return [state, setState];
};

// Real-time stats hook
const useRealTimeStats = () => {
  const [stats, setStats] = useState({
    activeClients: 24,
    pendingClients: 6,
    archivedClients: 12,
    hotLeads: 3,
    warmLeads: 5,
    followupLeads: 2,
    disputesWon: 156,
    monthlyGrowth: 18,
    urgentDisputes: 3,
    totalNotifications: 5
  });

  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with your actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats(prev => ({
        ...prev,
        activeClients: Math.floor(Math.random() * 10) + 20,
        urgentDisputes: Math.floor(Math.random() * 5) + 1
      }));
    } catch (error) {
      console.warn('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
};

// Mobile detection hook
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Fuzzy search hook
const useFuzzySearch = (items, searchTerm) => {
  return useMemo(() => {
    if (!searchTerm.trim()) return items;
    const searchLower = searchTerm.toLowerCase();
    return items.filter(item => {
      const mainMatch = item.label.toLowerCase().includes(searchLower) ||
                       item.description.toLowerCase().includes(searchLower);
      const submenuMatch = item.submenu?.some(sub => 
        sub.label.toLowerCase().includes(searchLower)
      );
      return mainMatch || submenuMatch;
    });
  }, [items, searchTerm]);
};

// Smart Badge Component
const SmartBadge = ({ type, count, animate = false }) => {
  const getBadgeConfig = () => {
    const configs = {
      count: {
        className: 'bg-blue-500 text-white',
        text: count > 99 ? '99+' : count?.toString() || '0'
      },
      urgent: {
        className: `bg-red-500 text-white ${animate ? 'animate-pulse' : ''}`,
        text: 'URGENT'
      },
      new: {
        className: 'bg-green-500 text-white',
        text: 'NEW'
      }
    };
    return configs[type] || configs.count;
  };

  if (type === 'count' && (!count || count === 0)) return null;

  const config = getBadgeConfig();
  return (
    <span className={`px-2 py-1 text-xs rounded-full font-medium ${config.className}`}>
      {config.text}
    </span>
  );
};

// Progress Ring Component
const ProgressRing = ({ progress, size = 40, strokeWidth = 3 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${(progress * circumference) / 100} ${circumference}`;
  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-600"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          className="text-blue-400 transition-all duration-300"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

// Search Bar Component
const SearchBar = ({ isCollapsed, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    onSearch(searchTerm);
  }, [searchTerm, onSearch]);
  if (isCollapsed) return null;
  return (
    <div className="p-4 border-b border-slate-700">
      <div className="relative">
        <input
          id="sidebar-search"
          type="text"
          placeholder="Search navigation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 pl-8 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <Search className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-2 top-2.5 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Quick Actions Component
const QuickActions = ({ item, navigate, isCollapsed }) => {
  if (!item.quickActions || isCollapsed) return null;
  const iconMap = { Plus, Search, AlertTriangle, Eye };
  return (
    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
      {item.quickActions.map((action, i) => {
        const IconComponent = iconMap[action.icon];
        return (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              if (action.path) navigate(action.path);
              else if (action.action === 'search') {
                document.getElementById('sidebar-search')?.focus();
              }
            }}
            className="p-1 hover:bg-slate-600 rounded text-slate-400 hover:text-white transition-colors"
            title={action.label}
          >
            {IconComponent && <IconComponent size={12} />}
          </button>
        );
      })}
    </div>
  );
};

// Notification Center Component
const NotificationCenter = ({ isCollapsed, stats }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Mock notifications - replace with real data
  const notifications = [
    { id: 1, title: 'New Client Added', message: 'John Doe has been added to your client list', read: false },
    { id: 2, title: 'Dispute Update', message: 'Credit report dispute for Jane Smith has been resolved', read: true }
  ];
  const unreadCount = notifications.filter(n => !n.read).length;
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 w-full text-left hover:bg-slate-700 p-2 rounded transition-colors"
      >
        <div className="relative">
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        {!isCollapsed && <span>Notifications</span>}
      </button>
      {isOpen && !isCollapsed && (
        <div className="absolute top-full left-0 right-0 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-slate-400 text-center">No notifications</div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-3 border-b border-slate-700 last:border-b-0 hover:bg-slate-700 cursor-pointer ${!notification.read ? 'bg-slate-750' : ''}`}
              >
                <div className="text-sm font-medium">{notification.title}</div>
                <div className="text-xs text-slate-400 mt-1">{notification.message}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Sidebar Navigation Items
const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    description: 'Overview & Analytics'
  },
  {
    id: 'social-admin',
    label: 'Social Media Admin',
    icon: FileText,
    path: '/social-admin',
    description: 'Review & approve AI responses'
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: Users,
    path: '/clients',
    badge: '24',
    description: 'Manage Client Accounts',
    submenu: [
      { label: 'Active Clients', path: '/clients/active', count: 18 },
      { label: 'Pending', path: '/clients/pending', count: 6 },
      { label: 'Archived', path: '/clients/archived', count: 12 }
    ],
    quickActions: [
      { icon: 'Plus', label: 'Add Client', path: '/clients/new' },
      { icon: 'Search', label: 'Search Clients', action: 'search' }
    ]
  },
  {
    id: 'leads',
    label: 'Leads',
    icon: UserPlus,
    path: '/leads',
    badge: '8',
    description: 'New Lead Management',
    submenu: [
      { label: 'Hot Leads', path: '/leads/hot', count: 3 },
      { label: 'Warm Leads', path: '/leads/warm', count: 5 },
      { label: 'Follow Up', path: '/leads/followup', count: 2 }
    ]
  },
  {
    id: 'progress',
    label: 'Progress Portal',
    icon: TrendingUp,
    path: '/progress',
    description: 'Client Progress Tracking'
  },
  {
    id: 'disputes',
    label: 'Dispute Center',
    icon: AlertTriangle,
    path: '/disputes',
    badge: 'URGENT',
    badgeColor: 'bg-red-500',
    description: 'Active Disputes & Challenges',
    quickActions: [
      { icon: 'AlertTriangle', label: 'New Dispute', path: '/disputes/new' },
      { icon: 'Eye', label: 'Urgent Items', path: '/disputes?filter=urgent' }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileText,
    path: '/reports',
    description: 'Analytics & Insights',
    submenu: [
      { label: 'Monthly Reports', path: '/reports/monthly' },
      { label: 'Client Progress', path: '/reports/progress' },
      { label: 'Financial Reports', path: '/reports/financial' }
    ]
  },
  {
    id: 'activity',
    label: 'Activity Log',
    icon: Activity,
    path: '/activity',
    description: 'System Activity & Updates'
  },
  {
    id: 'features',
    label: 'Features & Tutorials',
    icon: BookOpen,
    path: '/features',
    badge: 'NEW',
    badgeColor: 'bg-green-500',
    description: 'Learn & Discover'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    description: 'App Configuration'
  }
];

// Sidebar Component
const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = usePersistentState('sidebarCollapsed', false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const { stats } = useRealTimeStats();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMobileDetection();
  const filteredItems = useFuzzySearch(navigationItems, searchTerm);
  const { hasFeatureAccess, isAuthenticated, isMasterAdmin, getUserRole } = usePermission();
  const { signOut } = useAuth();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.altKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (filteredItems[index]) {
          navigate(filteredItems[index].path);
        }
      }
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
      if (e.altKey && e.key === '/') {
        e.preventDefault();
        document.getElementById('sidebar-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [filteredItems, navigate]);

  // Navigation click handler
  const handleNavigation = (item) => {
    if (item.submenu && !isCollapsed) {
      setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
    } else {
      setActiveItem(item.id);
      setActiveSubmenu(null);
      navigate(item.path);
    }
  };

  // Submenu click handler
  const handleSubmenuClick = (subItem) => {
    navigate(subItem.path);
  };

  // Quick stats
  const quickStats = [
    { label: 'Active Clients', value: stats.activeClients, icon: Users, color: 'text-blue-400' },
    { label: 'Disputes Won', value: stats.disputesWon, icon: Star, color: 'text-yellow-400' },
    { label: 'This Month', value: `+${stats.monthlyGrowth}`, icon: Calendar, color: 'text-green-400' }
  ];

  // Mobile overlay
  const MobileOverlay = ({ isVisible, onClose }) => {
    if (!isVisible) return null;
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
    );
  };

  // Filter navigation items by feature access
  const visibleItems = useMemo(() => {
    return filteredItems.filter(item => {
      // Always show dashboard and social-admin
      if (item.id === 'dashboard' || item.id === 'social-admin') return true;
      // Only show if user has access
      return hasFeatureAccess(item.id);
    });
  }, [filteredItems, hasFeatureAccess]);

  return (
    <>
      <MobileOverlay isVisible={isMobile && !isCollapsed} onClose={() => setIsCollapsed(true)} />
      <div className={`bg-slate-900 text-white transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'} min-h-screen flex flex-col shadow-xl`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Speedy Credit
                </h1>
                <p className="text-xs text-slate-400">Repair Dashboard</p>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
        </div>
        {/* Quick Stats */}
        {!isCollapsed && (
          <div className="p-4 border-b border-slate-700">
            <div className="space-y-2">
              {quickStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <stat.icon size={14} className={stat.color} />
                    <span className="text-slate-300">{stat.label}</span>
                  </div>
                  <span className="font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Search Bar */}
        <SearchBar isCollapsed={isCollapsed} onSearch={setSearchTerm} />
        {/* Notification Center */}
        <NotificationCenter isCollapsed={isCollapsed} stats={stats} />
        {/* Navigation */}
        <nav className="flex-1 p-4" role="navigation" aria-label="Main navigation">
          <ul className="space-y-2">
            {visibleItems.map((item) => (
              <li key={item.id}>
                <div
                  className={`group relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    activeItem === item.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  onClick={() => handleNavigation(item)}
                  tabIndex={0}
                  aria-expanded={activeSubmenu === item.id}
                  aria-describedby={`${item.id}-description`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleNavigation(item);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <item.icon size={20} className="flex-shrink-0" />
                    {!isCollapsed && (
                      <div className="min-w-0">
                        <span className="block font-medium truncate">{item.label}</span>
                        <span className="text-xs text-slate-400 truncate">{item.description}</span>
                      </div>
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          item.badgeColor || 'bg-blue-500'
                        } text-white`}>
                          {item.badge}
                        </span>
                      )}
                      {item.submenu && (
                        <ChevronRight 
                          size={14} 
                          className={`transition-transform ${activeSubmenu === item.id ? 'rotate-90' : ''}`}
                        />
                      )}
                      <QuickActions item={item} navigate={navigate} isCollapsed={isCollapsed} />
                    </div>
                  )}
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-16 bg-slate-800 text-white px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-slate-400">{item.description}</div>
                      {item.badge && (
                        <div className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          item.badgeColor || 'bg-blue-500'
                        } text-white`}>
                          {item.badge}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Submenu */}
                {item.submenu && !isCollapsed && activeSubmenu === item.id && (
                  <ul className="mt-2 ml-6 space-y-1 border-l-2 border-slate-600 pl-4 animate-in slide-in-from-top-2 duration-200">
                    {item.submenu.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <div
                          className="flex items-center justify-between p-2 text-sm rounded cursor-pointer text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubmenuClick(subItem);
                          }}
                        >
                          <span>{subItem.label}</span>
                          {subItem.count && (
                            <span className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded">
                              {subItem.count}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <span id={`${item.id}-description`} className="sr-only">
                  {item.description}
                </span>
              </li>
            ))}
          </ul>
        </nav>
        {/* Footer: User section with authentication UI */}
        <SidebarUserSection />
        {/* Theme Toggle - Sticky at Bottom */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="flex items-center gap-3">
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
              <span className="text-sm font-medium">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;