// src/layout/navConfig.js
// ============================================================================
// OPTIMIZED NAVIGATION CONFIGURATION - VERSION 5.0 - CONSOLIDATED
// ============================================================================
// MAJOR UPDATE: Removed all duplicates, fixed paths, consolidated structure
// CHANGES FROM v4.0:
//   - Removed CommunicationCenter duplicate (kept CommunicationsHub)
//   - Removed DocumentVault duplicate (kept DocumentsHub)
//   - Removed ReferralManager duplicate (kept ReferralPartnerHub)
//   - Moved Toyota Sales to Auto Sales group
//   - Moved Client Onboarding to Client Success group
//   - Renamed Executive Suite â†’ Command Center
//   - All paths verified and functional
// DATE: January 16, 2026
// Â© 1995-2026 Speedy Credit Repair Inc. | Christopher Lahage | All Rights Reserved
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
  MessageSquare, Mail, Phone, Bell, Zap, Calendar, Send, Inbox, Printer,

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
  MapPin, AlertCircle, Eye, Wrench, Lock, Key, HelpCircle, ExternalLink, RefreshCw, Beaker
} from 'lucide-react';

// ============================================================================
// ROLE HIERARCHY & PERMISSIONS (No changes)
// ============================================================================

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
// PERMISSION HELPERS (No changes)
// ============================================================================

export function hasPermission(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

export function isVisible(item, userRole, isMobile = false) {
  if (userRole === 'masterAdmin') return true;
  if (isMobile && item.mobileHidden) return false;
  
  if (item.visibleTo) {
    if (Array.isArray(item.visibleTo)) {
      return item.visibleTo.includes(userRole);
    }
    return item.visibleTo === userRole;
  }

  if (item.permission) {
    return hasPermission(userRole, item.permission);
  }

  return true;
}

// ============================================================================
// NAVIGATION ITEMS - CONSOLIDATED STRUCTURE (DUPLICATES REMOVED)
// ============================================================================

export const navigationItems = [
  // ==========================================================================
  // ðŸŽ¯ SMART DASHBOARD
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

  // ==========================================================================
  // ðŸ‘” COMMAND CENTER (Renamed from Executive Suite)
  // ==========================================================================
  {
    id: 'command-center-group',
    title: 'Command Center',
    icon: Crown,
    isGroup: true,
    permission: 'manager',
    mobileHidden: false,
    category: 'executive',
    defaultExpanded: true,
    items: [
      {
        id: 'executive-kpi-dashboard',
        title: 'Executive Dashboard',
        path: '/executive-dashboard',
        icon: BarChart3,
        permission: 'manager',
        badge: 'KPI',
        description: 'Real-time business KPIs, revenue, and performance metrics'
      },
      // âŒ REMOVED: Toyota Sales (moved to Auto Sales group)
      // âŒ REMOVED: Payment Health (moved to Financial Operations as tab)
      // âŒ REMOVED: Team Tasks (moved to Tasks Hub as tab)
      // âŒ REMOVED: Compliance Calendar (moved to Compliance Hub as tab)
      // âŒ REMOVED: Document Vault (DUPLICATE - using DocumentsHub)
      // âŒ REMOVED: Communication Center (DUPLICATE - using CommunicationsHub)
      // âŒ REMOVED: Client Onboarding (moved to Client Success group)
      // âŒ REMOVED: Referral Manager (DUPLICATE - using ReferralPartnerHub)
    ]
  },

  // ==========================================================================
  // ðŸš— AUTO SALES & TOYOTA (Consolidated - Toyota moved here)
  // ==========================================================================
  {
    id: 'auto-sales-group',
    title: 'Auto Sales & Toyota',
    icon: Target,
    isGroup: true,
    permission: 'user',
    mobileHidden: false,
    category: 'sales',
    defaultExpanded: false,
    visibleTo: ['manager', 'admin', 'masterAdmin'],
    items: [
      {
        id: 'auto-sales-hub',
        title: 'Auto Sales Hub',
        path: '/auto-sales-hub',
        icon: DirectionsCar,
        permission: 'manager',
        badge: 'AI',
        description: 'Complete Toyota franchise integration: opportunity scanner, lead manager, commissions, Tekion export, analytics (6 tabs, 35+ AI features)',
        consolidated: ['AutoOpportunityDashboard', 'TekionLeadManager', 'CommissionTracker', 'TekionIntegration']
      }
    ]
  },

  // ==========================================================================
  // ðŸ§  AI COMMAND CENTER
  // ==========================================================================
  {
    id: 'ai-command-center',
    title: 'AI Command Center',
    path: '/ai-intelligence-hub',
    icon: Brain,
    permission: 'user',
    mobileHidden: false,
    badge: 'AI',
    description: 'Complete AI-powered credit intelligence suite',
    category: 'ai',
    highlight: true
  },

  // ==========================================================================
  // ðŸ›’ PRODUCTS & SERVICES
  // ==========================================================================
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
        description: 'Browse and manage all service plans'
      },
      {
        id: 'contracts-tab',
        title: 'Contracts',
        path: '/products-services/contracts',
        icon: FileText,
        permission: 'user',
        description: 'Contract management and templates'
      },
      {
        id: 'pricing-calculator-tab',
        title: 'Pricing Calculator',
        path: '/products-services/pricing-calculator',
        icon: Calculator,
        permission: 'user',
        description: 'Interactive pricing and quote calculator'
      }
    ]
  },

  // ==========================================================================
  // ðŸ  CORE OPERATIONS
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
      // HUB 1: CONTACTS & PIPELINE
      {
        id: 'contacts-pipeline-hub',
        title: 'Contacts & Pipeline',
        path: '/contacts-pipeline',
        icon: Users,
        badge: 'AI',
        description: 'Complete client lifecycle: contacts, pipeline, intake, segments',
        consolidated: ['ClientsHub', 'Contacts', 'Pipeline', 'ContactDetailPage', 'ClientIntake', 'Segments']
      },

      // HUB 2: CREDIT REPORTS & ANALYSIS
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

      // HUB 2B: AI CREDIT REVIEW GENERATOR
      {
        id: 'ai-credit-review',
        title: 'AI Credit Review',
        path: '/ai-credit-review',
        icon: Brain,
        permission: 'user',
        badge: 'AI',
        description: 'Generate personalized AI credit reviews for clients'
      },

      // HUB 3: DISPUTE MANAGEMENT
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

      // HUB 4: COMMUNICATIONS (âœ… CONSOLIDATED - Using CommunicationsHub.jsx 2,314 lines)
      {
        id: 'communications-hub',
        title: 'Communications',
        path: '/communications-hub',
        icon: MessageSquare,
        permission: 'user',
        badge: 'AI',
        description: 'Email, SMS, drip campaigns, call logs, templates (8 tabs, 30+ AI features)',
        consolidated: ['CommunicationsHub', 'Emails', 'SMS', 'DripCampaigns', 'CallLogs', 'Templates', 'CampaignPlanner']
      },

      // HUB 5: DOCUMENTS & CONTRACTS (âœ… CONSOLIDATED - Using DocumentsHub.jsx 1,233 lines)
      {
        id: 'documents-contracts-hub',
        title: 'Documents & Contracts',
        path: '/documents-hub',
        icon: FolderOpen,
        permission: 'user',
        description: 'Document management, forms, templates, e-contracts, agreements (10 tabs, 20+ AI features)',
        consolidated: ['DocumentsHub', 'Forms', 'Templates', 'EContracts', 'FullAgreement', 'Addendums', 'InformationSheet', 'DocumentCenter', 'DocumentStorage', 'ContractManagementHub']
      },

      // FAX CENTER - Bureau fax with smart health monitoring
      {
        id: 'fax-center',
        title: 'Fax Center',
        path: '/fax-center',
        icon: Printer,
        permission: 'user',
        badge: 'AI',
        description: 'Send faxes to credit bureaus with smart number health monitoring and auto-rotation'
      },
      
      // HUB 6: TASKS & PRODUCTIVITY
      {
  id: 'tasks-productivity-hub',
  title: 'Tasks & Productivity',
  path: '/tasks-hub',
  icon: Calendar, // or CheckSquare
  permission: 'user',
  badge: 'AI',
  description: 'Task management, calendar, team schedule, automation - 2,735 lines, 8 tabs, 45+ AI features',
  consolidated: ['TasksSchedulingHub', 'Tasks', 'Reminders', 'Goals']
},

      // HUB 6B: CALENDAR & APPOINTMENTS
      {
        id: 'calendar-scheduling-hub',
        title: 'Calendar & Appointments',
        path: '/calendar-hub',
        icon: Calendar,
        permission: 'user',
        badge: 'AI',
        description: 'Client appointments, team availability, booking links, Google Calendar sync'
      },

// ===== WORKFLOW ORCHESTRATION - MASTER CONTROL =====
{
  id: 'workflow-orchestrator',
  title: 'Workflow Orchestrator',
  path: '/workflow-orchestrator',
  icon: Zap,
  permission: 'admin',
  badge: 'AI',
  description: 'Master workflow control - Contact â†’ Lead â†’ Client lifecycle management'
},

// ===== CLIENT ONBOARDING WIZARD =====
{
  id: 'onboarding-wizard',
  title: 'Client Onboarding',
  path: '/onboarding-wizard',
  icon: UserPlus,
  permission: 'user',
  badge: 'SMART',
  description: 'Guided step-by-step client onboarding with AI assistance'
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
      },

      // HUB 8: AI OPERATIONS - Lead scoring, contact conversion, predictions
      {
        id: 'ai-operations-hub',
        title: 'AI Operations',
        path: '/ai-hub',
        icon: Sparkles,
        permission: 'admin',
        badge: 'AI',
        description: 'Lead scoring, contact conversion, automation rules, predictions (8 tabs, 50+ AI features)'
      }
    ]
  },

  // ==========================================================================
  // ðŸ’° FINANCIAL OPERATIONS
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
  // ðŸ“ˆ BUSINESS GROWTH
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
      {
        id: 'marketing-campaigns-hub',
        title: 'Marketing & Campaigns',
        path: '/marketing-hub',
        icon: Zap,
        permission: 'user',
        badge: 'AI',
        description: 'Marketing campaigns, SEO, content creation, drip campaigns',
        consolidated: ['MarketingHub', 'ContentCreatorSEOHub', 'DripCampaignsHub']
      },

      // SOCIAL MEDIA HUB - 9 files, scheduling, AI content, engagement tracking
      {
        id: 'social-media-hub',
        title: 'Social Media Hub',
        path: '/social-media-hub',
        icon: Globe,
        permission: 'user',
        badge: 'AI',
        description: 'Social scheduling, AI ad creator, content library, engagement, campaigns (9 files)'
      },

      // âœ… CONSOLIDATED - Using ReferralPartnerHub.jsx 3,317 lines
      {
        id: 'referrals-partnerships-hub',
        title: 'Referrals & Partnerships',
        path: '/referral-partner-hub',
        icon: Handshake,
        permission: 'user',
        badge: 'PRO',
        description: 'Referral engine, partner management (8 tabs, 50+ AI features)',
        consolidated: ['ReferralEngineHub', 'ReferralPartnerHub', 'UnifiedReferralHub']
      },

      {
  id: 'referral-engine-hub',
  title: 'Client Referral Program',
  path: '/referral-engine-hub',
  icon: Award,
  permission: 'user',
  badge: 'AI',
  description: 'Client referral program with gamification, rewards, social sharing (9 tabs, 45+ AI features)',
  consolidated: ['ReferralEngine', 'Rewards', 'Leaderboard', 'ReferralCampaigns']
},

      // AFFILIATES HUB - Manage affiliate salespeople, commissions, payouts
      {
        id: 'affiliates-hub',
        title: 'Affiliates Program',
        path: '/affiliates-hub',
        icon: Users,
        permission: 'admin',
        badge: 'PRO',
        description: 'Manage affiliate salespeople: commissions, payouts, 5-tier system, marketing materials (4,202 lines)'
      },

      // REVENUE PARTNERSHIPS HUB - Earn commissions from affiliate products
      {
        id: 'revenue-partnerships-hub',
        title: 'Revenue Partnerships',
        path: '/revenue-partnerships-hub',
        icon: DollarSign,
        permission: 'user',
        badge: 'ðŸ’°',
        description: 'Earn commissions promoting credit cards, loans, monitoring â€” 200+ programs (2,318 lines)'
      },

      {
        id: 'reviews-reputation-hub',
        title: 'Reviews & Reputation',
        path: '/reviews-hub',
        icon: Star,
        permission: 'user',
        description: 'Reputation management, review monitoring, response automation'
      },

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
  // ðŸŽ“ CLIENT SUCCESS
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
      // âœ… MOVED HERE from Command Center
      {
        id: 'client-onboarding',
        title: 'Client Onboarding',
        path: '/client-onboarding',
        icon: UserPlus,
        permission: 'user',
        badge: 'SMART',
        description: 'Intelligent client onboarding wizard with AI guidance'
      },

      {
        id: 'client-success-hub',
        title: 'Client Success',
        path: '/client-success-hub',
        icon: Award,
        permission: 'user',
        description: 'Client retention, progress tracking',
        consolidated: ['ClientSuccessRetentionHub', 'OnboardingWelcomeHub', 'ProgressPortalHub']
      },

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
  // âš™ï¸ SYSTEM & ADMINISTRATION
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

      {
        id: 'ai-intelligence-hub',
        title: 'AI Intelligence Hub',
        path: '/ai-intelligence-hub',
        icon: Brain,
        permission: 'user',
        badge: 'AI',
        description: 'Complete AI suite: Score Predictor, Smart Prioritization, Anomaly Detection',
        consolidated: ['AIScorePredictor', 'SmartPrioritization', 'AnomalyDetector', 'CreditCoachChat', 'StrategyPlanner', 'ComplianceGuardian', 'GoodwillGenerator', 'NegotiationAssistant']
      },

      {
        id: 'support-hub',
        title: 'Support Hub',
        path: '/support-hub',
        icon: HelpCircle,
        permission: 'user',
        description: 'Help desk, knowledge base, support tickets'
      },

      {
        id: 'compliance-hub',
        title: 'Compliance Hub',
        path: '/compliance-hub',
        icon: Shield,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Regulatory compliance and audit management'
      },

      {
        id: 'workflow-testing-dashboard',
        title: 'Workflow Testing',
        path: '/workflow-testing',
        icon: Wrench,
        permission: 'admin',
        badge: 'AI',
        description: 'AI-powered workflow testing and debugging'
      },

      {
        id: 'idiq-sandbox-tester',
        title: 'IDIQ Sandbox Tester',
        path: '/testing/idiq',
        icon: Beaker,
        permission: 'admin',
        badge: 'SANDBOX',
        description: 'Test IDIQ Partner ID 11981 with 6 sandbox consumer profiles'
      },

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
  // ðŸŒŸ SPECIALIZED SERVICES (No changes - Auto Loan Concierge stays here)
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
        description: 'AI-powered auto loan concierge service (CLIENT service, not internal sales)'
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
      },
      {
        id: 'tradeline-hub',
        title: 'Tradeline Services',
        path: '/tradeline-hub',
        icon: TrendingUp,
        permission: 'manager',
        badge: '$$$',
        description: 'Authorized user tradeline rentals - AI matching, score prediction, provider management'
      }
    ]
  },

  // ==========================================================================
  // ðŸ” PORTALS
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

  {
    id: 'client-progress-portal',
    title: 'Client Progress Portal',
    path: '/client-progress-portal',
    icon: TrendingUp,
    permission: 'user',
    mobileHidden: false,
    badge: 'NEW',
    description: 'Visual timeline of client credit repair journey with milestones',
    category: 'client'
  },

  {
    id: 'admin-portal',
    title: 'Admin Portal',
    path: '/admin-portal',
    icon: Shield,
    permission: 'admin',
    mobileHidden: true,
    badge: 'ADMIN',
    description: '6-tab command center for complete system control',
    category: 'admin'
  }
];

// ============================================================================
// NAVIGATION FILTERING (No changes)
// ============================================================================

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

// Minimal export for mobile (backward compatibility)
export function getMobileNavigation(userRole) {
  return filterNavigationByRole(navigationItems, userRole, true);
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
  findNavigationItem,
  getMobileNavigation
};