// Minimal export to resolve build error for getMobileNavigation
export function getMobileNavigation(userRole) {
  return [];
}
// src/layout/navConfig.js
// ============================================================================
// OPTIMIZED NAVIGATION CONFIGURATION - VERSION 4.0
// ============================================================================
// MAJOR UPDATE: Navigation reorganization (53 hubs → 20 strategic hubs)
// REDUCTION: 64% fewer navigation items for improved UX
// CONSOLIDATION: Related features grouped into comprehensive hubs
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
  CreditCard as LucideCreditCard, TrendingUp, Calculator, GitBranch, List, DollarSign, Wallet,
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
// NAVIGATION ITEMS - OPTIMIZED 20-HUB STRUCTURE
// ============================================================================

export const navigationItems = [
  // ==========================================================================
  // 🎯 SMART DASHBOARD - PRIMARY LANDING
  // ==========================================================================
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
  // ===========================================================================
  // 🛡️ ADMIN DASHBOARD (NEW TAB FOR ADMIN/MASTERADMIN)
  // ===========================================================================
  {
    id: 'admin-dashboard',
    title: 'Admin Dashboard',
    path: '/admin-dashboard',
    icon: LayoutDashboard,
    permission: 'admin', // admin and masterAdmin
    badge: 'ADMIN',
    description: 'Unified admin dashboard for Firestore, Storage, Auth, and Realtime DB management',
    category: 'admin',
    visibleTo: ['admin', 'masterAdmin']
  },
  // ========================================================================
  // 🛒 PRODUCTS & SERVICES HUB - NEW TOP LEVEL
  // ========================================================================
  {
    id: 'products-services-hub',
    title: 'Products & Services',
    icon: Package,
    isGroup: true,
    permission: 'user',
    mobileHidden: false,
    category: 'products',
    defaultExpanded: true,
    items: [
      {
        id: 'service-plans-tab',
        title: 'Service Plans',
        path: '/products-services/service-plans',
        icon: Layers,
        permission: 'user',
        description: 'Browse and manage all service plans',
      },
      {
        id: 'contracts-tab',
        title: 'Contracts',
        path: '/products-services/contracts',
        icon: FileText,
        permission: 'user',
        description: 'Contract management and templates',
      },
      {
        id: 'pricing-calculator-tab',
        title: 'Pricing Calculator',
        path: '/products-services/pricing-calculator',
        icon: Calculator,
        permission: 'user',
        description: 'Interactive pricing and quote calculator',
      }
      // Add more sub-items as needed
    ]
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
      {
        id: 'clients-pipeline-hub',
        title: 'Clients & Pipeline',
        path: '/clients-hub',
        icon: Users,
        permission: 'user',
        badge: 'AI',
        description: 'Complete client lifecycle: contacts, pipeline, intake, segments',
        consolidated: ['ClientsHub', 'Contacts', 'Pipeline', 'ContactDetailPage', 'ClientIntake', 'Segments']
      },

      // HUB 2: CREDIT REPORTS & ANALYSIS (Consolidated: 5 items → 1 hub)
      {
        id: 'credit-reports-hub',
        title: 'Credit Reports & Analysis',
        path: '/credit-hub',
        icon: Shield,
        permission: 'user',
        badge: 'AI',
        description: 'IDIQ integration, credit analysis, simulator, bureau communication',
        consolidated: ['CreditReportsHub', 'CreditAnalysisEngine', 'CreditSimulator', 'BusinessCredit', 'BureauCommunicationHub']
      },

      // HUB 3: DISPUTE MANAGEMENT (Consolidated: 4 items → 1 hub)
      {
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
        title: 'Communications',
        path: '/comms-hub',
        icon: MessageSquare,
        permission: 'user',
        badge: 'AI',
        description: 'Email, SMS, drip campaigns, call logs, templates',
        consolidated: ['CommunicationsHub', 'Emails', 'SMS', 'DripCampaigns', 'CallLogs', 'Templates', 'CampaignPlanner']
      },

      // HUB 5: DOCUMENTS & CONTRACTS (Consolidated: 12 items → 1 hub)
      {
        id: 'documents-contracts-hub',
        title: 'Documents & Contracts',
        path: '/documents-hub',
        icon: FolderOpen,
        permission: 'user',
        description: 'Document management, forms, templates, e-contracts, agreements',
        consolidated: ['DocumentsHub', 'Forms', 'Templates', 'EContracts', 'FullAgreement', 'Addendums', 'InformationSheet', 'DocumentCenter', 'DocumentStorage', 'ContractManagementHub']
      },

      // HUB 6: TASKS & PRODUCTIVITY (Consolidated: 6 items → 1 hub)
      {
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
      {
        id: 'automation-hub',
        title: 'Automation Hub',
        path: '/automation-hub',
        icon: Zap,
        permission: 'user',
        badge: 'PRO',
        description: 'Workflow automation and AI-powered tools'
      }
    ]
  },

  // ==========================================================================
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

      // WORKFLOW TESTING DASHBOARD (NEW)
      {
        id: 'workflow-testing-dashboard',
        title: 'Workflow Testing',
        path: '/workflow-testing',
        icon: Wrench,
        permission: 'admin',
        badge: 'AI',
        description: 'AI-powered workflow testing and debugging'
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
  }
];

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
// EXPORT DEFAULT
// ============================================================================

export default {
  navigationItems,
  ROLE_HIERARCHY,
  ROLES,
  hasPermission,
  isVisible,
  filterNavigationByRole,
  getAllNavigationItems,
  findNavigationItem
};
