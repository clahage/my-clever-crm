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
// NAVIGATION ITEMS - CONSOLIDATED 8-HUB ARCHITECTURE
// ============================================================================
// VERSION: 4.0 - CONSOLIDATED NAVIGATION (Phase 1 Complete)
// LAST UPDATED: 2025-12-10
// CONSOLIDATION: 65 hub files → 8 primary hubs
// ============================================================================

export const navigationItems = [
  // ==========================================================================
  // 🏠 DASHBOARD HUB - Analytics & Metrics Overview
  // ==========================================================================
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/smart-dashboard',
    icon: LayoutDashboard,
    permission: 'prospect',
    mobileHidden: false,
    description: 'Role-based analytics, metrics, and quick actions',
    category: 'core'
  },

  // ==========================================================================
  // 🏡 WELCOME HUB - Landing Page & Getting Started
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
  // 🎯 ADMIN COMMAND CENTER - Quick Admin Access
  // ==========================================================================
  {
    id: 'admin-portal',
    title: 'Admin Portal',
    path: '/portal',
    icon: Crown,
    permission: 'admin',
    mobileHidden: true,
    badge: 'ADMIN',
    description: '6-tab command center for system control',
    category: 'admin'
  },

  // ==========================================================================
  // 👤 CLIENT PORTAL - Client-Facing Dashboard
  // ==========================================================================
  {
    id: 'client-portal',
    title: 'Client Portal',
    path: '/client-portal',
    icon: User,
    permission: 'client',
    mobileHidden: false,
    badge: 'NEW',
    description: 'Client progress dashboard with scores, disputes, payments',
    category: 'client'
  },

  // ==========================================================================
  // 👥 HUB 1: CLIENTS HUB - Complete Client Management
  // ==========================================================================
  {
    id: 'clients-hub',
    title: 'Clients Hub',
    path: '/clients-hub',
    icon: Users,
    isGroup: true,
    permission: 'user',
    mobileHidden: false,
    badge: 'AI',
    description: 'Complete client management, onboarding, progress tracking',
    category: 'hubs',
    items: [
      { id: 'clients-overview', title: 'Overview', path: '/clients-hub', icon: LayoutDashboard, permission: 'user', description: 'Client dashboard and quick actions' },
      { id: 'clients-list', title: 'Client List', path: '/clients-hub/list', icon: Users, permission: 'user', description: 'All clients with search and filters' },
      { id: 'clients-onboarding', title: 'Onboarding', path: '/clients-hub/onboarding', icon: UserPlus, permission: 'user', description: 'Client intake and welcome wizard' },
      { id: 'clients-progress', title: 'Progress Tracking', path: '/clients-hub/progress', icon: TrendingUp, permission: 'user', description: 'Milestones and success metrics' },
      { id: 'clients-documents', title: 'Documents', path: '/clients-hub/documents', icon: FileText, permission: 'user', description: 'Client document management' },
      { id: 'clients-appointments', title: 'Appointments', path: '/clients-hub/appointments', icon: Calendar, permission: 'user', description: 'Scheduling and calendar' },
      { id: 'clients-tasks', title: 'Tasks', path: '/clients-hub/tasks', icon: CheckSquare, permission: 'user', description: 'Task management per client' },
      { id: 'clients-success', title: 'Client Success', path: '/clients-hub/success', icon: Award, permission: 'manager', description: 'Retention and success analytics' }
    ]
  },

  // ==========================================================================
  // 📧 HUB 2: COMMUNICATIONS HUB - Email, SMS, Marketing & Social
  // ==========================================================================
  {
    id: 'communications-hub',
    title: 'Communications Hub',
    path: '/comms-hub',
    icon: MessageSquare,
    isGroup: true,
    permission: 'user',
    mobileHidden: false,
    badge: 'AI',
    description: 'Email, SMS, campaigns, automation, social media, content & SEO',
    category: 'hubs',
    items: [
      { id: 'comms-email', title: 'Email Manager', path: '/comms-hub', icon: Mail, permission: 'user', description: 'Send and manage emails' },
      { id: 'comms-sms', title: 'SMS Manager', path: '/comms-hub/sms', icon: MessageSquare, permission: 'user', description: 'SMS messaging and automation' },
      { id: 'comms-templates', title: 'Templates', path: '/comms-hub/templates', icon: FileText, permission: 'user', description: 'Email and SMS templates' },
      { id: 'comms-campaigns', title: 'Marketing Campaigns', path: '/comms-hub/campaigns', icon: Target, permission: 'user', badge: 'AI', description: 'Multi-step email campaigns' },
      { id: 'comms-automation', title: 'Automation', path: '/comms-hub/automation', icon: Zap, permission: 'user', badge: 'PRO', description: 'Trigger-based automation' },
      { id: 'comms-social', title: 'Social Media', path: '/comms-hub/social', icon: Globe, permission: 'user', description: 'Social media management' },
      { id: 'comms-content', title: 'Content & SEO', path: '/comms-hub/content', icon: FileText, permission: 'user', badge: 'AI', description: 'Content creation and SEO' },
      { id: 'comms-landing', title: 'Landing Pages', path: '/comms-hub/landing', icon: Globe, permission: 'admin', badge: 'PRO', description: 'Website and landing pages' },
      { id: 'comms-reviews', title: 'Reviews & Reputation', path: '/comms-hub/reviews', icon: Star, permission: 'user', description: 'Reputation management' },
      { id: 'comms-push', title: 'Push Notifications', path: '/comms-hub/push', icon: Bell, permission: 'user', description: 'Mobile push notifications' },
      { id: 'comms-inbox', title: 'Inbox', path: '/comms-hub/inbox', icon: Inbox, permission: 'user', description: 'Unified communications inbox' },
      { id: 'comms-analytics', title: 'Analytics', path: '/comms-hub/analytics', icon: BarChart, permission: 'user', description: 'Communication metrics' }
    ]
  },

  // ==========================================================================
  // 🛡️ HUB 3: CREDIT HUB - Credit Reports, Monitoring & Disputes
  // ==========================================================================
  {
    id: 'credit-hub',
    title: 'Credit Hub',
    path: '/credit-hub',
    icon: Shield,
    isGroup: true,
    permission: 'client',
    mobileHidden: false,
    badge: 'AI',
    description: 'IDIQ integration, credit monitoring, disputes, bureau communication',
    category: 'hubs',
    items: [
      { id: 'credit-enrollment', title: 'IDIQ Enrollment', path: '/credit-hub', icon: UserPlus, permission: 'user', description: 'Enroll clients in IDIQ system' },
      { id: 'credit-reports', title: 'Credit Reports', path: '/credit-hub/reports', icon: FileText, permission: 'client', description: 'View credit reports' },
      { id: 'credit-monitoring', title: 'Credit Monitoring', path: '/credit-hub/monitoring', icon: Eye, permission: 'client', description: 'Real-time credit monitoring' },
      { id: 'credit-disputes', title: 'Dispute Management', path: '/credit-hub/disputes', icon: AlertCircle, permission: 'client', description: 'Create and track disputes' },
      { id: 'credit-disputes-admin', title: 'Dispute Admin', path: '/credit-hub/disputes-admin', icon: Shield, permission: 'admin', badge: 'ADMIN', description: 'Admin dispute panel' },
      { id: 'credit-bureau', title: 'Bureau Communication', path: '/credit-hub/bureau', icon: Send, permission: 'user', description: 'Bureau correspondence' },
      { id: 'credit-analysis', title: 'AI Analysis', path: '/credit-hub/analysis', icon: Brain, permission: 'client', badge: 'AI', description: 'AI-powered credit analysis' },
      { id: 'credit-workflow', title: 'Workflows', path: '/credit-hub/workflow', icon: GitBranch, permission: 'user', description: 'Credit report workflows' },
      { id: 'credit-control', title: 'Control Center', path: '/credit-hub/control', icon: LayoutDashboard, permission: 'admin', badge: 'ADMIN', description: 'IDIQ control center' }
    ]
  },

  // ==========================================================================
  // 💰 HUB 4: REVENUE HUB - Billing, Payments, Affiliates & Contracts
  // ==========================================================================
  {
    id: 'revenue-hub',
    title: 'Revenue Hub',
    path: '/revenue-hub',
    icon: DollarSign,
    isGroup: true,
    permission: 'admin',
    mobileHidden: true,
    badge: 'ADMIN',
    description: 'Revenue analytics, billing, payments, affiliates, contracts',
    category: 'hubs',
    items: [
      { id: 'revenue-dashboard', title: 'Revenue Dashboard', path: '/revenue-hub', icon: LayoutDashboard, permission: 'admin', description: 'Revenue metrics and forecasting' },
      { id: 'revenue-billing', title: 'Billing & Invoices', path: '/revenue-hub/billing', icon: Receipt, permission: 'admin', description: 'Invoicing and billing' },
      { id: 'revenue-payments', title: 'Payment Processing', path: '/revenue-hub/payments', icon: CreditCard, permission: 'admin', description: 'Payment integration and processing' },
      { id: 'revenue-collections', title: 'Collections & AR', path: '/revenue-hub/collections', icon: DollarSign, permission: 'admin', description: 'Collections management' },
      { id: 'revenue-contracts', title: 'Contract Management', path: '/revenue-hub/contracts', icon: FileText, permission: 'user', description: 'Contract lifecycle management' },
      { id: 'revenue-affiliates', title: 'Affiliates Program', path: '/revenue-hub/affiliates', icon: Handshake, permission: 'user', description: 'Affiliate partner management' },
      { id: 'revenue-referrals', title: 'Referral Engine', path: '/revenue-hub/referrals', icon: Users, permission: 'user', badge: 'PRO', description: 'Referral tracking and rewards' },
      { id: 'revenue-partnerships', title: 'Revenue Partnerships', path: '/revenue-hub/partnerships', icon: Handshake, permission: 'admin', description: 'Partnership revenue tracking' },
      { id: 'revenue-forecasting', title: 'Forecasting', path: '/revenue-hub/forecasting', icon: TrendingUp, permission: 'admin', badge: 'AI', description: 'AI revenue predictions' }
    ]
  },

  // ==========================================================================
  // 📊 HUB 5: ANALYTICS HUB - Business Intelligence & Predictive Analytics
  // ==========================================================================
  {
    id: 'analytics-hub',
    title: 'Analytics Hub',
    path: '/analytics-hub',
    icon: BarChart,
    isGroup: true,
    permission: 'user',
    mobileHidden: false,
    badge: 'AI',
    description: 'Executive dashboard, reports, AI insights, predictive analytics',
    category: 'hubs',
    items: [
      { id: 'analytics-executive', title: 'Executive Dashboard', path: '/analytics-hub', icon: LayoutDashboard, permission: 'manager', badge: 'AI', description: 'High-level business metrics' },
      { id: 'analytics-revenue', title: 'Revenue Analytics', path: '/analytics-hub/revenue', icon: DollarSign, permission: 'admin', description: 'Revenue performance analysis' },
      { id: 'analytics-clients', title: 'Client Analytics', path: '/analytics-hub/clients', icon: Users, permission: 'user', description: 'Client behavior and metrics' },
      { id: 'analytics-funnel', title: 'Conversion Funnel', path: '/analytics-hub/funnel', icon: GitBranch, permission: 'manager', badge: 'AI', description: 'Sales funnel optimization' },
      { id: 'analytics-performance', title: 'Performance KPIs', path: '/analytics-hub/performance', icon: Target, permission: 'manager', description: 'Key performance indicators' },
      { id: 'analytics-predictive', title: 'Predictive Analytics', path: '/analytics-hub/predictive', icon: Brain, permission: 'admin', badge: 'AI', description: 'AI predictions and forecasts' },
      { id: 'analytics-reports', title: 'Custom Reports', path: '/analytics-hub/reports', icon: FileText, permission: 'user', description: 'Build custom reports' },
      { id: 'analytics-mobile', title: 'Mobile Analytics', path: '/analytics-hub/mobile', icon: Smartphone, permission: 'admin', description: 'Mobile app analytics' },
      { id: 'analytics-engagement', title: 'Engagement', path: '/analytics-hub/engagement', icon: Activity, permission: 'user', description: 'User engagement metrics' },
      { id: 'analytics-ai', title: 'AI Insights', path: '/analytics-hub/ai', icon: Sparkles, permission: 'manager', badge: 'AI', description: 'AI-generated insights' },
      { id: 'analytics-goals', title: 'Goal Tracking', path: '/analytics-hub/goals', icon: Trophy, permission: 'manager', description: 'Business goals and targets' }
    ]
  },

  // ==========================================================================
  // ⚙️ HUB 6: ADMINISTRATION HUB - Settings, Users, Security & System
  // ==========================================================================
  {
    id: 'admin-hub',
    title: 'Administration Hub',
    path: '/settings-hub',
    icon: Settings,
    isGroup: true,
    permission: 'admin',
    mobileHidden: true,
    badge: 'ADMIN',
    description: 'Settings, user management, security, integrations, mobile apps',
    category: 'hubs',
    items: [
      { id: 'admin-general', title: 'General Settings', path: '/settings-hub', icon: Settings, permission: 'admin', description: 'System configuration' },
      { id: 'admin-users', title: 'User Management', path: '/settings-hub/users', icon: Users, permission: 'admin', description: 'Manage users and teams' },
      { id: 'admin-roles', title: 'Roles & Permissions', path: '/settings-hub/roles', icon: Shield, permission: 'admin', description: '8-level role hierarchy' },
      { id: 'admin-billing', title: 'Billing Settings', path: '/settings-hub/billing', icon: CreditCard, permission: 'admin', description: 'Subscription and billing' },
      { id: 'admin-integrations', title: 'Integrations', path: '/settings-hub/integrations', icon: Zap, permission: 'admin', description: 'Third-party integrations' },
      { id: 'admin-api', title: 'API Keys & Webhooks', path: '/settings-hub/api', icon: Key, permission: 'admin', description: 'API management' },
      { id: 'admin-security', title: 'Security & Compliance', path: '/settings-hub/security', icon: Lock, permission: 'admin', description: 'Security settings and compliance' },
      { id: 'admin-support', title: 'Support & Help Desk', path: '/settings-hub/support', icon: HelpCircle, permission: 'user', description: 'Support ticket management' },
      { id: 'admin-mobile', title: 'Mobile App Management', path: '/settings-hub/mobile', icon: Smartphone, permission: 'admin', badge: 'ADMIN', description: 'Mobile app configuration' },
      { id: 'admin-actions', title: 'Action Library', path: '/settings-hub/actions', icon: Zap, permission: 'admin', description: 'Automation action library' },
      { id: 'admin-system', title: 'System Configuration', path: '/settings-hub/system', icon: Database, permission: 'masterAdmin', description: 'Advanced system settings' },
      { id: 'admin-audit', title: 'Audit Logs', path: '/settings-hub/audit', icon: FileText, permission: 'admin', description: 'Security and activity logs' }
    ]
  },

  // ==========================================================================
  // 🎓 HUB 7: LEARNING HUB - Training, Courses, Certifications & Resources
  // ==========================================================================
  {
    id: 'learning-hub',
    title: 'Learning Hub',
    path: '/learning-hub',
    icon: GraduationCap,
    isGroup: true,
    permission: 'prospect',
    mobileHidden: false,
    badge: 'AI',
    description: 'Training courses, certifications, knowledge base, AI tutor',
    category: 'hubs',
    items: [
      { id: 'learning-dashboard', title: 'Learning Dashboard', path: '/learning-hub', icon: LayoutDashboard, permission: 'prospect', description: 'Your learning progress' },
      { id: 'learning-courses', title: 'Course Library', path: '/learning-hub/courses', icon: BookOpen, permission: 'prospect', description: 'Training courses and lessons' },
      { id: 'learning-live', title: 'Live Training', path: '/learning-hub/live', icon: Users, permission: 'user', description: 'Live training sessions' },
      { id: 'learning-quizzes', title: 'Quizzes & Assessments', path: '/learning-hub/quizzes', icon: CheckSquare, permission: 'prospect', description: 'Test your knowledge' },
      { id: 'learning-kb', title: 'Knowledge Base', path: '/learning-hub/kb', icon: BookOpen, permission: 'prospect', description: 'Help articles and guides' },
      { id: 'learning-resources', title: 'Resource Library', path: '/learning-hub/resources', icon: Archive, permission: 'prospect', description: 'Downloadable resources' },
      { id: 'learning-certs', title: 'Certifications', path: '/learning-hub/certifications', icon: Award, permission: 'user', description: 'Certification tracking' },
      { id: 'learning-paths', title: 'Learning Paths', path: '/learning-hub/paths', icon: GitBranch, permission: 'prospect', description: 'Role-based learning paths' },
      { id: 'learning-ai', title: 'AI Tutor', path: '/learning-hub/ai-tutor', icon: Brain, permission: 'prospect', badge: 'AI', description: 'Interactive AI chatbot tutor' },
      { id: 'learning-progress', title: 'Progress & Analytics', path: '/learning-hub/progress', icon: TrendingUp, permission: 'prospect', description: 'Track your learning' }
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
      { id: 'wl-branding', title: 'Branding', path: '/whitelabel/branding', icon: Brush, permission: 'masterAdmin', mobileHidden: true, description: 'Customize branding' },
      { id: 'wl-domains', title: 'Domains', path: '/whitelabel/domains', icon: Globe, permission: 'masterAdmin', mobileHidden: true, description: 'Manage domains' },
      { id: 'wl-plans', title: 'Plans & Billing', path: '/whitelabel/plans', icon: CreditCard, permission: 'masterAdmin', mobileHidden: true, description: 'Subscription plans' },
      { id: 'wl-tenants', title: 'Tenants', path: '/whitelabel/tenants', icon: Building2, permission: 'masterAdmin', mobileHidden: true, description: 'Multi-tenant management' }
    ]
  }
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