// src/layout/navConfig.js
// ============================================================================
// CONSOLIDATED NAVIGATION CONFIGURATION - VERSION 4.0
// PHASE 3: Hub-Based Navigation (67 items → 24 items)
// LAST UPDATED: December 3, 2025 - Phase 1-3 Implementation
// BACKUP: Previous version saved as navConfig.js.backup
// ============================================================================

import {
  // ===== CORE =====
  Home, LayoutDashboard, Settings, Database,

  // ===== PEOPLE & ORGANIZATION =====
  Users, User, UserPlus, UserCheck, Building, Building2, Globe, Handshake, Crown,

  // ===== DOCUMENTS & DATA =====
  FileText, FileSpreadsheet, Archive, CheckSquare, Package, Download, Upload,
  FolderOpen, File, FilePlus, Layers,

  // ===== COMMUNICATION =====
  MessageSquare, Mail, Phone, Bell, Zap, Calendar, Send, Inbox,

  // ===== CREDIT & FINANCE =====
  CreditCard, TrendingUp, Calculator, GitBranch, List, DollarSign, Wallet,
  Receipt, PieChart, BarChart, Target, Shield,

  // ===== AI & ANALYTICS =====
  Brain, Sparkles, Activity, LineChart, BarChart3, PieChart as PieChartIcon,

  // ===== LEARNING & ACHIEVEMENT =====
  GraduationCap, BookOpen, Award, Trophy, Star,

  // ===== MOBILE & WHITE LABEL =====
  Smartphone, Palette, Brush, Info,

  // ===== MISC =====
  MapPin, AlertCircle, Eye, Wrench, Lock, Key, HelpCircle, ExternalLink, RefreshCw, PiggyBank
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
  affiliate: {
    level: 4,
    label: 'Affiliate Partner',
    description: 'Referral partner',
    icon: Handshake,
    color: 'cyan'
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
// NAVIGATION ITEMS - CLEAN, DEDUPLICATED, VALID STRUCTURE
// ============================================================================
export const navigationItems = [
  {
    id: 'smart-dashboard',
    title: 'Smart Dashboard',
    path: '/smart-dashboard',
    icon: Sparkles,
    permission: 'prospect',
    mobileHidden: false,
    badge: 'AI',
    description: 'Intelligent role-adaptive dashboard with AI insights',
    category: 'core'
  },
  {
    id: 'hubs-group',
    title: '🎯 Business Hubs',
    icon: LayoutDashboard,
    isGroup: true,
    permission: 'user',
    mobileHidden: false,
    category: 'hubs',
    defaultExpanded: false,
    items: [
      {
        id: 'clients-pipeline-hub',
        title: 'Clients & Pipeline',
        path: '/clients-hub',
        icon: Users,
        permission: 'user',
        badge: 'AI',
        description: 'Complete client & contact management'
      },
      {
        id: 'credit-hub',
        title: 'Credit Intelligence Hub',
        path: '/credit-hub',
        icon: Shield,
        permission: 'user',
        badge: 'AI',
        description: 'Complete IDIQ + AI credit analysis'
      },
      {
        id: 'dispute-management-hub',
        title: 'Dispute Management',
        path: '/dispute-hub',
        icon: AlertCircle,
        permission: 'user',
        badge: 'AI',
        description: 'Dispute tracking, letter generation, admin panel, status monitoring'
      },
      {
        id: 'communications-hub',
        title: 'Communications',
        path: '/comms-hub',
        icon: MessageSquare,
        permission: 'user',
        badge: 'AI',
        description: 'Email, SMS, drip campaigns, call logs, templates'
      },
      {
        id: 'documents-contracts-hub',
        title: 'Documents & Contracts',
        path: '/documents-hub',
        icon: FolderOpen,
        permission: 'user',
        description: 'Document management, forms, templates, e-contracts, agreements'
      },
      {
        id: 'tasks-productivity-hub',
        title: 'Tasks & Productivity',
        path: '/tasks-hub',
        icon: Calendar,
        permission: 'user',
        badge: 'AI',
        description: 'Calendar, tasks, scheduling, reminders, goals, team management'
      },
      {
        id: 'automation-hub',
        title: 'Automation',
        path: '/automation-hub',
        icon: Zap,
        permission: 'user',
        badge: 'AI',
        description: 'Workflows, triggers, automations'
      },
      {
        id: 'analytics-hub',
        title: 'Analytics',
        path: '/analytics-hub',
        icon: BarChart,
        permission: 'user',
        badge: 'AI',
        description: 'Reports, dashboards, insights'
      },
      {
        id: 'learning-hub',
        title: 'Learning & Resources',
        path: '/learning-hub',
        icon: GraduationCap,
        permission: 'user',
        description: 'Courses, guides, knowledge base'
      },
      {
        id: 'support-hub',
        title: 'Support',
        path: '/support-hub',
        icon: HelpCircle,
        permission: 'user',
        description: 'Support tickets, help center'
      },
      {
        id: 'financial-planning-hub',
        title: 'Financial Planning',
        path: '/financial-planning-hub',
        icon: PiggyBank,
        permission: 'user',
        badge: 'AI',
        description: 'Debt reduction & budget planning'
      },
      {
        id: 'tradeline-hub',
        title: 'Tradeline Services',
        path: '/tradeline-hub',
        icon: Award,
        permission: 'manager',
        badge: 'AI',
        description: 'Tradeline rental management'
      },
      {
        id: 'revenue-hub',
        title: 'Revenue Hub',
        path: '/revenue-hub',
        icon: DollarSign,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Revenue tracking and forecasting'
      },
      {
        id: 'billing-hub',
        title: 'Billing & Payments',
        path: '/billing-hub',
        icon: Receipt,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Invoices, payments, subscriptions'
      },
      {
        id: 'collections-hub',
        title: 'Collections & AR',
        path: '/collections-hub',
        icon: DollarSign,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Accounts receivable management'
      },
      {
        id: 'payment-integration-hub',
        title: 'Payment Integrations',
        path: '/payment-integration-hub',
        icon: CreditCard,
        permission: 'admin',
        badge: 'PRO',
        description: 'Stripe & PayPal integration'
      },
      {
        id: 'contracts-hub',
        title: 'Contract Management',
        path: '/contracts-hub',
        icon: FileText,
        permission: 'user',
        description: 'Contract lifecycle management'
      },
      {
        id: 'bureau-hub',
        title: 'Bureau Communication',
        path: '/bureau-hub',
        icon: Send,
        permission: 'user',
        description: 'Credit bureau integration'
      },
      {
        id: 'dispute-admin',
        title: 'Dispute Admin Panel',
        path: '/dispute-admin',
        icon: Shield,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Admin dispute management'
      },
      {
        id: 'compliance-hub',
        title: 'Compliance Hub',
        path: '/compliance-hub',
        icon: Shield,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Regulatory compliance'
      }
    ]
  },
  {
    id: 'admin-group',
    title: 'Administration',
    icon: Settings,
    isGroup: true,
    permission: 'user',
    mobileHidden: true,
    category: 'admin',
    items: [
      {
        id: 'support',
        title: 'Support',
        path: '/support',
        icon: HelpCircle,
        permission: 'prospect',
        mobileHidden: false,
        description: 'Get help'
      },
      {
        id: 'system-map',
        title: 'System Map',
        path: '/system-map',
        icon: Database,
        permission: 'admin',
        mobileHidden: true,
        description: 'View system architecture'
      }
    ]
  },
  {
    id: 'white-label-group',
    title: 'White Label',
    icon: Palette,
    isGroup: true,
    permission: 'masterAdmin',
    mobileHidden: true,
    category: 'whitelabel',
    items: [
      {
        id: 'wl-branding',
        title: 'Branding',
        path: '/whitelabel/branding',
        icon: Brush,
        permission: 'masterAdmin',
        mobileHidden: true,
        description: 'Customize branding'
      },
      {
        id: 'wl-domains',
        title: 'Domains',
        path: '/whitelabel/domains',
        icon: Globe,
        permission: 'masterAdmin',
        mobileHidden: true,
        description: 'Manage domains'
      },
      {
        id: 'wl-plans',
        title: 'Plans & Billing',
        path: '/whitelabel/plans',
        icon: CreditCard,
        permission: 'masterAdmin',
        mobileHidden: true,
        description: 'Subscription plans'
      },
      {
        id: 'wl-tenants',
        title: 'Tenants',
        path: '/whitelabel/tenants',
        icon: Building2,
        permission: 'masterAdmin',
        mobileHidden: true,
        description: 'Multi-tenant management'
      }
    ]
  }
];
// End of navigationItems export. All code below this line was removed to ensure only one valid export and no orphaned fragments remain.

// ============================================================================
// NAVIGATION FILTERING
// ============================================================================

/**
 * Filter navigation items based on user role and device
 */
export function filterNavigationByRole(items, userRole, isMobile = false) {
  return items
    .filter(item => isVisible(item, userRole, isMobile))
    .map(item => {
      if (item.items) {
        return {
          ...item,
          items: filterNavigationByRole(item.items, userRole, isMobile)
        };
      }
      return item;
    })
    .filter(item => !item.items || item.items.length > 0);
}

/**
 * Get all navigation items (flat)
 */
export function getAllNavigationItems(items = navigationItems) {
  const flat = [];
  items.forEach(item => {
    flat.push(item);
    if (item.items) {
      flat.push(...getAllNavigationItems(item.items));
    }
  });
  return flat;
}

/**
 * Find navigation item by ID
 */
export function findNavigationItem(id, items = navigationItems) {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.items) {
      const found = findNavigationItem(id, item.items);
      if (found) return found;
    }
  }
  return null;
}

// ============================================================================
// MOBILE-SPECIFIC NAVIGATION
// ============================================================================

/**
 * Get mobile-optimized navigation for specific role
 * Returns simplified menu with only essential items
 */
export function getMobileNavigation(userRole) {
  const baseItems = [
    { id: 'dashboard', title: 'Dashboard', path: '/smart-dashboard', icon: LayoutDashboard },
  ];

  const roleSpecificItems = {
    masterAdmin: [
      { id: 'portal', title: 'Admin', path: '/portal', icon: LayoutDashboard },
      { id: 'contacts', title: 'Contacts', path: '/clients-hub', icon: Users },
      { id: 'credit-hub', title: 'Credit Hub', path: '/credit-hub', icon: Shield },
      { id: 'analytics-reporting', title: 'Analytics & Reporting', path: '/analytics-reporting-hub', icon: BarChart },
      { id: 'settings', title: 'Settings', path: '/settings', icon: Settings },
    ],
    admin: [
      { id: 'portal', title: 'Admin', path: '/portal', icon: LayoutDashboard },
      { id: 'contacts', title: 'Contacts', path: '/clients-hub', icon: Users },
      { id: 'credit-hub', title: 'Credit Hub', path: '/credit-hub', icon: Shield },
      { id: 'analytics-reporting', title: 'Analytics & Reporting', path: '/analytics-reporting-hub', icon: BarChart },
      { id: 'settings', title: 'Settings', path: '/settings', icon: Settings },
    ],
    manager: [
      { id: 'contacts', title: 'Contacts', path: '/clients-hub', icon: Users },
      { id: 'credit-hub', title: 'Credit Hub', path: '/credit-hub', icon: Shield },
      { id: 'pipeline', title: 'Pipeline', path: '/clients-hub', icon: GitBranch },
      { id: 'analytics-reporting', title: 'Analytics & Reporting', path: '/analytics-reporting-hub', icon: BarChart },
      { id: 'settings', title: 'Settings', path: '/settings', icon: Settings },
    ],
    user: [
      { id: 'contacts', title: 'Contacts', path: '/clients-hub', icon: Users },
      { id: 'credit-hub', title: 'Credit Hub', path: '/credit-hub', icon: Shield },
      { id: 'tasks', title: 'Tasks', path: '/tasks-hub', icon: CheckSquare },
      { id: 'calendar', title: 'Calendar', path: '/calendar-hub', icon: Calendar },
      { id: 'settings', title: 'Settings', path: '/settings', icon: Settings },
    ],
    client: [
      { id: 'portal', title: 'My Portal', path: '/client-portal', icon: User },
      { id: 'credit-hub', title: 'My Credit', path: '/credit-hub', icon: Shield },
      { id: 'scores', title: 'Scores', path: '/dispute-hub', icon: TrendingUp },
      { id: 'disputes', title: 'Disputes', path: '/dispute-hub', icon: FileText },
      { id: 'documents', title: 'Documents', path: '/documents-hub', icon: FileText },
      { id: 'support', title: 'Support', path: '/support-hub', icon: HelpCircle },
    ],
    prospect: [
      { id: 'portal', title: 'Portal', path: '/client-portal', icon: User },
      { id: 'learning', title: 'Learn', path: '/learning-hub', icon: BookOpen },
      { id: 'resources', title: 'Resources', path: '/resources-hub', icon: FileText },
      { id: 'support', title: 'Support', path: '/support-hub', icon: HelpCircle },
    ],
    affiliate: [
      { id: 'dashboard', title: 'Dashboard', path: '/affiliates', icon: Handshake },
      { id: 'referrals', title: 'Referrals', path: '/affiliates', icon: Users },
      { id: 'commissions', title: 'Earnings', path: '/affiliates', icon: DollarSign },
      { id: 'settings', title: 'Settings', path: '/settings', icon: Settings },
    ],
    viewer: [
      { id: 'analytics-reporting', title: 'Analytics & Reporting', path: '/analytics-reporting-hub', icon: BarChart },
    ]
  };

  return [...baseItems, ...(roleSpecificItems[userRole] || roleSpecificItems.client)];
}

export default {
  navigationItems,
  ROLE_HIERARCHY,
  ROLES,
  hasPermission,
  isVisible,
  filterNavigationByRole,
  getAllNavigationItems,
  findNavigationItem,
  getMobileNavigation
};
