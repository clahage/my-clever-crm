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
// ============================================================================
// GET ROLE LEVEL (handles all formats)
// ============================================================================
export function getRoleLevel(role) {
  if (typeof role === 'number') return role;
  if (!role) return 1;
  // Normalize: lowercase, remove separators, typo-tolerant
  const normalized = String(role).toLowerCase().replace(/[^a-z]/g, '');
  // Typo-tolerant matching for all roles
  if (/^(masteradmin|masteradministrator|superadmin|superadministrator|owner|amsteradmin|mastadmin|mstradmin|mastadministrator)$/.test(normalized)) return 8;
  if (/^(admin|administrator|admn|admmin)$/.test(normalized)) return 7;
  if (/^(manager|manger|managr|maneger)$/.test(normalized)) return 6;
  if (/^(user|employee|usr|emplyee|employe)$/.test(normalized)) return 5;
  if (/^(affiliate|affliate|afiliate|affilliate|affiliat)$/.test(normalized)) return 4;
  if (/^(client|clinet|cliant|clent)$/.test(normalized)) return 3;
  if (/^(prospect|prospct|prospekt|prospt)$/.test(normalized)) return 2;
  if (/^(viewer|vewer|viwer|viewr)$/.test(normalized)) return 1;
  // Fallback to ROLE_HIERARCHY mapping
  return ROLE_HIERARCHY[role] || 1;
}

// ============================================================================
// COMPREHENSIVE MOBILE NAVIGATION FUNCTION
// ============================================================================
export function getMobileNavigation(userRole) {
  const roleLevel = getRoleLevel(userRole);
  // Filter navigation items for mobile
  const filtered = filterNavigationByRole(navigationItems, userRole, true);

  // Role-specific quick access shortcuts
  const shortcuts = {
    masterAdmin: [
      { id: 'dashboard', title: 'Dashboard', path: '/smart-dashboard', icon: LayoutDashboard },
      { id: 'contacts', title: 'Contacts', path: '/contacts', icon: Users },
      { id: 'credit-hub', title: 'Credit Hub', path: '/credit-hub', icon: Shield },
      { id: 'disputes', title: 'Disputes', path: '/dispute-letters', icon: AlertCircle },
      { id: 'analytics', title: 'Analytics', path: '/analytics', icon: BarChart },
      { id: 'settings', title: 'Settings', path: '/settings', icon: Settings },
    ],
    admin: [
      { id: 'dashboard', title: 'Dashboard', path: '/smart-dashboard', icon: LayoutDashboard },
      { id: 'contacts', title: 'Contacts', path: '/contacts', icon: Users },
      { id: 'credit-hub', title: 'Credit Hub', path: '/credit-hub', icon: Shield },
      { id: 'disputes', title: 'Disputes', path: '/dispute-letters', icon: AlertCircle },
      { id: 'analytics', title: 'Analytics', path: '/analytics', icon: BarChart },
      { id: 'settings', title: 'Settings', path: '/settings', icon: Settings },
    ],
    manager: [
      { id: 'dashboard', title: 'Dashboard', path: '/smart-dashboard', icon: LayoutDashboard },
      { id: 'contacts', title: 'Contacts', path: '/contacts', icon: Users },
      { id: 'credit-hub', title: 'Credit Hub', path: '/credit-hub', icon: Shield },
      { id: 'analytics', title: 'Analytics', path: '/analytics', icon: BarChart },
      { id: 'tasks', title: 'Tasks', path: '/tasks', icon: CheckSquare },
    ],
    user: [
      { id: 'dashboard', title: 'Dashboard', path: '/smart-dashboard', icon: LayoutDashboard },
      { id: 'contacts', title: 'Contacts', path: '/contacts', icon: Users },
      { id: 'credit-hub', title: 'Credit Hub', path: '/credit-hub', icon: Shield },
      { id: 'tasks', title: 'Tasks', path: '/tasks', icon: CheckSquare },
      { id: 'calendar', title: 'Calendar', path: '/calendar', icon: Calendar },
    ],
    affiliate: [
      { id: 'dashboard', title: 'Affiliates Hub', path: '/affiliates', icon: Handshake },
      { id: 'referrals', title: 'Referrals', path: '/affiliates', icon: Users },
      { id: 'commissions', title: 'Earnings', path: '/affiliates', icon: DollarSign },
      { id: 'resources', title: 'Resources', path: '/resources/articles', icon: FileText },
    ],
    client: [
      { id: 'portal', title: 'My Portal', path: '/client-portal', icon: User },
      { id: 'credit-hub', title: 'My Credit', path: '/credit-hub', icon: Shield },
      { id: 'progress', title: 'Progress', path: '/progress-portal-hub', icon: TrendingUp },
      { id: 'disputes', title: 'Disputes', path: '/dispute-letters', icon: FileText },
      { id: 'documents', title: 'Documents', path: '/documents', icon: FileText },
      { id: 'support', title: 'Support', path: '/support', icon: HelpCircle },
    ],
    prospect: [
      { id: 'portal', title: 'Portal', path: '/client-portal', icon: User },
      { id: 'learning', title: 'Learn', path: '/learning-center', icon: BookOpen },
      { id: 'resources', title: 'Resources', path: '/resources/articles', icon: FileText },
      { id: 'support', title: 'Support', path: '/support', icon: HelpCircle },
    ],
    viewer: [
      { id: 'analytics', title: 'Analytics', path: '/analytics', icon: BarChart },
      { id: 'support', title: 'Support', path: '/support', icon: HelpCircle },
    ]
  };

  // Determine normalized role string
  let normalizedRole = 'viewer';
  for (const key of Object.keys(ROLE_HIERARCHY)) {
    if (getRoleLevel(key) === roleLevel) {
      normalizedRole = key;
      break;
    }
  }

  // Compose mobile navigation: quick access shortcuts + filtered nav
  return {
    shortcuts: shortcuts[normalizedRole] || [],
    nav: filtered
  };
}
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
  // 🏠 DASHBOARD - ANALYTICS & METRICS (SmartDashboard)
  // ==========================================================================
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/smart-dashboard',
    icon: LayoutDashboard,
    permission: 'prospect', // Everyone sees dashboard
    mobileHidden: false,
    description: 'Analytics, metrics, and role-based widgets',
    category: 'core'
  },

  // ==========================================================================
  // 🏡 HOME - WELCOME HUB / LANDING PAGE
  // ==========================================================================
  {
    id: 'home',
    title: 'Welcome Hub',
    path: '/home',
    icon: Home,
    permission: 'prospect',
    mobileHidden: false,
    description: 'Welcome page, feature overview, and getting started guide',
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

  // ...existing code...
  // ==========================================================================
  // 🎯 HYBRID HUBS - ALL 41 BUSINESS HUBS ORGANIZED
  // ==========================================================================
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
      // CORE OPERATIONS (9 hubs - Dashboard Hub consolidated into SmartDashboard)
      {
        id: 'clients-hub',
        title: 'Clients Hub',
        path: '/clients-hub',
        icon: Users,
        permission: 'user',
        badge: 'AI',
        description: 'Complete client management'
      },
      // BUSINESS GROWTH (9 hubs)
      {
        id: 'marketing-hub',
        title: 'Marketing Hub',
        path: '/marketing-hub',
        icon: Zap,
        permission: 'user',
        badge: 'AI',
        description: 'Campaigns and marketing tools'
      },
      {
        id: 'affiliates-hub',
        title: 'Affiliates Hub',
        path: '/affiliates-hub',
        icon: Handshake,
        permission: 'user',
        description: 'Affiliate management'
      },
      {
        id: 'referral-engine-hub',
        title: 'Referral Engine',
        path: '/referral-engine-hub',
        icon: Users,
        permission: 'user',
        badge: 'PRO',
        description: 'Referral tracking and rewards'
      },
      {
        id: 'referral-partner-hub',
        title: 'Referral Partners',
        path: '/referral-partner-hub',
        icon: Handshake,
        permission: 'user',
        description: 'Partner relationship management'
      },
      {
        id: 'social-media-hub',
        title: 'Social Media Hub',
        path: '/social-media-hub',
        icon: Globe,
        permission: 'user',
        description: 'Social media management'
      },
      {
        id: 'content-seo-hub',
        title: 'Content & SEO',
        path: '/content-seo-hub',
        icon: FileText,
        permission: 'user',
        badge: 'AI',
        description: 'Content creation and SEO'
      },
      {
        id: 'website-hub',
        title: 'Website Builder',
        path: '/website-hub',
        icon: Globe,
        permission: 'admin',
        badge: 'PRO',
        description: 'Website and landing pages'
      },
      {
        id: 'reviews-hub',
        title: 'Reviews & Reputation',
        path: '/reviews-hub',
        icon: Star,
        permission: 'user',
        description: 'Reputation management'
      },
      {
        id: 'revenue-partnerships-hub',
        title: 'Revenue Partnerships',
        path: '/revenue-partnerships-hub',
        icon: DollarSign,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Partnership revenue tracking'
      },

      // FINANCIAL (6 hubs)
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
        title: 'Billing Hub',
        path: '/billing-hub',
        icon: Receipt,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Invoices, payments, subscriptions & revenue'
      },
     {
       id: 'payment-integration-hub',
       title: 'Payment Integrations',
       path: '/payment-integration-hub',
       icon: 'CreditCard',
       requiredRole: 'admin',
       badge: 'PRO',
       description: 'Stripe & PayPal integration'
  },
      {
        id: 'payment-hub',
        title: 'Payment Integration',
        path: '/payment-hub',
        icon: CreditCard,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Payment processing'
      },
      {
        id: 'collections-hub',
        title: 'Collections & AR',
        path: '/collections-hub',
        icon: DollarSign,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Collections management'
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
        id: 'compliance-hub',
        title: 'Compliance Hub',
        path: '/compliance-hub',
        icon: Shield,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Regulatory compliance'
      },

      // ADVANCED (10 hubs)
      {
        id: 'ai-hub',
        title: 'AI Hub',
        path: '/ai-hub',
        icon: Brain,
        permission: 'user',
        badge: 'AI',
        description: 'AI-powered tools and insights'
      },
      {
        id: 'analytics-hub',
        title: 'Analytics Hub',
        path: '/analytics-hub',
        icon: BarChart,
        permission: 'user',
        badge: 'AI',
        description: 'Business intelligence'
      },
      {
        id: 'reports-hub',
        title: 'Reports Hub',
        path: '/reports-hub',
        icon: FileText,
        permission: 'user',
        description: 'Comprehensive reports'
      },
      {
        id: 'automation-hub',
        title: 'Automation Hub',
        path: '/automation-hub',
        icon: Zap,
        permission: 'user',
        badge: 'PRO',
        description: 'Workflow automation'
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
        id: 'mobile-app-hub',
        title: 'Mobile App Hub',
        path: '/mobile-app-hub',
        icon: Smartphone,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Mobile app management'
      },
      {
        id: 'learning-hub',
        title: 'Learning Hub',
        path: '/learning-hub',
        icon: GraduationCap,
        permission: 'user',
        description: 'Training and education'
      },
      {
        id: 'training-hub',
        title: 'Training Hub',
        path: '/training-hub',
        icon: BookOpen,
        permission: 'user',
        description: 'Team training programs'
      },
      {
        id: 'resources-hub',
        title: 'Resource Library',
        path: '/resources-hub',
        icon: Archive,
        permission: 'user',
        description: 'Knowledge base and resources'
      },
      {
        id: 'drip-campaigns-hub',
        title: 'Drip Campaigns',
        path: '/drip-campaigns-hub',
        icon: Send,
        permission: 'user',
        badge: 'AI',
        description: 'Automated email sequences'
      },

      // CLIENT-FACING (3 hubs)
      {
        id: 'onboarding-hub',
        title: 'Onboarding Hub',
        path: '/onboarding-hub',
        icon: UserPlus,
        permission: 'user',
        description: 'Client onboarding workflows'
      },
      {
        id: 'progress-portal-hub',
        title: 'Progress Portal',
        path: '/progress-portal-hub',
        icon: TrendingUp,
        permission: 'client',
        description: 'Client progress tracking'
      },
      {
        id: 'client-success-hub',
        title: 'Client Success',
        path: '/client-success-hub',
        icon: Award,
        permission: 'manager',
        description: 'Client retention and success'
      },

      // NEW ENTERPRISE AI HUBS (November 2025) - Credit & Financial Services
      {
        id: 'rental-boost-hub',
        title: 'Rental Boost',
        path: '/rental-boost-hub',
        icon: Home,
        permission: 'client',
        badge: 'AI',
        description: 'AI-powered rental application preparation'
      },
      {
        id: 'mortgage-readiness-hub',
        title: 'Mortgage Ready',
        path: '/mortgage-readiness-hub',
        icon: Building2,
        permission: 'client',
        badge: 'AI',
        description: '90-day mortgage preparation accelerator'
      },
      {
        id: 'auto-loan-hub',
        title: 'Auto Loans',
        path: '/auto-loan-hub',
        icon: Building2,
        permission: 'client',
        badge: 'AI',
        description: 'AI-powered auto loan concierge service'
      },
      {
        id: 'credit-emergency-hub',
        title: 'Credit Emergency',
        path: '/credit-emergency-hub',
        icon: AlertCircle,
        permission: 'client',
        badge: 'URGENT',
        description: '7-14 day rapid credit repair sprints'
      },

      // NEW ENTERPRISE AI HUBS (November 2025) - Business Expansion
      {
        id: 'attorney-network-hub',
        title: 'Attorney Network',
        path: '/attorney-network-hub',
        icon: Shield,
        permission: 'client',
        badge: 'LEGAL',
        description: 'FCRA/FDCPA violation cases and attorney matching'
      },
      {
        id: 'certification-academy-hub',
        title: 'Certification Academy',
        path: '/certification-academy-hub',
        icon: GraduationCap,
        permission: 'client',
        badge: 'AI',
        description: 'Credit repair professional certification training'
      },

      // ADMIN ONLY (2 hubs)
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
        id: 'certification-hub',
        title: 'Certification System',
        path: '/certification-hub',
        icon: Award,
        permission: 'user',
        description: 'Certification and accreditation'
      }
    ]
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
  // 👥 CONTACT MANAGEMENT
  // ==========================================================================
  {
    id: 'contacts-group',
    title: 'Contact Management',
    icon: Users,
    isGroup: true,
    permission: 'user',
    mobileHidden: false,
    category: 'contacts',
    items: [
      { 
        id: 'contacts', 
        title: 'All Contacts', 
        path: '/contacts', 
        icon: Users, 
        permission: 'user',
        mobileHidden: false,
        description: 'View and manage all contacts'
      },
      { 
        id: 'client-intake', 
        title: 'Client Intake', 
        path: '/client-intake', 
        icon: UserPlus, 
        permission: 'user',
        mobileHidden: true,
        description: 'Add new client'
      },
      { 
        id: 'pipeline', 
        title: 'Sales Pipeline', 
        path: '/pipeline', 
        icon: GitBranch, 
        permission: 'user',
        mobileHidden: true,
        description: 'Sales funnel'
      },
      { 
        id: 'import-contacts', 
        title: 'Import Contacts', 
        path: '/import-contacts', 
        icon: Upload, 
        permission: 'user',
        mobileHidden: true,
        description: 'Bulk import'
      },
      { 
        id: 'export-contacts', 
        title: 'Export Contacts', 
        path: '/export-contacts', 
        icon: Download, 
        permission: 'user',
        mobileHidden: true,
        description: 'Bulk export'
      },
      { 
        id: 'contact-reports', 
        title: 'Contact Reports', 
        path: '/contact-reports', 
        icon: FileText, 
        permission: 'user',
        mobileHidden: true,
        description: 'Contact analytics'
      },
      { 
        id: 'segments', 
        title: 'Segments', 
        path: '/segments', 
        icon: Target, 
        permission: 'user',
        mobileHidden: true,
        description: 'Contact segmentation'
      }
    ]
  },

  // ==========================================================================
  // 💳 CREDIT MANAGEMENT
  // ==========================================================================
  {
    id: 'credit-group',
    title: 'Credit Management',
    icon: CreditCard,
    isGroup: true,
    permission: 'client',
    mobileHidden: false,
    category: 'credit',
    items: [
      {
        id: 'credit-hub',
        title: 'Credit Hub',
        path: '/credit-hub',
        icon: Shield,
        permission: 'client',
        mobileHidden: false,
        badge: 'AI',
        description: 'Unified credit management: intake, simulation, history, reports, business credit, monitoring',
      }
    ]
  },

  // ==========================================================================
  // 📨 COMMUNICATIONS
  // ==========================================================================
  {
    id: 'comms-group',
    title: 'Communications',
    icon: MessageSquare,
    isGroup: true,
    permission: 'user',
    mobileHidden: true,
    category: 'comms',
    items: [
      {
        id: 'communication-hub',
        title: 'Communication Hub',
        path: '/communication-hub',
        icon: MessageSquare,
        permission: 'user',
        mobileHidden: false,
        badge: 'AI',
        description: 'Unified communications: center, messages, email, SMS, drip, templates, call logs, notifications',
      }
    ]
  },

  // ==========================================================================
  // 🎓 LEARNING & RESOURCES
  // ==========================================================================
  {
    id: 'learning-group',
    title: 'Learning & Resources',
    icon: GraduationCap,
    isGroup: true,
    permission: 'prospect',
    mobileHidden: false,
    category: 'learning',
    items: [
      { 
        id: 'learning-center', 
        title: 'Learning Center', 
        path: '/learning-center', 
        icon: BookOpen, 
        permission: 'prospect',
        mobileHidden: false,
        description: 'Educational content'
      },
      { 
        id: 'achievements', 
        title: 'Achievements', 
        path: '/achievements', 
        icon: Trophy, 
        permission: 'client',
        mobileHidden: false,
        description: 'Your progress'
      },
      { 
        id: 'certificates', 
        title: 'Certificates', 
        path: '/certificates', 
        icon: Award, 
        permission: 'client',
        mobileHidden: false,
        description: 'Earned certificates'
      }
    ]
  },

  // ==========================================================================
  // 📄 DOCUMENTS & FORMS
  // ==========================================================================
  {
    id: 'docs-group',
    title: 'Documents & Forms',
    icon: FileText,
    isGroup: true,
    permission: 'user',
    mobileHidden: true,
    category: 'docs',
    items: [
      { 
        id: 'document-center', 
        title: 'Document Center', 
        path: '/document-center', 
        icon: FolderOpen, 
        permission: 'user',
        mobileHidden: true,
        badge: 'NEW',
        description: 'All documents'
      },
      { 
        id: 'documents', 
        title: 'My Documents', 
        path: '/documents', 
        icon: FileText, 
        permission: 'client',
        mobileHidden: false,
        description: 'Your documents'
      },
      { 
        id: 'e-contracts', 
        title: 'E-Contracts', 
        path: '/e-contracts', 
        icon: FileSpreadsheet, 
        permission: 'user',
        mobileHidden: true,
        description: 'Electronic contracts'
      },
      { 
        id: 'forms', 
        title: 'Forms Library', 
        path: '/forms', 
        icon: FilePlus, 
        permission: 'user',
        mobileHidden: true,
        description: 'Form templates'
      },
      { 
        id: 'full-agreement', 
        title: 'Full Agreement', 
        path: '/full-agreement', 
        icon: FileText, 
        permission: 'user',
        mobileHidden: true,
        description: 'Service agreement'
      },
      { 
        id: 'information-sheet', 
        title: 'Information Sheet', 
        path: '/information-sheet', 
        icon: File, 
        permission: 'user',
        mobileHidden: true,
        description: 'Client info form'
      },
      { 
        id: 'poa', 
        title: 'Power of Attorney', 
        path: '/power-of-attorney', 
        icon: FileText, 
        permission: 'user',
        mobileHidden: true,
        description: 'POA document'
      },
      { 
        id: 'ach-auth', 
        title: 'ACH Authorization', 
        path: '/ach-authorization', 
        icon: CreditCard, 
        permission: 'user',
        mobileHidden: true,
        description: 'Payment authorization'
      },
      { 
        id: 'addendums', 
        title: 'Addendums', 
        path: '/addendums', 
        icon: FilePlus, 
        permission: 'user',
        mobileHidden: true,
        description: 'Contract addendums'
      },
      { 
        id: 'document-storage', 
        title: 'Document Storage', 
        path: '/document-storage', 
        icon: Archive, 
        permission: 'user',
        mobileHidden: true,
        description: 'File storage'
      }
    ]
  },

  // ==========================================================================
  // 🏢 BUSINESS MANAGEMENT
  // ==========================================================================
  {
    id: 'business-group',
    title: 'Business Management',
    icon: Building,
    isGroup: true,
    permission: 'user',
    mobileHidden: true,
    category: 'business',
    items: [
      { 
        id: 'companies', 
        title: 'Companies', 
        path: '/companies', 
        icon: Building2, 
        permission: 'user',
        mobileHidden: true,
        description: 'Manage companies'
      },
      { 
        id: 'locations', 
        title: 'Locations', 
        path: '/locations', 
        icon: MapPin, 
        permission: 'user',
        mobileHidden: true,
        description: 'Office locations'
      },
      {
        id: 'affiliates',
        title: 'Affiliates',
        path: '/affiliates',
        icon: Handshake,
        permission: 'user',
        mobileHidden: true,
        description: 'Partner program'
      }
    ]
  },

  // ==========================================================================
  // 📅 SCHEDULING & TASKS
  // ==========================================================================
  {
    id: 'schedule-group',
    title: 'Scheduling & Tasks',
    icon: Calendar,
    isGroup: true,
    permission: 'user',
    mobileHidden: false,
    category: 'schedule',
    items: [
      { 
        id: 'calendar', 
        title: 'Calendar', 
        path: '/calendar', 
        icon: Calendar, 
        permission: 'user',
        mobileHidden: false,
        description: 'Schedule management'
      },
      { 
        id: 'appointments', 
        title: 'Appointments', 
        path: '/appointments', 
        icon: Calendar, 
        permission: 'user',
        mobileHidden: false,
        description: 'Book appointments'
      },
      { 
        id: 'tasks', 
        title: 'Tasks', 
        path: '/tasks', 
        icon: CheckSquare, 
        permission: 'user',
        mobileHidden: false,
        description: 'Task management'
      },
      { 
        id: 'reminders', 
        title: 'Reminders', 
        path: '/reminders', 
        icon: Bell, 
        permission: 'user',
        mobileHidden: false,
        description: 'Set reminders'
      }
    ]
  },

  // ==========================================================================
  // 📊 ANALYTICS & REPORTS
  // ==========================================================================
  {
    id: 'analytics-group',
    title: 'Analytics & Reports',
    icon: BarChart,
    isGroup: true,
    permission: 'user',
    mobileHidden: true,
    category: 'analytics',
    items: [
      { 
        id: 'analytics', 
        title: 'Analytics', 
        path: '/analytics', 
        icon: LineChart, 
        permission: 'user',
        mobileHidden: true,
        description: 'Business analytics'
      },
      { 
        id: 'reports', 
        title: 'Reports', 
        path: '/reports', 
        icon: FileText, 
        permission: 'user',
        mobileHidden: true,
        description: 'Generate reports'
      },
      { 
        id: 'goals', 
        title: 'Goals', 
        path: '/goals', 
        icon: Target, 
        permission: 'user',
        mobileHidden: true,
        description: 'Track goals'
      }
    ]
  },

  // ==========================================================================
  // 📱 RESOURCES
  // ==========================================================================
  {
    id: 'resources-group',
    title: 'Resources',
    icon: BookOpen,
    isGroup: true,
    permission: 'prospect',
    mobileHidden: false,
    category: 'resources',
    items: [
      { 
        id: 'articles', 
        title: 'Articles', 
        path: '/resources/articles', 
        icon: FileText, 
        permission: 'prospect',
        mobileHidden: false,
        description: 'Knowledge base'
      },
      { 
        id: 'faq', 
        title: 'FAQ', 
        path: '/resources/faq', 
        icon: HelpCircle, 
        permission: 'prospect',
        mobileHidden: false,
        description: 'Common questions'
      }
    ]
  },

  // ==========================================================================
  // 📱 MOBILE APPS
  // ==========================================================================
  {
    id: 'apps-group',
    title: 'Mobile Apps',
    icon: Smartphone,
    isGroup: true,
    permission: 'admin',
    mobileHidden: true,
    category: 'apps',
    items: [
      { 
        id: 'apps-overview', 
        title: 'Apps Overview', 
        path: '/apps/overview', 
        icon: Info, 
        permission: 'admin',
        mobileHidden: true,
        description: 'Mobile app info'
      },
      { 
        id: 'apps-employee', 
        title: 'Employee App', 
        path: '/apps/employee', 
        icon: User, 
        permission: 'admin',
        mobileHidden: true,
        description: 'Staff app'
      },
      { 
        id: 'apps-client', 
        title: 'Client App', 
        path: '/apps/client', 
        icon: Users, 
        permission: 'admin',
        mobileHidden: true,
        description: 'Client-facing app'
      },
      { 
        id: 'apps-affiliate', 
        title: 'Affiliate App', 
        path: '/apps/affiliate', 
        icon: Handshake, 
        permission: 'admin',
        mobileHidden: true,
        description: 'Affiliate partner app'
      }
    ]
  },

  // ==========================================================================
  // ⚙️ ADMINISTRATION
  // ==========================================================================
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
        id: 'settings', 
        title: 'Settings', 
        path: '/settings', 
        icon: Settings, 
        permission: 'prospect',
        mobileHidden: false,
        description: 'User settings'
      },
      { 
        id: 'team', 
        title: 'Team Management', 
        path: '/team', 
        icon: Users, 
        permission: 'admin',
        mobileHidden: true,
        description: 'Manage team members'
      },
      { 
        id: 'roles', 
        title: 'Roles & Permissions', 
        path: '/roles', 
        icon: Shield, 
        permission: 'admin',
        mobileHidden: true,
        description: 'Role management'
      },
      { 
        id: 'user-roles', 
        title: 'User Role Manager', 
        path: '/user-roles', 
        icon: UserCheck, 
        permission: 'admin',
        mobileHidden: true,
        description: 'Assign user roles'
      },
      { 
        id: 'integrations', 
        title: 'Integrations', 
        path: '/integrations', 
        icon: Zap, 
        permission: 'admin',
        mobileHidden: true,
        description: 'Third-party integrations'
      },
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

  // ==========================================================================
  // 🎨 WHITE LABEL (Master Admin Only)
  // ==========================================================================
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

export default navigationItems;