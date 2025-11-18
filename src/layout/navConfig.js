// src/layout/navConfig.js
// ENHANCED NAVIGATION CONFIGURATION - VERSION 3.0
// ROLE-BASED VISIBILITY + MOBILE OPTIMIZATION + ACCORDION SUPPORT
// LAST UPDATED: 2025-11-04 - Phase 2 Complete

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
  MapPin, AlertCircle, Eye, Wrench, Lock, Key, HelpCircle, ExternalLink
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
// NAVIGATION ITEMS - ORGANIZED BY BUSINESS FUNCTION
// ============================================================================

export const navigationItems = [
  // ==========================================================================
  // 🏠 DASHBOARD - ALWAYS VISIBLE AT TOP
  // ==========================================================================
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/dashboard',
    icon: Home,
    permission: 'prospect', // Everyone sees dashboard
    mobileHidden: false,
    description: 'Main overview and analytics',
    category: 'core'
  },

  // ==========================================================================
  // 🏡 HOME - WELCOME/LANDING PAGE
  // ==========================================================================
  {
    id: 'home',
    title: 'Home',
    path: '/home',
    icon: LayoutDashboard,
    permission: 'prospect',
    mobileHidden: false,
    description: 'Welcome page with feature overview',
    category: 'core'
  },

  // ==========================================================================
  // 🎯 ADMIN COMMAND CENTER
  // ==========================================================================
  {
    id: 'admin-portal',
    title: '🎯 Admin Portal',
    path: '/portal',
    icon: LayoutDashboard,
    permission: 'admin',
    mobileHidden: true, // Too complex for mobile
    badge: 'ADMIN',
    description: '6-tab command center for complete system control',
    category: 'admin'
  },

  // ==========================================================================
  // 👤 CLIENT PORTAL
  // ==========================================================================
  {
    id: 'client-portal',
    title: '👤 Client Portal',
    path: '/client-portal',
    icon: User,
    permission: 'client', // Clients and prospects
    mobileHidden: false,
    badge: 'NEW',
    description: 'Client progress dashboard with scores, disputes, payments',
    category: 'client'
  },

  // ==========================================================================
  // 📊 CREDIT REPORTS HUB (Consolidated IDIQ System)
  // ==========================================================================
  {
    id: 'credit-hub',
    title: '📊 Credit Reports Hub',
    path: '/credit-hub',
    icon: Shield,
    permission: 'client',
    mobileHidden: false,
    badge: 'AI',
    description: 'Complete IDIQ credit management system - 7 tools in one hub',
    category: 'credit'
  },
  // ==========================================================================
  // 🎯 12 CORE HUBS - Consolidated Navigation (Phase 3)
  // ==========================================================================

  // 1. DASHBOARD HUB - Main Command Center
  {
    id: 'smart-dashboard',
    title: 'Dashboard',
    path: '/smart-dashboard',
    icon: LayoutDashboard,
    permission: 'user',
    mobileHidden: false,
    description: 'Main command center with analytics',
    category: 'core'
  },

  // 2. CLIENTS HUB - Contact & Client Management
  {
    id: 'clients-hub',
    title: 'Clients Hub',
    path: '/clients-hub',
    icon: Users,
    permission: 'user',
    mobileHidden: false,
    badge: 'AI',
    description: 'Client management & intake',
    category: 'core'
  },

  // 3. DISPUTES HUB - Dispute Management
  {
    id: 'dispute-hub',
    title: 'Disputes Hub',
    path: '/dispute-hub',
    icon: AlertCircle,
    permission: 'user',
    mobileHidden: false,
    description: 'Dispute tracking & letters',
    category: 'core'
  },

  // 4. ANALYTICS HUB - Reports & Insights
  {
    id: 'analytics-hub',
    title: 'Analytics Hub',
    path: '/analytics-hub',
    icon: BarChart,
    permission: 'user',
    mobileHidden: false,
    badge: 'AI',
    description: 'Reports & business intelligence',
    category: 'core'
  },

  // 5. COMMUNICATIONS HUB - Email, SMS, Calls
  {
    id: 'comms-hub',
    title: 'Communications',
    path: '/comms-hub',
    icon: MessageSquare,
    permission: 'user',
    mobileHidden: false,
    badge: 'AI',
    description: 'Email, SMS, campaigns',
    category: 'core'
  },

  // 6. MARKETING HUB - Campaigns & Outreach
  {
    id: 'marketing-hub',
    title: 'Marketing Hub',
    path: '/marketing-hub',
    icon: Zap,
    permission: 'user',
    mobileHidden: false,
    badge: 'AI',
    description: 'Campaigns & outreach',
    category: 'core'
  },

  // 7. BILLING HUB - Invoices & Payments
  {
    id: 'billing-hub',
    title: 'Billing Hub',
    path: '/billing-hub',
    icon: Receipt,
    permission: 'user',
    mobileHidden: false,
    description: 'Invoices & payments',
    category: 'core'
  },

  // 8. LEARNING HUB - Training & Resources
  {
    id: 'learning-hub',
    title: 'Learning Hub',
    path: '/learning-hub',
    icon: GraduationCap,
    permission: 'prospect',
    mobileHidden: false,
    description: 'Training & education',
    category: 'core'
  },

  // 9. AI HUB - AI-Powered Tools
  {
    id: 'ai-hub',
    title: 'AI Hub',
    path: '/ai-hub',
    icon: Brain,
    permission: 'user',
    mobileHidden: false,
    badge: 'AI',
    description: 'AI-powered tools',
    category: 'core'
  },

  // 10. DOCUMENTS HUB - Files & Templates
  {
    id: 'documents-hub',
    title: 'Documents Hub',
    path: '/documents-hub',
    icon: FolderOpen,
    permission: 'user',
    mobileHidden: false,
    description: 'Files & templates',
    category: 'core'
  },

  // 11. SETTINGS HUB - Configuration
  {
    id: 'settings-hub',
    title: 'Settings Hub',
    path: '/settings-hub',
    icon: Settings,
    permission: 'admin',
    mobileHidden: false,
    badge: 'ADMIN',
    description: 'System configuration',
    category: 'core'
  },

  // 12. SUPPORT HUB - Help & Resources
  {
    id: 'support-hub',
    title: 'Support Hub',
    path: '/support-hub',
    icon: HelpCircle,
    permission: 'prospect',
    mobileHidden: false,
    description: 'Help & resources',
    category: 'core'
  },

  // ==========================================================================
  // 📊 CREDIT REPORT WORKFLOW (Admin Only)
  // ==========================================================================
  
  {
    id: 'credit-workflow',
    title: 'Credit Report Workflow',
    path: '/credit-report-workflow',
    icon: Upload,
    permission: 'user', // Employees and up
    mobileHidden: true,
    badge: 'AI',
    description: 'IDIQ API, Manual Entry, PDF Upload',
    category: 'credit'
  },

  // ==========================================================================
  // 🤖 AI REVIEW SYSTEM (Admin Only)
  // ==========================================================================
  {
    id: 'ai-reviews',
    title: 'AI Review Dashboard',
    path: '/admin/ai-reviews',
    icon: Brain,
    permission: 'admin',
    mobileHidden: true,
    badge: 'AI',
    description: 'Review, approve, and send AI-generated credit analysis',
    category: 'ai'
  },
  
  {
    id: 'ai-credit-analysis',
    title: 'AI Credit Engine',
    path: '/credit-analysis',
    icon: Brain,
    permission: 'user',
    mobileHidden: true,
    badge: 'AI',
    description: 'Intelligent credit report analysis',
    category: 'ai'
  },
  
  {
    id: 'predictive-analytics',
    title: 'Predictive Analytics',
    path: '/predictive-analytics',
    icon: Activity,
    permission: 'admin',
    mobileHidden: true,
    badge: 'AI',
    description: 'AI-powered predictions',
    category: 'ai'
  },

  // ==========================================================================
  // ⚙️ ADMIN-ONLY ITEMS (Not in core 12 hubs)
  // ==========================================================================

  // Client Portal (for clients/prospects to access their info)
  {
    id: 'client-portal',
    title: 'My Portal',
    path: '/client-portal',
    icon: User,
    permission: 'client',
    mobileHidden: false,
    description: 'Your progress & scores',
    category: 'client'
  },

  // White Label (Master Admin Only)
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

// ============================================================================
// MOBILE-SPECIFIC NAVIGATION
// ============================================================================

/**
 * Get mobile-optimized navigation for specific role
 * Returns simplified menu with only essential items from 12 core hubs
 */
export function getMobileNavigation(userRole) {
  const baseItems = [
    { id: 'dashboard', title: 'Dashboard', path: '/smart-dashboard', icon: Home },
  ];

  const roleSpecificItems = {
    masterAdmin: [
      { id: 'clients-hub', title: 'Clients', path: '/clients-hub', icon: Users },
      { id: 'dispute-hub', title: 'Disputes', path: '/dispute-hub', icon: AlertCircle },
      { id: 'analytics-hub', title: 'Analytics', path: '/analytics-hub', icon: BarChart },
      { id: 'settings-hub', title: 'Settings', path: '/settings-hub', icon: Settings },
    ],
    admin: [
      { id: 'clients-hub', title: 'Clients', path: '/clients-hub', icon: Users },
      { id: 'dispute-hub', title: 'Disputes', path: '/dispute-hub', icon: AlertCircle },
      { id: 'billing-hub', title: 'Billing', path: '/billing-hub', icon: Receipt },
      { id: 'settings-hub', title: 'Settings', path: '/settings-hub', icon: Settings },
    ],
    manager: [
      { id: 'clients-hub', title: 'Clients', path: '/clients-hub', icon: Users },
      { id: 'dispute-hub', title: 'Disputes', path: '/dispute-hub', icon: AlertCircle },
      { id: 'analytics-hub', title: 'Analytics', path: '/analytics-hub', icon: BarChart },
      { id: 'comms-hub', title: 'Comms', path: '/comms-hub', icon: MessageSquare },
    ],
    user: [
      { id: 'clients-hub', title: 'Clients', path: '/clients-hub', icon: Users },
      { id: 'dispute-hub', title: 'Disputes', path: '/dispute-hub', icon: AlertCircle },
      { id: 'comms-hub', title: 'Comms', path: '/comms-hub', icon: MessageSquare },
      { id: 'documents-hub', title: 'Docs', path: '/documents-hub', icon: FolderOpen },
    ],
    client: [
      { id: 'portal', title: 'My Portal', path: '/client-portal', icon: User },
      { id: 'dispute-hub', title: 'Disputes', path: '/dispute-hub', icon: AlertCircle },
      { id: 'learning-hub', title: 'Learn', path: '/learning-hub', icon: GraduationCap },
      { id: 'support-hub', title: 'Support', path: '/support-hub', icon: HelpCircle },
    ],
    prospect: [
      { id: 'portal', title: 'Portal', path: '/client-portal', icon: User },
      { id: 'learning-hub', title: 'Learn', path: '/learning-hub', icon: GraduationCap },
      { id: 'support-hub', title: 'Support', path: '/support-hub', icon: HelpCircle },
    ],
    affiliate: [
      { id: 'marketing-hub', title: 'Marketing', path: '/marketing-hub', icon: Zap },
      { id: 'billing-hub', title: 'Earnings', path: '/billing-hub', icon: DollarSign },
      { id: 'support-hub', title: 'Support', path: '/support-hub', icon: HelpCircle },
    ],
    viewer: [
      { id: 'analytics-hub', title: 'Analytics', path: '/analytics-hub', icon: BarChart },
      { id: 'support-hub', title: 'Support', path: '/support-hub', icon: HelpCircle },
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