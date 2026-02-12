// src/layout/ProtectedLayout.jsx
// PROTECTED LAYOUT WITH ACCORDION NAVIGATION + REAL-TIME STAFF NOTIFICATIONS
// VERSION: 4.0 - NOTIFICATION SYSTEM (Bell + Toast + Browser Push + Audio Chime)
// LAST UPDATED: 2026-02-10
//
// WHAT'S NEW IN v4.0:
// - Real-time Firebase listener on staffNotifications collection
// - Bell icon shows REAL unread count from Firestore
// - Dropdown notification panel with mark-as-read
// - Toast/snackbar popups for incoming notifications
// - Browser native push notifications (with permission request)
// - Audio chime with volume slider, sound picker, mute toggle
// - Notification sound settings persisted in localStorage
// - Mute only silences chime — does NOT hide visual alerts
// - Hot leads (leadScore ≥ 7) get special urgent treatment
//
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
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
  Users as UsersIcon,
  Volume2,
  VolumeX,
  Volume1,
  CheckCheck,
  Flame,
  UserCheck,
  CreditCard,
  AlertTriangle,
  Info,
  XCircle
} from 'lucide-react';
import {
  navigationItems,
  filterNavigationByRole,
  getMobileNavigation,
  ROLES
} from './navConfig';
import GlobalFooter from '../components/common/GlobalFooter';

// ============================================================================
// NOTIFICATION SOUND ENGINE — Uses Web Audio API (no external files needed)
// ============================================================================
// Generates clean chime tones programmatically. Three sound options:
//   1) "chime"   — pleasant two-note ascending chime (default)
//   2) "urgent"  — three-note rapid alert for hot leads
//   3) "soft"    — gentle single-note ping
//   4) "bell"    — classic bell tone
// ============================================================================

const SOUND_OPTIONS = [
  { id: 'chime', label: 'Chime (Default)', description: 'Pleasant two-note ascending' },
  { id: 'urgent', label: 'Urgent Alert', description: 'Three-note rapid alert' },
  { id: 'soft', label: 'Soft Ping', description: 'Gentle single note' },
  { id: 'bell', label: 'Classic Bell', description: 'Traditional bell tone' },
];

// ===== playNotificationSound =====
// Plays a generated tone using the Web Audio API.
// Parameters:
//   soundId (string) — which sound to play ('chime', 'urgent', 'soft', 'bell')
//   volume  (number) — 0.0 to 1.0
// Returns: nothing (fire-and-forget)
const playNotificationSound = (soundId = 'chime', volume = 0.5) => {
  try {
    // Create a fresh AudioContext each time (avoids state issues)
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const masterGain = audioCtx.createGain();
    masterGain.gain.value = Math.max(0, Math.min(1, volume));
    masterGain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (soundId === 'chime') {
      // ===== Two-note ascending chime =====
      [523.25, 659.25].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.6, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.5);
      });
    } else if (soundId === 'urgent') {
      // ===== Three-note rapid alert =====
      [880, 1046.5, 1318.5].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.7, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.3);
      });
    } else if (soundId === 'soft') {
      // ===== Gentle single-note ping =====
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.7);
    } else if (soundId === 'bell') {
      // ===== Classic bell tone (two harmonics) =====
      [523.25, 1046.5].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(i === 0 ? 0.5 : 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.9);
      });
    }

    // Clean up AudioContext after sounds finish
    setTimeout(() => {
      audioCtx.close().catch(() => {});
    }, 2000);
  } catch (err) {
    console.warn('🔇 Notification sound failed (browser may block autoplay):', err.message);
  }
};

// ============================================================================
// NOTIFICATION ICON HELPER — Maps notification type to icon + color
// ============================================================================
const getNotificationIcon = (type, priority) => {
  if (priority === 'critical' || type === 'hot_lead') {
    return { Icon: Flame, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' };
  }
  switch (type) {
    case 'new_contact':
      return { Icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    case 'enrollment':
      return { Icon: UserCheck, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' };
    case 'payment':
      return { Icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' };
    case 'warning':
      return { Icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
    case 'error':
      return { Icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' };
    default:
      return { Icon: Info, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' };
  }
};

// ============================================================================
// TIME AGO HELPER — Converts timestamp to "2m ago", "3h ago", etc.
// ============================================================================
const getTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffSec < 30) return 'Just now';
  if (diffMin < 1) return `${diffSec}s ago`;
  if (diffHr < 1) return `${diffMin}m ago`;
  if (diffDay < 1) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};


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
    const saved = localStorage.getItem('expandedGroupId');
    return saved || null;
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNav, setFilteredNav] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // =========================================================================
  // NOTIFICATION STATE — Real-time from Firebase staffNotifications collection
  // =========================================================================
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const notifPanelRef = useRef(null);
  const bellRef = useRef(null);

  // ===== TOAST STATE — Popups for new incoming notifications =====
  const [toasts, setToasts] = useState([]);
  const toastTimeoutRef = useRef({});

  // ===== NOTIFICATION SOUND SETTINGS (persisted in localStorage) =====
  const [soundSettings, setSoundSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('notifSoundSettings');
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore parse errors */ }
    // Defaults: sound ON, volume 50%, chime sound, normal sound for regular, urgent for hot leads
    return {
      muted: false,
      volume: 0.5,
      defaultSound: 'chime',
      hotLeadSound: 'urgent',
      browserPushEnabled: true,
    };
  });

  // ===== Track notification IDs we've already alerted on (so we don't re-chime on page reload) =====
  const alertedNotifIds = useRef(new Set());
  const isInitialLoad = useRef(true);

  // Determine if mobile
  const isMobile = windowWidth < 768;

  // Get user role
  const userRole = userProfile?.role || user?.role || 'viewer'; // ⚠️ SECURITY: default 'viewer' not 'user'

  // =========================================================================
  // PERSIST SOUND SETTINGS to localStorage whenever they change
  // =========================================================================
  useEffect(() => {
    localStorage.setItem('notifSoundSettings', JSON.stringify(soundSettings));
  }, [soundSettings]);

  // =========================================================================
  // FIREBASE REAL-TIME LISTENER — staffNotifications collection
  // =========================================================================
  // Listens for notifications targeted at the current user's role level.
  // The staffNotifications collection uses a targetRoles array so we can
  // filter who sees what. Each notification has a readBy map where keys
  // are user UIDs — if your UID is in readBy, it's "read" for you.
  // =========================================================================
  useEffect(() => {
    if (!user?.uid) return;

    // ===== Determine which roles this user can see notifications for =====
    // Staff roles: masterAdmin, admin, manager, user (levels 5-8)
    const STAFF_ROLES = ['masterAdmin', 'admin', 'manager', 'user'];
    if (!STAFF_ROLES.includes(userRole)) {
      console.log('🔔 Notification listener skipped — user role is:', userRole);
      return;
    }

    console.log('🔔 Starting notification listener for role:', userRole);

    // ===== Query: Get recent staff notifications (last 50) =====
    const notifQuery = query(
      collection(db, 'staffNotifications'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(notifQuery, (snapshot) => {
      const allNotifs = [];
      let newUnread = 0;

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const notif = { id: docSnap.id, ...data };

        // ===== ROLE FILTER: Only show if user's role is in targetRoles =====
        const targetRoles = data.targetRoles || STAFF_ROLES;
        if (!targetRoles.includes(userRole)) return;

        // ===== UNREAD CHECK: Is this user's UID in the readBy map? =====
        const readBy = data.readBy || {};
        notif.isRead = !!readBy[user.uid];
        if (!notif.isRead) newUnread++;

        allNotifs.push(notif);
      });

      // ===== DETECT TRULY NEW NOTIFICATIONS (for chime + toast + push) =====
      // On initial page load, we mark all existing notifications as "already alerted"
      // so we only chime/toast for notifications that arrive AFTER the page loaded.
      if (isInitialLoad.current) {
        // First load — record all current IDs, don't alert
        allNotifs.forEach(n => alertedNotifIds.current.add(n.id));
        isInitialLoad.current = false;
        console.log('🔔 Initial load — recorded', allNotifs.length, 'existing notifications');
      } else {
        // Subsequent snapshot — check for new notifications we haven't alerted on
        allNotifs.forEach((notif) => {
          if (!alertedNotifIds.current.has(notif.id) && !notif.isRead) {
            alertedNotifIds.current.add(notif.id);
            handleNewNotification(notif);
          }
        });
      }

      setNotifications(allNotifs);
      setUnreadCount(newUnread);
    }, (error) => {
      console.error('❌ Notification listener error:', error);
    });

    return () => unsubscribe();
  }, [user?.uid, userRole]); // Re-subscribe if user or role changes

  // =========================================================================
  // HANDLE NEW NOTIFICATION — Fires chime, toast, and browser push
  // =========================================================================
  const handleNewNotification = useCallback((notif) => {
    console.log('🔔 NEW notification received:', notif.title);

    const isHotLead = notif.type === 'hot_lead' || notif.priority === 'critical';

    // ===== 1) AUDIO CHIME =====
    if (!soundSettings.muted) {
      const soundToPlay = isHotLead ? soundSettings.hotLeadSound : soundSettings.defaultSound;
      playNotificationSound(soundToPlay, soundSettings.volume);
      // Hot leads get a second chime after 1 second for emphasis
      if (isHotLead) {
        setTimeout(() => {
          playNotificationSound(soundSettings.hotLeadSound, soundSettings.volume);
        }, 1200);
      }
    }

    // ===== 2) TOAST POPUP =====
    const toastId = `toast-${notif.id}-${Date.now()}`;
    setToasts((prev) => [
      ...prev,
      {
        id: toastId,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        priority: notif.priority,
        contactId: notif.contactId,
        createdAt: notif.createdAt,
      },
    ]);

    // Auto-dismiss toast after 8 seconds (hot leads stay 12 seconds)
    const dismissDelay = isHotLead ? 12000 : 8000;
    toastTimeoutRef.current[toastId] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
      delete toastTimeoutRef.current[toastId];
    }, dismissDelay);

    // ===== 3) BROWSER PUSH NOTIFICATION =====
    if (soundSettings.browserPushEnabled && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          const browserNotif = new Notification(notif.title || 'SpeedyCRM Alert', {
            body: notif.message || '',
            icon: '/brand/default/logo-brand-128.png',
            tag: notif.id, // Prevents duplicate browser notifications
            requireInteraction: isHotLead, // Hot leads stay until dismissed
          });
          // Clicking the browser notification focuses the CRM tab
          browserNotif.onclick = () => {
            window.focus();
            if (notif.contactId) {
              navigate(`/contacts/${notif.contactId}`);
            }
            browserNotif.close();
          };
        } catch (pushErr) {
          console.warn('⚠️ Browser push failed:', pushErr.message);
        }
      } else if (Notification.permission === 'default') {
        // Ask for permission on first notification
        Notification.requestPermission().then((perm) => {
          console.log('🔔 Browser push permission:', perm);
        });
      }
    }
  }, [soundSettings, navigate]);

  // =========================================================================
  // MARK NOTIFICATION AS READ — Updates readBy map in Firestore
  // =========================================================================
  const markAsRead = async (notifId) => {
    if (!user?.uid) return;
    try {
      const notifRef = doc(db, 'staffNotifications', notifId);
      await updateDoc(notifRef, {
        [`readBy.${user.uid}`]: Timestamp.now()
      });
      console.log('✅ Notification marked as read:', notifId);
    } catch (err) {
      console.error('❌ Failed to mark notification as read:', err);
    }
  };

  // =========================================================================
  // MARK ALL NOTIFICATIONS AS READ — Batch update
  // =========================================================================
  const markAllAsRead = async () => {
    if (!user?.uid || unreadCount === 0) return;
    try {
      const batch = writeBatch(db);
      const unreadNotifs = notifications.filter((n) => !n.isRead);
      
      unreadNotifs.forEach((notif) => {
        const notifRef = doc(db, 'staffNotifications', notif.id);
        batch.update(notifRef, {
          [`readBy.${user.uid}`]: Timestamp.now()
        });
      });

      await batch.commit();
      console.log('✅ All notifications marked as read:', unreadNotifs.length);
    } catch (err) {
      console.error('❌ Failed to mark all as read:', err);
    }
  };

  // =========================================================================
  // DISMISS TOAST — Remove a toast popup manually
  // =========================================================================
  const dismissToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
    if (toastTimeoutRef.current[toastId]) {
      clearTimeout(toastTimeoutRef.current[toastId]);
      delete toastTimeoutRef.current[toastId];
    }
  };

  // =========================================================================
  // CLICK OUTSIDE — Close notification panel when clicking elsewhere
  // =========================================================================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showNotifPanel &&
        notifPanelRef.current &&
        !notifPanelRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setShowNotifPanel(false);
        setShowNotifSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifPanel]);

  // =========================================================================
  // REQUEST BROWSER PUSH PERMISSION on first mount (if not yet decided)
  // =========================================================================
  useEffect(() => {
    if (soundSettings.browserPushEnabled && 'Notification' in window && Notification.permission === 'default') {
      // Wait 5 seconds before asking — let the page load first
      const timer = setTimeout(() => {
        Notification.requestPermission().then((perm) => {
          console.log('🔔 Browser notification permission:', perm);
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [soundSettings.browserPushEnabled]);

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

  // ===== HELPER: HANDLE NOTIFICATION CLICK (bell icon) =====
  const handleNotificationClick = () => {
    setShowNotifPanel((prev) => !prev);
    setShowNotifSettings(false);
  };

  // ===== HELPER: HANDLE NOTIFICATION ITEM CLICK =====
  const handleNotifItemClick = (notif) => {
    // Mark as read
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
    // Navigate to the contact if available
    if (notif.contactId) {
      navigate(`/contacts/${notif.contactId}`);
      setShowNotifPanel(false);
    }
  };

  // ===== HELPER: TEST NOTIFICATION SOUND =====
  const testSound = (soundId) => {
    playNotificationSound(soundId, soundSettings.volume);
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
                alt="Speedy Credit Repair CRM Logo"
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
                  Speedy Credit Repair CRM
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Credit Repair</p>
              </div>
            </div>
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

              {/* ============================================================ */}
              {/* NOTIFICATIONS BELL — Real-time unread count from Firestore   */}
              {/* ============================================================ */}
              <div className="relative">
                <button 
                  ref={bellRef}
                  onClick={handleNotificationClick}
                  className={`relative p-2 rounded-lg transition-colors ${
                    showNotifPanel 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                  title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                  <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
                  {unreadCount > 0 && (
                    <>
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </>
                  )}
                </button>

                {/* ========================================================== */}
                {/* NOTIFICATION DROPDOWN PANEL                                 */}
                {/* ========================================================== */}
                {showNotifPanel && (
                  <div
                    ref={notifPanelRef}
                    className="absolute right-0 top-12 w-96 max-h-[520px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
                    style={{ maxWidth: isMobile ? 'calc(100vw - 32px)' : '384px' }}
                  >
                    {/* Panel Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-sm text-gray-800 dark:text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {/* Sound Settings Toggle */}
                        <button
                          onClick={() => setShowNotifSettings(!showNotifSettings)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            showNotifSettings
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                              : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500'
                          }`}
                          title="Sound settings"
                        >
                          {soundSettings.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        {/* Mark All Read */}
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                            title="Mark all as read"
                          >
                            <CheckCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ====================================================== */}
                    {/* SOUND SETTINGS PANEL (collapsible)                      */}
                    {/* ====================================================== */}
                    {showNotifSettings && (
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/10 flex-shrink-0 space-y-3">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Sound Settings</p>
                        
                        {/* Mute Toggle */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">Sound Alerts</span>
                          <button
                            onClick={() => setSoundSettings(prev => ({ ...prev, muted: !prev.muted }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              !soundSettings.muted ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              !soundSettings.muted ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                        {soundSettings.muted && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            🔇 Muted — visual alerts (toast + badge + browser push) still active
                          </p>
                        )}

                        {/* Volume Slider */}
                        {!soundSettings.muted && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600 dark:text-gray-400">Volume</span>
                              <span className="text-xs font-mono text-gray-500">{Math.round(soundSettings.volume * 100)}%</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Volume1 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={Math.round(soundSettings.volume * 100)}
                                onChange={(e) => setSoundSettings(prev => ({ ...prev, volume: parseInt(e.target.value) / 100 }))}
                                className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full appearance-none cursor-pointer accent-blue-500"
                              />
                              <Volume2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            </div>
                          </div>
                        )}

                        {/* Default Sound Picker */}
                        {!soundSettings.muted && (
                          <div className="space-y-1">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Default Sound</span>
                            <div className="grid grid-cols-2 gap-1">
                              {SOUND_OPTIONS.map((sound) => (
                                <button
                                  key={sound.id}
                                  onClick={() => {
                                    setSoundSettings(prev => ({ ...prev, defaultSound: sound.id }));
                                    testSound(sound.id);
                                  }}
                                  className={`px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                                    soundSettings.defaultSound === sound.id
                                      ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                                  }`}
                                >
                                  {sound.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Hot Lead Sound Picker */}
                        {!soundSettings.muted && (
                          <div className="space-y-1">
                            <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                              <Flame className="w-3 h-3 text-red-500" />
                              <span>Hot Lead Sound</span>
                            </span>
                            <div className="grid grid-cols-2 gap-1">
                              {SOUND_OPTIONS.map((sound) => (
                                <button
                                  key={sound.id}
                                  onClick={() => {
                                    setSoundSettings(prev => ({ ...prev, hotLeadSound: sound.id }));
                                    testSound(sound.id);
                                  }}
                                  className={`px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                                    soundSettings.hotLeadSound === sound.id
                                      ? 'border-red-500 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                                  }`}
                                >
                                  {sound.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Browser Push Toggle */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">Browser Push Alerts</span>
                          <button
                            onClick={() => {
                              const newVal = !soundSettings.browserPushEnabled;
                              setSoundSettings(prev => ({ ...prev, browserPushEnabled: newVal }));
                              if (newVal && 'Notification' in window && Notification.permission === 'default') {
                                Notification.requestPermission();
                              }
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              soundSettings.browserPushEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              soundSettings.browserPushEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ====================================================== */}
                    {/* NOTIFICATION LIST (scrollable)                          */}
                    {/* ====================================================== */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                          <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No notifications yet</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            You'll see alerts here when new leads arrive
                          </p>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const { Icon: NotifIcon, color, bg } = getNotificationIcon(notif.type, notif.priority);
                          
                          return (
                            <button
                              key={notif.id}
                              onClick={() => handleNotifItemClick(notif)}
                              className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                                !notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                {/* Icon */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${bg}`}>
                                  <NotifIcon className={`w-4 h-4 ${color}`} />
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className={`text-sm truncate ${!notif.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                      {notif.title}
                                    </p>
                                    {!notif.isRead && (
                                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {getTimeAgo(notif.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Panel Footer */}
                    {notifications.length > 0 && (
                      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-750">
                        <button
                          onClick={() => {
                            navigate('/notifications');
                            setShowNotifPanel(false);
                          }}
                          className="w-full text-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-1 transition-colors"
                        >
                          View All Notifications →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
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
          {/* Only one footer per page, placed here for all protected routes */}
          <GlobalFooter variant="default" />
        </main>
      </div>

      {/* ================================================================== */}
      {/* TOAST NOTIFICATIONS — Slide in from top-right for new alerts       */}
      {/* ================================================================== */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col space-y-2 pointer-events-none" style={{ maxWidth: '400px' }}>
        {toasts.map((toast) => {
          const isHotLead = toast.type === 'hot_lead' || toast.priority === 'critical';
          const { Icon: ToastIcon, color: toastColor } = getNotificationIcon(toast.type, toast.priority);
          
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto animate-in slide-in-from-right duration-300 rounded-xl shadow-2xl border overflow-hidden ${
                isHotLead
                  ? 'bg-red-50 dark:bg-red-900/40 border-red-300 dark:border-red-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Hot lead pulsing top border */}
              {isHotLead && (
                <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse"></div>
              )}
              <div className="flex items-start p-3 space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isHotLead ? 'bg-red-100 dark:bg-red-900/50' : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  <ToastIcon className={`w-4 h-4 ${toastColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isHotLead ? 'text-red-800 dark:text-red-200' : 'text-gray-900 dark:text-white'}`}>
                    {toast.title}
                  </p>
                  <p className={`text-xs mt-0.5 ${isHotLead ? 'text-red-600 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'}`}>
                    {toast.message}
                  </p>
                </div>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 flex-shrink-0 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes slide-in-from-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-in.slide-in-from-right {
          animation: slide-in-from-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProtectedLayout;