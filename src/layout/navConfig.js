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
  MapPin, AlertCircle, Eye, Wrench, Lock, Key, HelpCircle, ExternalLink, RefreshCw
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
<<<<<<< HEAD
// NAVIGATION ITEMS - OPTIMIZED 20-HUB STRUCTURE
// ============================================================================

export const navigationItems = [
  // ==========================================================================
<<<<<<< HEAD
  // 🎯 SMART DASHBOARD - PRIMARY LANDING
  // ==========================================================================
  {
    id: 'smart-dashboard',
    title: 'Smart Dashboard',
    path: '/smart-dashboard',
<<<<<<< HEAD
    icon: Sparkles,
    permission: 'prospect',
    mobileHidden: false,
    badge: 'AI',
    description: 'Intelligent role-adaptive dashboard with AI insights',
    category: 'core'
  },

  // ==========================================================================
  // 🏠 CORE OPERATIONS - 7 PRIMARY HUBS
  // ==========================================================================
  {
    id: 'core-operations-group',
    title: 'Core Operations',
    icon: LayoutDashboard,
    isGroup: true,
    permission: 'user',
    mobileHidden: false,
    category: 'core',
    defaultExpanded: true,
    items: [
      // HUB 1: CLIENTS & PIPELINE (Consolidated: 6 items → 1 hub)
=======
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
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 2229387 (Phase 3: Consolidate navigation from 113 items to 24 hub-based items)
=======
      // CORE OPERATIONS (9 hubs - Dashboard Hub consolidated into SmartDashboard)
>>>>>>> 4508cc6 (feat: Consolidate dashboards into universal Smart Dashboard)
=======
      // ========================================
      // 📋 DAILY OPERATIONS
      // ========================================
>>>>>>> 21e0dc3 (feat: Reorganize hub navigation into logical groups)
      {
        id: 'clients-pipeline-hub',
        title: 'Clients & Pipeline',
        path: '/clients-hub',
        icon: Users,
        permission: 'user',
        badge: 'AI',
<<<<<<< HEAD
<<<<<<< HEAD
        description: 'Complete client lifecycle: contacts, pipeline, intake, segments',
        consolidated: ['ClientsHub', 'Contacts', 'Pipeline', 'ContactDetailPage', 'ClientIntake', 'Segments']
=======
        description: 'Complete client & contact management'
>>>>>>> 2229387 (Phase 3: Consolidate navigation from 113 items to 24 hub-based items)
=======
        description: 'Complete client management'
>>>>>>> 4508cc6 (feat: Consolidate dashboards into universal Smart Dashboard)
      },

      // HUB 2: CREDIT REPORTS & ANALYSIS (Consolidated: 5 items → 1 hub)
      {
<<<<<<< HEAD
        id: 'credit-reports-hub',
        title: 'Credit Reports & Analysis',
=======
        id: 'credit-hub',
<<<<<<< HEAD
        title: 'Credit Hub',
>>>>>>> 2229387 (Phase 3: Consolidate navigation from 113 items to 24 hub-based items)
        path: '/credit-hub',
        icon: Shield,
        permission: 'client',
        badge: 'AI',
<<<<<<< HEAD
        description: 'IDIQ integration, credit analysis, simulator, bureau communication',
        consolidated: ['CreditReportsHub', 'CreditAnalysisEngine', 'CreditSimulator', 'BusinessCredit', 'BureauCommunicationHub']
=======
        description: 'IDIQ credit monitoring & analysis'
      },
      {
<<<<<<< HEAD
        id: 'dispute-hub',
        title: 'Dispute Hub',
        path: '/dispute-hub',
        icon: AlertCircle,
        permission: 'user',
        description: 'Dispute management & letters'
>>>>>>> 2229387 (Phase 3: Consolidate navigation from 113 items to 24 hub-based items)
=======
        title: 'Credit Intelligence Hub',
        path: '/credit-hub',
        icon: Shield,
        permission: 'user',
        badge: 'AI',
        description: 'Complete IDIQ + AI credit analysis'
>>>>>>> 4508cc6 (feat: Consolidate dashboards into universal Smart Dashboard)
      },

      // HUB 3: DISPUTE MANAGEMENT (Consolidated: 4 items → 1 hub)
      {
<<<<<<< HEAD
        id: 'dispute-management-hub',
        title: 'Dispute Management',
        path: '/dispute-hub',
        icon: AlertCircle,
        permission: 'user',
        badge: 'AI',
        description: 'Dispute tracking, letter generation, admin panel, status monitoring',
        consolidated: ['DisputeHub', 'DisputeLetters', 'DisputeStatus', 'DisputeAdminPanel']
      },

      // HUB 4: COMMUNICATIONS (Consolidated: 7 items → 1 hub)
      {
        id: 'communications-hub',
=======
=======
>>>>>>> 21e0dc3 (feat: Reorganize hub navigation into logical groups)
        id: 'comms-hub',
<<<<<<< HEAD
>>>>>>> 2229387 (Phase 3: Consolidate navigation from 113 items to 24 hub-based items)
        title: 'Communications',
=======
        title: 'Communications Hub',
>>>>>>> 4508cc6 (feat: Consolidate dashboards into universal Smart Dashboard)
        path: '/comms-hub',
        icon: MessageSquare,
        permission: 'user',
        badge: 'AI',
<<<<<<< HEAD
<<<<<<< HEAD
        description: 'Email, SMS, drip campaigns, call logs, templates',
        consolidated: ['CommunicationsHub', 'Emails', 'SMS', 'DripCampaigns', 'CallLogs', 'Templates', 'CampaignPlanner']
=======
        description: 'Email, SMS, calls, campaigns'
>>>>>>> 2229387 (Phase 3: Consolidate navigation from 113 items to 24 hub-based items)
=======
        description: 'Email, SMS, campaigns, automation'
>>>>>>> 4508cc6 (feat: Consolidate dashboards into universal Smart Dashboard)
      },

      // HUB 5: DOCUMENTS & CONTRACTS (Consolidated: 12 items → 1 hub)
      {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        id: 'documents-contracts-hub',
        title: 'Documents & Contracts',
        path: '/documents-hub',
        icon: FolderOpen,
        permission: 'user',
        description: 'Document management, forms, templates, e-contracts, agreements',
        consolidated: ['DocumentsHub', 'Forms', 'Templates', 'EContracts', 'FullAgreement', 'Addendums', 'InformationSheet', 'DocumentCenter', 'DocumentStorage', 'ContractManagementHub']
=======
        id: 'documents-hub',
        title: 'Documents',
        path: '/documents-hub',
        icon: FolderOpen,
        permission: 'user',
        description: 'All documents & e-contracts'
>>>>>>> 2229387 (Phase 3: Consolidate navigation from 113 items to 24 hub-based items)
=======
        id: 'dispute-hub',
        title: 'Dispute Management',
        path: '/dispute-hub',
        icon: AlertCircle,
        permission: 'user',
        description: 'Dispute tracking and management'
>>>>>>> 4508cc6 (feat: Consolidate dashboards into universal Smart Dashboard)
      },

      // HUB 6: TASKS & PRODUCTIVITY (Consolidated: 6 items → 1 hub)
      {
<<<<<<< HEAD
        id: 'tasks-productivity-hub',
        title: 'Tasks & Productivity',
        path: '/tasks-hub',
        icon: Calendar,
        permission: 'user',
        badge: 'AI',
        description: 'Calendar, tasks, scheduling, reminders, goals, team management',
        consolidated: ['TasksSchedulingHub', 'Calendar', 'Tasks', 'Reminders', 'Goals', 'CalendarSchedulingHub']
      },

      // HUB 7: AUTOMATION
=======
=======
>>>>>>> 21e0dc3 (feat: Reorganize hub navigation into logical groups)
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
>>>>>>> 2229387 (Phase 3: Consolidate navigation from 113 items to 24 hub-based items)
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
<<<<<<< HEAD
        description: 'Workflow automation and AI-powered tools'
=======
        description: 'Workflow automation'
<<<<<<< HEAD
>>>>>>> 2229387 (Phase 3: Consolidate navigation from 113 items to 24 hub-based items)
      }
    ]
  },

  // ==========================================================================
<<<<<<< HEAD
  // 💰 FINANCIAL OPERATIONS - 2 HUBS
  // ==========================================================================
  {
    id: 'financial-group',
    title: 'Financial Operations',
    icon: DollarSign,
    isGroup: true,
    permission: 'admin',
    mobileHidden: false,
    category: 'financial',
    defaultExpanded: false,
    items: [
      // HUB 8: FINANCIAL OPERATIONS (Consolidated: 6 hubs → 1 hub)
      {
        id: 'financial-operations-hub',
        title: 'Financial Operations',
        path: '/billing-hub',
        icon: Receipt,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Billing, payments, collections, invoicing, payment integrations',
        consolidated: ['BillingHub', 'BillingPaymentsHub', 'CollectionsARHub', 'PaymentIntegrationHub', 'PaymentHub', 'Invoices']
      },
<<<<<<< HEAD

      // HUB 9: REVENUE & ANALYTICS (Consolidated: 3 hubs → 1 hub)
      {
        id: 'revenue-analytics-hub',
        title: 'Revenue & Analytics',
        path: '/revenue-hub',
        icon: TrendingUp,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Revenue tracking, forecasting, analytics, reports, business intelligence',
        consolidated: ['RevenueHub', 'AnalyticsHub', 'ReportsHub']
      }
    ]
  },

  // ==========================================================================
  // 📈 BUSINESS GROWTH - 4 HUBS
  // ==========================================================================
  {
    id: 'business-growth-group',
    title: 'Business Growth',
    icon: TrendingUp,
    isGroup: true,
    permission: 'user',
    mobileHidden: false,
    category: 'growth',
    defaultExpanded: false,
    items: [
      // HUB 10: MARKETING & CAMPAIGNS (Consolidated: 6 hubs → 1 hub)
      {
        id: 'marketing-campaigns-hub',
        title: 'Marketing & Campaigns',
        path: '/marketing-hub',
        icon: Zap,
        permission: 'user',
        badge: 'AI',
        description: 'Marketing campaigns, social media, SEO, content creation',
        consolidated: ['MarketingHub', 'SocialMediaHub', 'ContentCreatorSEOHub', 'DripCampaignsHub', 'SocialAnalytics', 'PostScheduler']
      },

      // HUB 11: REFERRALS & PARTNERSHIPS (Consolidated: 5 hubs → 1 hub)
      {
        id: 'referrals-partnerships-hub',
        title: 'Referrals & Partnerships',
        path: '/referral-partner-hub',
        icon: Handshake,
        permission: 'user',
        badge: 'PRO',
        description: 'Referral engine, partner management, affiliate program, commissions',
        consolidated: ['ReferralEngineHub', 'ReferralPartnerHub', 'UnifiedReferralHub', 'AffiliatesHub', 'RevenuePartnershipsHub']
      },

      // HUB 12: REVIEWS & REPUTATION (Keep as-is)
      {
        id: 'reviews-reputation-hub',
        title: 'Reviews & Reputation',
        path: '/reviews-hub',
        icon: Star,
        permission: 'user',
        description: 'Reputation management, review monitoring, response automation'
      },

      // HUB 13: WEBSITE BUILDER (Keep as-is)
      {
        id: 'website-builder-hub',
        title: 'Website Builder',
        path: '/website-hub',
        icon: Globe,
        permission: 'admin',
        badge: 'PRO',
        description: 'Website and landing page builder'
      }
    ]
  },

  // ==========================================================================
  // 🎓 CLIENT SUCCESS & LEARNING - 2 HUBS
  // ==========================================================================
  {
    id: 'client-success-group',
    title: 'Client Success',
    icon: Award,
    isGroup: true,
    permission: 'user',
    mobileHidden: false,
    category: 'success',
    defaultExpanded: false,
    items: [
      // HUB 14: CLIENT SUCCESS (Consolidated: 3 hubs → 1 hub)
      {
        id: 'client-success-hub',
        title: 'Client Success',
        path: '/client-success-hub',
        icon: Award,
        permission: 'user',
        description: 'Client retention, onboarding, progress tracking',
        consolidated: ['ClientSuccessRetentionHub', 'OnboardingWelcomeHub', 'ProgressPortalHub']
      },

      // HUB 15: ENTERPRISE LEARNING (Consolidated: 8+ items → 1 hub)
      {
        id: 'enterprise-learning-hub',
        title: 'Enterprise Learning',
        path: '/learning-hub',
        icon: GraduationCap,
        permission: 'user',
        badge: 'AI',
        description: 'Training, courses, certification academy, knowledge base',
        consolidated: ['LearningHub', 'TrainingHub', 'ComprehensiveLearningHub', 'ResourceLibraryHub', 'CertificationAcademyHub', 'LearningCenter', 'Certificates', 'Achievements']
      }
    ]
  },

  // ==========================================================================
  // ⚙️ SYSTEM & ADMINISTRATION - 3 HUBS
  // ==========================================================================
  {
    id: 'system-group',
    title: 'System & Administration',
    icon: Settings,
    isGroup: true,
    permission: 'admin',
    mobileHidden: false,
    category: 'system',
    defaultExpanded: false,
    items: [
      // HUB 16: MOBILE APPLICATION (Already consolidated)
      {
        id: 'mobile-app-hub',
        title: 'Mobile Application',
        path: '/mobile-app-hub',
        icon: Smartphone,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Mobile app management: screens, push, analytics, publishing',
        consolidated: ['MobileAppHub', 'PushNotificationManager', 'MobileAnalyticsDashboard', 'InAppMessagingSystem', 'MobileScreenBuilder', 'AppPublishingWorkflow', 'MobileUserManager', 'MobileFeatureToggles']
      },

      // HUB 17: SETTINGS & ADMINISTRATION (Consolidated: 3 hubs → 1 hub)
      {
        id: 'settings-admin-hub',
        title: 'Settings & Administration',
        path: '/settings-hub',
        icon: Settings,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'System configuration, user management, roles, permissions',
        consolidated: ['SettingsHub', 'AdminTools', 'ManageRoles']
      },

      // HUB 18: AI HUB (Keep as-is)
      {
        id: 'ai-hub',
        title: 'AI Hub',
        path: '/ai-hub',
        icon: Brain,
        permission: 'user',
        badge: 'AI',
        description: 'AI-powered tools, insights, and automation'
      },

      // HUB 19: SUPPORT HUB (Keep as-is)
      {
        id: 'support-hub',
        title: 'Support Hub',
        path: '/support-hub',
        icon: HelpCircle,
        permission: 'user',
        description: 'Help desk, knowledge base, support tickets'
      },

      // HUB 20: COMPLIANCE HUB (Keep as-is)
      {
        id: 'compliance-hub',
        title: 'Compliance Hub',
        path: '/compliance-hub',
        icon: Shield,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Regulatory compliance and audit management'
      },

      // WHITE LABEL CRM (Keep as-is)
      {
        id: 'white-label-crm-hub',
        title: 'White Label CRM',
        path: '/white-label-crm-hub',
        icon: Building2,
        permission: 'admin',
        badge: 'PRO',
        description: 'White label CRM licensing and partner management'
      }
    ]
  },

  // ==========================================================================
  // 🎯 SPECIALIZED SERVICE HUBS - 7 HUBS (Keep separate)
  // ==========================================================================
  {
    id: 'specialized-services-group',
    title: 'Specialized Services',
    icon: Star,
    isGroup: true,
    permission: 'client',
    mobileHidden: false,
    category: 'services',
    defaultExpanded: false,
    items: [
      {
        id: 'tax-services-hub',
        title: 'Tax Services',
        path: '/tax-services-hub',
        icon: Calculator,
        permission: 'client',
        badge: 'AI',
        description: 'AI-powered tax preparation and management'
      },
      {
        id: 'mortgage-readiness-hub',
        title: 'Mortgage Readiness',
        path: '/mortgage-readiness-hub',
        icon: Building2,
        permission: 'client',
        badge: 'AI',
        description: '90-day mortgage preparation accelerator'
      },
      {
        id: 'auto-loan-hub',
        title: 'Auto Loan Concierge',
        path: '/auto-loan-hub',
        icon: Target,
        permission: 'client',
        badge: 'AI',
        description: 'AI-powered auto loan concierge service'
      },
      {
        id: 'rental-boost-hub',
        title: 'Rental Application Boost',
        path: '/rental-boost-hub',
        icon: Building,
        permission: 'client',
        badge: 'AI',
        description: 'AI-powered rental application preparation'
      },
      {
        id: 'credit-emergency-hub',
        title: 'Credit Emergency Response',
        path: '/credit-emergency-hub',
        icon: AlertCircle,
        permission: 'client',
        badge: 'URGENT',
        description: '7-14 day rapid credit repair sprints'
      },
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
        id: 'financial-planning-hub',
        title: 'Financial Planning',
        path: '/financial-planning-hub',
        icon: PieChart,
        permission: 'client',
        badge: 'AI',
        description: 'Comprehensive financial planning services'
      }
    ]
  },

  // ==========================================================================
  // 🔐 CLIENT PORTAL
  // ==========================================================================
  {
    id: 'client-portal',
    title: 'Client Portal',
    path: '/client-portal',
    icon: User,
    permission: 'client',
    mobileHidden: false,
    description: 'Client self-service dashboard',
    category: 'client'
  },

  // ==========================================================================
  // 👤 ADMIN PORTAL
  // ==========================================================================
  {
    id: 'admin-portal',
    title: 'Admin Portal',
    path: '/portal',
    icon: Shield,
    permission: 'admin',
    mobileHidden: true,
    badge: 'ADMIN',
    description: '6-tab command center for complete system control',
    category: 'admin'
=======
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
=======
      },
>>>>>>> 4508cc6 (feat: Consolidate dashboards into universal Smart Dashboard)
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
=======
>>>>>>> 21e0dc3 (feat: Reorganize hub navigation into logical groups)

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
>>>>>>> 2229387 (Phase 3: Consolidate navigation from 113 items to 24 hub-based items)
  }
];

// ============================================================================
<<<<<<< HEAD
<<<<<<< HEAD
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
// EXPORT DEFAULT
=======
// MOBILE-SPECIFIC NAVIGATION (Consolidated - Phase 3)
>>>>>>> 2229387 (Phase 3: Consolidate navigation from 113 items to 24 hub-based items)
=======
// MOBILE-SPECIFIC NAVIGATION
>>>>>>> 4508cc6 (feat: Consolidate dashboards into universal Smart Dashboard)
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
