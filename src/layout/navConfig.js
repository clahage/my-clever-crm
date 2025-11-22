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
  // 🏡 HOME - WELCOME HUB (Removed - functionality merged into Smart Dashboard)
  // ==========================================================================
  // {
  //   id: 'home',
  //   title: 'Welcome Hub',
  //   path: '/home',
  //   icon: Home,
  //   permission: 'prospect',
  //   mobileHidden: false,
  //   description: 'Welcome page, feature overview, and getting started guide',
  //   category: 'core'
  // },

  // ==========================================================================
  // 🎯 ADMIN COMMAND CENTER (Removed - functionality merged into Smart Dashboard)
  // ==========================================================================
  // {
  //   id: 'admin-portal',
  //   title: '🎯 Admin Portal',
  //   path: '/portal',
  //   icon: LayoutDashboard,
  //   permission: 'admin',
  //   mobileHidden: true, // Too complex for mobile
  //   badge: 'ADMIN',
  //   description: '6-tab command center for complete system control',
  //   category: 'admin'
  // },

  // ==========================================================================
  // 👤 CLIENT PORTAL (Removed - functionality merged into Smart Dashboard)
  // ==========================================================================
  // {
  //   id: 'client-portal',
  //   title: '👤 Client Portal',
  //   path: '/client-portal',
  //   icon: User,
  //   permission: 'client', // Clients and prospects
  //   mobileHidden: false,
  //   badge: 'NEW',
  //   description: 'Client progress dashboard with scores, disputes, payments',
  //   category: 'client'
  // },

  // ==========================================================================
  // 🎯 HYBRID HUBS - ALL 41 BUSINESS HUBS ORGANIZED
  // ==========================================================================
  // NOTE: Credit Reports Hub removed from root level - now only in Business Hubs
  // to eliminate duplicate /credit-hub URLs (was line 226)
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
      // ========================================
      // 📋 DAILY OPERATIONS
      // ========================================
      {
        id: 'clients-hub',
        title: 'Clients Hub',
        path: '/clients-hub',
        icon: Users,
        permission: 'user',
        badge: 'AI',
        description: 'Complete client management'
      },
      {
        id: 'comms-hub',
        title: 'Communications Hub',
        path: '/comms-hub',
        icon: MessageSquare,
        permission: 'user',
        badge: 'AI',
        description: 'Email, SMS, campaigns, automation'
      },
      {
        id: 'tasks-hub',
        title: 'Tasks & Scheduling',
        path: '/tasks-hub',
        icon: Calendar,
        permission: 'user',
        description: 'Task and calendar management'
      },
      {
        id: 'dispute-hub',
        title: 'Dispute Management',
        path: '/dispute-hub',
        icon: AlertCircle,
        permission: 'user',
        description: 'Dispute tracking and management'
      },
      {
        id: 'documents-hub',
        title: 'Documents Hub',
        path: '/documents-hub',
        icon: FolderOpen,
        permission: 'user',
        description: 'Document management system'
      },
      {
        id: 'calendar-hub',
        title: 'Calendar Hub',
        path: '/calendar-hub',
        icon: Calendar,
        permission: 'user',
        description: 'Advanced calendar features'
      },

      // ========================================
      // 💳 CREDIT & COMPLIANCE
      // ========================================
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
      },

      // ========================================
      // 💰 FINANCIAL MANAGEMENT
      // ========================================
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

      // ========================================
      // 📈 SALES & MARKETING
      // ========================================
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
        id: 'affiliates-hub',
        title: 'Affiliates Hub',
        path: '/affiliates-hub',
        icon: Handshake,
        permission: 'user',
        description: 'Affiliate management'
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
        id: 'reviews-hub',
        title: 'Reviews & Reputation',
        path: '/reviews-hub',
        icon: Star,
        permission: 'user',
        description: 'Reputation management'
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
        id: 'drip-campaigns-hub',
        title: 'Drip Campaigns',
        path: '/drip-campaigns-hub',
        icon: Send,
        permission: 'user',
        badge: 'AI',
        description: 'Automated email sequences'
      },

      // ========================================
      // 📊 ANALYTICS & AUTOMATION
      // ========================================
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
        id: 'ai-hub',
        title: 'AI Hub',
        path: '/ai-hub',
        icon: Brain,
        permission: 'user',
        badge: 'AI',
        description: 'AI-powered tools and insights'
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

      // ========================================
      // 👥 CLIENT EXPERIENCE
      // ========================================
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

      // ========================================
      // 🎓 TEAM & LEARNING
      // ========================================
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
        id: 'certification-hub',
        title: 'Certification System',
        path: '/certification-hub',
        icon: Award,
        permission: 'user',
        description: 'Certification and accreditation'
      },

      // ========================================
      // ⚙️ ADVANCED TOOLS
      // ========================================
      {
        id: 'settings-hub',
        title: 'Settings Hub',
        path: '/settings-hub',
        icon: Settings,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'System configuration'
      },
      {
        id: 'support-hub',
        title: 'Support Hub',
        path: '/support-hub',
        icon: HelpCircle,
        permission: 'user',
        description: 'Help desk and support'
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
        id: 'content-seo-hub',
        title: 'Content & SEO',
        path: '/content-seo-hub',
        icon: FileText,
        permission: 'user',
        badge: 'AI',
        description: 'Content creation and SEO'
      },
      {
        id: 'revenue-partnerships-hub',
        title: 'Revenue Partnerships',
        path: '/revenue-partnerships-hub',
        icon: DollarSign,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Partnership revenue tracking'
      }

      // REMOVED DUPLICATE: payment-hub (/payment-hub) - duplicate of payment-integration-hub
    ]
  },

  // ==========================================================================
  // 📊 CREDIT REPORT WORKFLOW - REMOVED (Inside Credit Intelligence Hub)
  // ==========================================================================
  // {
  //   id: 'credit-workflow',
  //   title: 'Credit Report Workflow',
  //   path: '/credit-report-workflow',
  //   icon: Upload,
  //   permission: 'user',
  //   mobileHidden: true,
  //   badge: 'AI',
  //   description: 'IDIQ API, Manual Entry, PDF Upload - NOW IN CREDIT HUB',
  //   category: 'credit'
  // },

  // ==========================================================================
  // 🤖 AI REVIEW SYSTEM - REMOVED (Inside Credit Intelligence Hub & Analytics Hub)
  // ==========================================================================
  // {
  //   id: 'ai-reviews',
  //   title: 'AI Review Dashboard',
  //   path: '/admin/ai-reviews',
  //   icon: Brain,
  //   permission: 'admin',
  //   badge: 'AI',
  //   description: 'NOW IN CREDIT INTELLIGENCE HUB',
  //   category: 'ai'
  // },
  // {
  //   id: 'ai-credit-analysis',
  //   title: 'AI Credit Engine',
  //   path: '/credit-analysis',
  //   icon: Brain,
  //   permission: 'user',
  //   badge: 'AI',
  //   description: 'NOW IN CREDIT INTELLIGENCE HUB',
  //   category: 'ai'
  // },
  // {
  //   id: 'predictive-analytics',
  //   title: 'Predictive Analytics',
  //   path: '/predictive-analytics',
  //   icon: Activity,
  //   permission: 'admin',
  //   badge: 'AI',
  //   description: 'NOW IN ANALYTICS HUB',
  //   category: 'ai'
  // },

  // ==========================================================================
  // 👥 CONTACT MANAGEMENT - REMOVED (All features in Clients Hub)
  // ==========================================================================
  // {
  //   id: 'contacts-group',
  //   title: 'Contact Management',
  //   description: 'ALL ITEMS NOW IN CLIENTS HUB (/clients-hub)',
  //   // All Contacts → Clients Hub main view
  //   // Client Intake → Add Contact button
  //   // Sales Pipeline → Pipeline tab
  //   // Import/Export → Import/Export tabs
  //   // Contact Reports → Analytics tab
  //   // Segments → Segmentation feature
  // },

  // ==========================================================================
  // 💳 CREDIT MANAGEMENT - REMOVED (All features in Credit Intelligence Hub)
  // ==========================================================================
  // {
  //   id: 'credit-group',
  //   title: 'Credit Management',
  //   description: 'ALL ITEMS NOW IN CREDIT INTELLIGENCE HUB (/credit-hub)',
  //   // Credit Simulator → Simulator tab
  //   // Business Credit → Business Credit tab
  //   // My Credit Scores → Scores dashboard
  //   // Dispute Center → Disputes tab
  //   // Dispute Status → Dispute tracking
  //   // Admin Dispute Panel → Admin panel
  //   // Credit Monitoring → Monitoring tab
  //   // My Reports → Reports section
  // },

  // ==========================================================================
  // 📨 COMMUNICATIONS - REMOVED (All features in Communications Hub)
  // ==========================================================================
  // {
  //   id: 'comms-group',
  //   title: 'Communications',
  //   description: 'ALL ITEMS NOW IN COMMUNICATIONS HUB (/comms-hub) - 8 TABS',
  //   // Communications Center → Dashboard/Inbox tab
  //   // Letters → Letters tab
  //   // Emails → Email tab
  //   // SMS → SMS tab
  //   // Drip Campaigns → Campaigns tab
  //   // Templates → Templates tab
  //   // Call Logs → Calls tab
  //   // Notifications → Notifications tab
  // },

  // ==========================================================================
  // 🎓 LEARNING & RESOURCES - REMOVED (All features in Learning Hub)
  // ==========================================================================
  // {
  //   id: 'learning-group',
  //   title: 'Learning & Resources',
  //   description: 'ALL ITEMS NOW IN LEARNING HUB (/learning-hub)',
  //   // Learning Center → Main dashboard
  //   // Achievements → Achievements tab
  //   // Certificates → Certificates tab
  // },

  // ==========================================================================
  // 📄 DOCUMENTS & FORMS - REMOVED (All features in Documents Hub)
  // ==========================================================================
  // {
  //   id: 'docs-group',
  //   title: 'Documents & Forms',
  //   description: 'ALL ITEMS NOW IN DOCUMENTS HUB (/documents-hub)',
  //   // Document Center → Main view
  //   // My Documents → My Docs filter
  //   // E-Contracts → E-Contracts tab
  //   // Forms Library → Forms tab
  //   // Full Agreement → Templates section
  //   // Information Sheet → Templates
  //   // Power of Attorney → Templates
  //   // ACH Authorization → Templates
  //   // Addendums → Templates
  //   // Document Storage → Storage view
  // },

  // ==========================================================================
  // 🏢 BUSINESS MANAGEMENT - REMOVED (Consolidated into other hubs)
  // ==========================================================================
  // {
  //   id: 'business-group',
  //   title: 'Business Management',
  //   description: 'ITEMS MOVED TO APPROPRIATE HUBS',
  //   // Companies → Likely in Clients Hub or Settings Hub
  //   // Locations → Settings Hub (branch management)
  //   // Affiliates → Affiliates Hub (already removed)
  // },

  // ==========================================================================
  // 📅 SCHEDULING & TASKS - REMOVED (All features in Tasks & Scheduling Hub)
  // ==========================================================================
  // {
  //   id: 'schedule-group',
  //   title: 'Scheduling & Tasks',
  //   description: 'ALL ITEMS NOW IN TASKS & SCHEDULING HUB (/tasks-hub)',
  //   // Calendar → Calendar tab
  //   // Appointments → Appointments tab
  //   // Tasks → Tasks tab
  //   // Reminders → Reminders feature
  // },

  // ==========================================================================
  // 📊 ANALYTICS & REPORTS - REMOVED (Use Analytics Hub & Reports Hub in Business Hubs)
  // ==========================================================================
  // {
  //   id: 'analytics-group',
  //   title: 'Analytics & Reports',
  //   description: 'DUPLICATES REMOVED - Use Analytics Hub (/analytics-hub) & Reports Hub (/reports-hub)',
  //   // Analytics (/analytics) → Use Analytics Hub (/analytics-hub) - More comprehensive
  //   // Reports (/reports) → Use Reports Hub (/reports-hub) - More features
  //   // Goals (/goals) → Likely in Analytics Hub
  // },

  // ==========================================================================
  // 📱 RESOURCES - REMOVED (Use Learning Hub & Support Hub)
  // ==========================================================================
  // {
  //   id: 'resources-group',
  //   title: 'Resources',
  //   description: 'CONSOLIDATED INTO OTHER HUBS',
  //   // Articles → Learning Hub or Resource Library Hub
  //   // FAQ → Support Hub
  // },

  // ==========================================================================
  // 📱 MOBILE APPS - REMOVED (All features in Mobile App Hub)
  // ==========================================================================
  // {
  //   id: 'apps-group',
  //   title: 'Mobile Apps',
  //   description: 'ALL ITEMS NOW IN MOBILE APP HUB (/mobile-app-hub)',
  //   // Apps Overview → Dashboard
  //   // Employee App → Employee tab
  //   // Client App → Client tab
  //   // Affiliate App → Affiliate tab
  // },

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
      // REMOVED: Settings (/settings) → Use Settings Hub (/settings-hub) in Business Hubs
      // REMOVED ITEMS - Now in Settings Hub (/settings-hub):
      // Team Management → Team tab
      // Roles & Permissions → Roles tab
      // User Role Manager → Duplicate of Roles
      // Integrations → Integrations tab
      // Note: Support kept as separate Support Hub
      ,
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
      { id: 'analytics', title: 'Analytics', path: '/analytics-hub', icon: BarChart },
      { id: 'settings', title: 'Settings', path: '/settings', icon: Settings },
    ],
    admin: [
      { id: 'portal', title: 'Admin', path: '/portal', icon: LayoutDashboard },
      { id: 'contacts', title: 'Contacts', path: '/clients-hub', icon: Users },
      { id: 'credit-hub', title: 'Credit Hub', path: '/credit-hub', icon: Shield },
      { id: 'reports', title: 'Reports', path: '/reports-hub', icon: FileText },
      { id: 'settings', title: 'Settings', path: '/settings', icon: Settings },
    ],
    manager: [
      { id: 'contacts', title: 'Contacts', path: '/clients-hub', icon: Users },
      { id: 'credit-hub', title: 'Credit Hub', path: '/credit-hub', icon: Shield },
      { id: 'pipeline', title: 'Pipeline', path: '/clients-hub', icon: GitBranch },
      { id: 'reports', title: 'Reports', path: '/reports-hub', icon: FileText },
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
      { id: 'reports', title: 'Reports', path: '/reports-hub', icon: FileText },
      { id: 'analytics', title: 'Analytics', path: '/analytics-hub', icon: BarChart },
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