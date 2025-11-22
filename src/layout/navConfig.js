// src/layout/navConfig.js
// CONSOLIDATED NAVIGATION CONFIGURATION - VERSION 4.0
// PHASE 3: Hub-Based Navigation (67 items → 24 items)
// LAST UPDATED: 2025-11-21 - Phase 3 Navigation Cleanup Complete

import {
  // ===== CORE =====
  Home, LayoutDashboard, Settings,

  // ===== PEOPLE & ORGANIZATION =====
  Users, User, UserPlus, Handshake, Crown,

  // ===== DOCUMENTS & DATA =====
  FileText, FolderOpen,

  // ===== COMMUNICATION =====
  MessageSquare, Calendar, Zap,

  // ===== CREDIT & FINANCE =====
  CreditCard, TrendingUp, DollarSign, Receipt, Shield,

  // ===== AI & ANALYTICS =====
  Brain, BarChart,

  // ===== LEARNING & ACHIEVEMENT =====
  GraduationCap,

  // ===== MOBILE =====
  Smartphone,

  // ===== MISC =====
  AlertCircle, HelpCircle, Globe, Star
} from 'lucide-react';

// ============================================================================
// ROLE HIERARCHY & PERMISSIONS
// ============================================================================

/**
 * Role hierarchy (higher number = more permissions)
 * Used for permission inheritance
 */
export const ROLE_HIERARCHY = {
  viewer: 1,
  prospect: 2,
  client: 3,
  affiliate: 4,
  user: 5,
  manager: 6,
  admin: 7,
  masterAdmin: 8
};

/**
 * Role definitions with descriptions
 */
export const ROLES = {
  masterAdmin: {
    level: 8,
    label: 'Master Admin',
    description: 'Full system control',
    icon: Crown,
    color: 'yellow'
  },
  admin: {
    level: 7,
    label: 'Administrator',
    description: 'Team leadership & management',
    icon: Shield,
    color: 'red'
  },
  manager: {
    level: 6,
    label: 'Manager',
    description: 'Department oversight',
    icon: Users,
    color: 'purple'
  },
  user: {
    level: 5,
    label: 'Employee',
    description: 'Daily operations',
    icon: User,
    color: 'blue'
  },
  client: {
    level: 3,
    label: 'Client',
    description: 'Active customer',
    icon: User,
    color: 'green'
  },
  prospect: {
    level: 2,
    label: 'Prospect',
    description: 'Potential client',
    icon: UserPlus,
    color: 'orange'
  },
  affiliate: {
    level: 4,
    label: 'Affiliate Partner',
    description: 'Referral partner',
    icon: Handshake,
    color: 'cyan'
  },
  viewer: {
    level: 1,
    label: 'Viewer',
    description: 'Read-only access',
    icon: Eye,
    color: 'gray'
  }
};

// ============================================================================
// PERMISSION HELPERS
// ============================================================================

/**
 * Check if user has minimum required permission level
 */
export function hasPermission(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

/**
 * Check if item should be visible for user's role
 */
export function isVisible(item, userRole, isMobile = false) {
  // Master admin sees everything
  if (userRole === 'masterAdmin') return true;

  // Check mobile visibility
  if (isMobile && item.mobileHidden) return false;

  // Check role-specific visibility
  if (item.visibleTo) {
    if (Array.isArray(item.visibleTo)) {
      return item.visibleTo.includes(userRole);
    }
    return item.visibleTo === userRole;
  }

  // Check minimum permission level
  if (item.permission) {
    return hasPermission(userRole, item.permission);
  }

  // Default: visible
  return true;
}

// ============================================================================
// NAVIGATION ITEMS - CONSOLIDATED HUB-BASED STRUCTURE (Phase 3)
// ============================================================================
// REDUCED FROM 113 ITEMS → 24 ITEMS
// All standalone pages redirect to their parent hubs via App.jsx
// ============================================================================

export const navigationItems = [
  // ==========================================================================
  // 🏠 CORE NAVIGATION (4 items)
  // ==========================================================================
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/smart-dashboard',
    icon: LayoutDashboard,
    permission: 'prospect',
    mobileHidden: false,
    description: 'Analytics, metrics, and role-based widgets',
    category: 'core'
  },
  {
    id: 'client-portal',
    title: 'Client Portal',
    path: '/client-portal',
    icon: User,
    permission: 'client',
    mobileHidden: false,
    description: 'Client progress dashboard with scores, disputes, payments',
    category: 'client'
  },
  {
    id: 'admin-portal',
    title: 'Admin Portal',
    path: '/portal',
    icon: Crown,
    permission: 'admin',
    mobileHidden: true,
    badge: 'ADMIN',
    description: 'Complete system control center',
    category: 'admin'
  },

  // ==========================================================================
  // 👥 OPERATIONS HUBS (6 items)
  // ==========================================================================
  {
    id: 'operations-hubs',
    title: 'Operations',
    icon: Users,
    isGroup: true,
    permission: 'user',
    mobileHidden: false,
    category: 'operations',
    defaultExpanded: true,
    items: [
      {
        id: 'clients-hub',
        title: 'Clients Hub',
        path: '/clients-hub',
        icon: Users,
        permission: 'user',
        badge: 'AI',
        description: 'Complete client & contact management'
      },
      {
        id: 'credit-hub',
        title: 'Credit Hub',
        path: '/credit-hub',
        icon: Shield,
        permission: 'client',
        badge: 'AI',
        description: 'IDIQ credit monitoring & analysis'
      },
      {
        id: 'dispute-hub',
        title: 'Dispute Hub',
        path: '/dispute-hub',
        icon: AlertCircle,
        permission: 'user',
        description: 'Dispute management & letters'
      },
      {
        id: 'comms-hub',
        title: 'Communications',
        path: '/comms-hub',
        icon: MessageSquare,
        permission: 'user',
        badge: 'AI',
        description: 'Email, SMS, calls, campaigns'
      },
      {
        id: 'documents-hub',
        title: 'Documents',
        path: '/documents-hub',
        icon: FolderOpen,
        permission: 'user',
        description: 'All documents & e-contracts'
      },
      {
        id: 'tasks-hub',
        title: 'Tasks & Calendar',
        path: '/tasks-hub',
        icon: Calendar,
        permission: 'user',
        description: 'Tasks, calendar, scheduling'
      }
    ]
  },

  // ==========================================================================
  // 📈 BUSINESS GROWTH (5 items)
  // ==========================================================================
  {
    id: 'growth-hubs',
    title: 'Business Growth',
    icon: TrendingUp,
    isGroup: true,
    permission: 'user',
    mobileHidden: false,
    category: 'growth',
    items: [
      {
        id: 'marketing-hub',
        title: 'Marketing Hub',
        path: '/marketing-hub',
        icon: Zap,
        permission: 'user',
        badge: 'AI',
        description: 'Campaigns, drip sequences, content'
      },
      {
        id: 'affiliates-hub',
        title: 'Affiliates',
        path: '/affiliates-hub',
        icon: Handshake,
        permission: 'user',
        description: 'Affiliate & referral management'
      },
      {
        id: 'social-media-hub',
        title: 'Social Media',
        path: '/social-media-hub',
        icon: Globe,
        permission: 'user',
        description: 'Social media management'
      },
      {
        id: 'reviews-hub',
        title: 'Reviews',
        path: '/reviews-hub',
        icon: Star,
        permission: 'user',
        description: 'Reputation management'
      },
      {
        id: 'learning-hub',
        title: 'Learning',
        path: '/learning-hub',
        icon: GraduationCap,
        permission: 'prospect',
        description: 'Training & education'
      }
    ]
  },

  // ==========================================================================
  // 💰 FINANCIAL (3 items - Admin only)
  // ==========================================================================
  {
    id: 'financial-hubs',
    title: 'Financial',
    icon: DollarSign,
    isGroup: true,
    permission: 'admin',
    mobileHidden: true,
    category: 'financial',
    items: [
      {
        id: 'billing-hub',
        title: 'Billing Hub',
        path: '/billing-hub',
        icon: Receipt,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Invoices, payments, subscriptions'
      },
      {
        id: 'revenue-hub',
        title: 'Revenue',
        path: '/revenue-hub',
        icon: DollarSign,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Revenue tracking & forecasting'
      },
      {
        id: 'compliance-hub',
        title: 'Compliance',
        path: '/compliance-hub',
        icon: Shield,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Regulatory compliance'
      }
    ]
  },

  // ==========================================================================
  // 🤖 INTELLIGENCE (4 items)
  // ==========================================================================
  {
    id: 'intelligence-hubs',
    title: 'Intelligence',
    icon: Brain,
    isGroup: true,
    permission: 'user',
    mobileHidden: true,
    category: 'intelligence',
    items: [
      {
        id: 'ai-hub',
        title: 'AI Hub',
        path: '/ai-hub',
        icon: Brain,
        permission: 'user',
        badge: 'AI',
        description: 'AI-powered tools & insights'
      },
      {
        id: 'analytics-hub',
        title: 'Analytics',
        path: '/analytics-hub',
        icon: BarChart,
        permission: 'user',
        badge: 'AI',
        description: 'Business intelligence'
      },
      {
        id: 'reports-hub',
        title: 'Reports',
        path: '/reports-hub',
        icon: FileText,
        permission: 'user',
        description: 'Comprehensive reports'
      },
      {
        id: 'automation-hub',
        title: 'Automation',
        path: '/automation-hub',
        icon: Zap,
        permission: 'user',
        badge: 'PRO',
        description: 'Workflow automation'
      }
    ]
  },

  // ==========================================================================
  // ⚙️ SYSTEM (3 items - Admin only)
  // ==========================================================================
  {
    id: 'system-hubs',
    title: 'System',
    icon: Settings,
    isGroup: true,
    permission: 'admin',
    mobileHidden: true,
    category: 'system',
    items: [
      {
        id: 'settings-hub',
        title: 'Settings',
        path: '/settings-hub',
        icon: Settings,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'System configuration'
      },
      {
        id: 'mobile-app-hub',
        title: 'Mobile Apps',
        path: '/mobile-app-hub',
        icon: Smartphone,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Mobile app management'
      },
      {
        id: 'support-hub',
        title: 'Support',
        path: '/support-hub',
        icon: HelpCircle,
        permission: 'prospect',
        description: 'Help & resources'
      }
    ]
  }
];

// ============================================================================
// MOBILE-SPECIFIC NAVIGATION (Consolidated - Phase 3)
// ============================================================================

/**
 * Get mobile-optimized navigation for specific role
 * Returns simplified menu with only essential hub items
 * All paths now route to consolidated hubs
 */
export function getMobileNavigation(userRole) {
  const baseItems = [
    { id: 'dashboard', title: 'Dashboard', path: '/smart-dashboard', icon: LayoutDashboard },
  ];

  const roleSpecificItems = {
    masterAdmin: [
      { id: 'portal', title: 'Admin', path: '/portal', icon: Crown },
      { id: 'clients-hub', title: 'Clients', path: '/clients-hub', icon: Users },
      { id: 'credit-hub', title: 'Credit', path: '/credit-hub', icon: Shield },
      { id: 'analytics-hub', title: 'Analytics', path: '/analytics-hub', icon: BarChart },
      { id: 'settings-hub', title: 'Settings', path: '/settings-hub', icon: Settings },
    ],
    admin: [
      { id: 'portal', title: 'Admin', path: '/portal', icon: Crown },
      { id: 'clients-hub', title: 'Clients', path: '/clients-hub', icon: Users },
      { id: 'credit-hub', title: 'Credit', path: '/credit-hub', icon: Shield },
      { id: 'reports-hub', title: 'Reports', path: '/reports-hub', icon: FileText },
      { id: 'settings-hub', title: 'Settings', path: '/settings-hub', icon: Settings },
    ],
    manager: [
      { id: 'clients-hub', title: 'Clients', path: '/clients-hub', icon: Users },
      { id: 'credit-hub', title: 'Credit', path: '/credit-hub', icon: Shield },
      { id: 'comms-hub', title: 'Comms', path: '/comms-hub', icon: MessageSquare },
      { id: 'reports-hub', title: 'Reports', path: '/reports-hub', icon: FileText },
      { id: 'tasks-hub', title: 'Tasks', path: '/tasks-hub', icon: Calendar },
    ],
    user: [
      { id: 'clients-hub', title: 'Clients', path: '/clients-hub', icon: Users },
      { id: 'credit-hub', title: 'Credit', path: '/credit-hub', icon: Shield },
      { id: 'tasks-hub', title: 'Tasks', path: '/tasks-hub', icon: Calendar },
      { id: 'comms-hub', title: 'Comms', path: '/comms-hub', icon: MessageSquare },
      { id: 'support-hub', title: 'Support', path: '/support-hub', icon: HelpCircle },
    ],
    client: [
      { id: 'client-portal', title: 'My Portal', path: '/client-portal', icon: User },
      { id: 'credit-hub', title: 'My Credit', path: '/credit-hub', icon: Shield },
      { id: 'dispute-hub', title: 'Disputes', path: '/dispute-hub', icon: AlertCircle },
      { id: 'documents-hub', title: 'Documents', path: '/documents-hub', icon: FolderOpen },
      { id: 'support-hub', title: 'Support', path: '/support-hub', icon: HelpCircle },
    ],
    prospect: [
      { id: 'client-portal', title: 'Portal', path: '/client-portal', icon: User },
      { id: 'learning-hub', title: 'Learn', path: '/learning-hub', icon: GraduationCap },
      { id: 'support-hub', title: 'Support', path: '/support-hub', icon: HelpCircle },
    ],
    affiliate: [
      { id: 'affiliates-hub', title: 'Dashboard', path: '/affiliates-hub', icon: Handshake },
      { id: 'marketing-hub', title: 'Marketing', path: '/marketing-hub', icon: Zap },
      { id: 'support-hub', title: 'Support', path: '/support-hub', icon: HelpCircle },
    ],
    viewer: [
      { id: 'reports-hub', title: 'Reports', path: '/reports-hub', icon: FileText },
      { id: 'analytics-hub', title: 'Analytics', path: '/analytics-hub', icon: BarChart },
    ]
  };

  return [...baseItems, ...(roleSpecificItems[userRole] || roleSpecificItems.client)];
}

// ============================================================================
// ROLE-BASED NAVIGATION FILTER
// ============================================================================

/**
 * Filters navigation items based on user role and permissions
 * @param {Array} items - Navigation items to filter
 * @param {String} userRole - User's role (masterAdmin, admin, user, client, etc.)
 * @param {Boolean} isMobile - Whether user is on mobile device
 * @returns {Array} Filtered navigation items
 */
export function filterNavigationByRole(items, userRole = 'user', isMobile = false) {
  return items
    .map((item) => {
      // Check if user can see this item
      if (!isVisible(item, userRole, isMobile)) return null;

      // If it's a group, filter its children
      if (item.isGroup && Array.isArray(item.items)) {
        const filteredItems = item.items.filter((sub) => isVisible(sub, userRole, isMobile));
        
        // If no children are visible, hide the group
        if (filteredItems.length === 0) return null;
        
        return { ...item, items: filteredItems };
      }

      return { ...item };
    })
    .filter(Boolean); // Remove null items
}

export default navigationItems;