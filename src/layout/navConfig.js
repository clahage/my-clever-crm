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
  // 🎯 HYBRID HUBS - ALL BUSINESS FUNCTIONS
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
      {
        id: 'clients-hub',
        title: 'Clients Hub',
        path: '/clients-hub',
        icon: Users,
        permission: 'user',
        badge: 'AI',
        description: 'Complete client management with 7 tabs'
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
        id: 'marketing-hub',
        title: 'Marketing Hub',
        path: '/marketing-hub',
        icon: Zap,
        permission: 'user',
        badge: 'AI',
        description: 'Campaigns, content, social media'
      },
      {
        id: 'affiliates-hub',
        title: 'Affiliates Hub',
        path: '/affiliates-hub',
        icon: Handshake,
        permission: 'user',
        badge: 'PRO',
        description: 'Affiliate management and tracking'
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
        id: 'reports-hub',
        title: 'Reports Hub',
        path: '/reports-hub',
        icon: FileText,
        permission: 'user',
        description: 'Comprehensive business reports'
      },
      {
        id: 'analytics-hub',
        title: 'Analytics Hub',
        path: '/analytics-hub',
        icon: BarChart,
        permission: 'user',
        badge: 'AI',
        description: 'Business intelligence dashboard'
      },
      {
        id: 'dashboard-hub',
        title: 'Dashboard Hub',
        path: '/dashboard-hub',
        icon: LayoutDashboard,
        permission: 'user',
        description: 'Advanced dashboard features'
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
        id: 'tasks-hub',
        title: 'Tasks & Scheduling',
        path: '/tasks-hub',
        icon: Calendar,
        permission: 'user',
        description: 'Task and calendar management'
      },
      {
        id: 'learning-hub',
        title: 'Learning Hub',
        path: '/learning-hub',
        icon: GraduationCap,
        permission: 'user',
        description: 'Training and education center'
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
        id: 'compliance-hub',
        title: 'Compliance Hub',
        path: '/compliance-hub',
        icon: Shield,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Regulatory compliance tools'
      },
      {
        id: 'billing-hub',
        title: 'Billing Hub',
        path: '/billing-hub',
        icon: Receipt,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Invoice and payment management'
      },
      {
        id: 'payment-hub',
        title: 'Payment Integration',
        path: '/payment-hub',
        icon: CreditCard,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Payment processing integration'
      },
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
        id: 'dispute-hub',
        title: 'Dispute Admin',
        path: '/dispute-hub',
        icon: AlertCircle,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Dispute management panel'
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
        id: 'credit-simulator', 
        title: 'Credit Simulator', 
        path: '/credit-simulator', 
        icon: Calculator, 
        permission: 'client',
        mobileHidden: false,
        badge: 'AI',
        description: 'What-if score predictions'
      },
      { 
        id: 'business-credit', 
        title: 'Business Credit', 
        path: '/business-credit', 
        icon: Building, 
        permission: 'user',
        mobileHidden: true,
        badge: 'PRO',
        description: 'Business credit building'
      },
      { 
        id: 'credit-scores', 
        title: 'My Credit Scores', 
        path: '/credit-scores', 
        icon: TrendingUp, 
        permission: 'client',
        mobileHidden: false,
        description: 'View credit scores'
      },
      { 
        id: 'dispute-center', 
        title: 'Dispute Center', 
        path: '/dispute-letters', 
        icon: FileText, 
        permission: 'client',
        mobileHidden: false,
        badge: 'FAX',
        description: 'Manage disputes'
      },
      { 
        id: 'dispute-status', 
        title: 'Dispute Status', 
        path: '/dispute-status', 
        icon: Activity, 
        permission: 'client',
        mobileHidden: false,
        description: 'Track dispute progress'
      },
      { 
        id: 'admin-disputes', 
        title: 'Admin Dispute Panel', 
        path: '/admin/disputes', 
        icon: Shield, 
        permission: 'admin',
        mobileHidden: true,
        description: 'Manage all disputes'
      },
      { 
        id: 'credit-monitoring', 
        title: 'Credit Monitoring', 
        path: '/credit-monitoring', 
        icon: Eye, 
        permission: 'client',
        mobileHidden: false,
        badge: 'SOON',
        description: 'Monitor credit changes'
      },
      { 
        id: 'my-reports', 
        title: 'My Reports', 
        path: '/credit-reports', 
        icon: FileText, 
        permission: 'client',
        mobileHidden: false,
        description: 'View credit reports'
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
        id: 'comms-center', 
        title: 'Communications Center', 
        path: '/communications', 
        icon: Inbox, 
        permission: 'user',
        mobileHidden: true,
        badge: 'NEW',
        description: 'Unified inbox'
      },
      { 
        id: 'letters', 
        title: 'Letters', 
        path: '/letters', 
        icon: FileText, 
        permission: 'user',
        mobileHidden: true,
        description: 'Document generation'
      },
      { 
        id: 'emails', 
        title: 'Emails', 
        path: '/emails', 
        icon: Mail, 
        permission: 'user',
        mobileHidden: true,
        description: 'Email campaigns'
      },
      { 
        id: 'sms', 
        title: 'SMS', 
        path: '/sms', 
        icon: MessageSquare, 
        permission: 'user',
        mobileHidden: true,
        description: 'Text messaging'
      },
      { 
        id: 'drip-campaigns', 
        title: 'Drip Campaigns', 
        path: '/drip-campaigns', 
        icon: Zap, 
        permission: 'user',
        mobileHidden: true,
        description: 'Automated sequences'
      },
      { 
        id: 'templates', 
        title: 'Templates', 
        path: '/templates', 
        icon: FileText, 
        permission: 'user',
        mobileHidden: true,
        description: 'Communication templates'
      },
      { 
        id: 'call-logs', 
        title: 'Call Logs', 
        path: '/call-logs', 
        icon: Phone, 
        permission: 'user',
        mobileHidden: true,
        description: 'Phone call tracking'
      },
      { 
        id: 'notifications', 
        title: 'Notifications', 
        path: '/notifications', 
        icon: Bell, 
        permission: 'user',
        mobileHidden: false,
        description: 'Alerts and reminders'
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
        id: 'invoices', 
        title: 'Invoices', 
        path: '/invoices', 
        icon: Receipt, 
        permission: 'user',
        mobileHidden: true,
        description: 'Billing & invoices'
      },
      { 
        id: 'affiliates', 
        title: 'Affiliates', 
        path: '/affiliates', 
        icon: Handshake, 
        permission: 'user',
        mobileHidden: true,
        description: 'Partner program'
      },
      { 
        id: 'billing', 
        title: 'Billing', 
        path: '/billing', 
        icon: DollarSign, 
        permission: 'user',
        mobileHidden: true,
        description: 'Payment processing'
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
// MOBILE-SPECIFIC NAVIGATION
// ============================================================================

/**
 * Get mobile-optimized navigation for specific role
 * Returns simplified menu with only essential items
 */
export function getMobileNavigation(userRole) {
  const baseItems = [
    { id: 'dashboard', title: 'Home', path: '/dashboard', icon: Home },
  ];

  const roleSpecificItems = {
    masterAdmin: [
      { id: 'portal', title: 'Admin', path: '/portal', icon: LayoutDashboard },
      { id: 'contacts', title: 'Contacts', path: '/contacts', icon: Users },
      { id: 'credit-hub', title: 'Credit Hub', path: '/credit-hub', icon: Shield },
      { id: 'analytics', title: 'Analytics', path: '/analytics', icon: BarChart },
      { id: 'settings', title: 'Settings', path: '/settings', icon: Settings },
    ],
    admin: [
      { id: 'portal', title: 'Admin', path: '/portal', icon: LayoutDashboard },
      { id: 'contacts', title: 'Contacts', path: '/contacts', icon: Users },
      { id: 'credit-hub', title: 'Credit Hub', path: '/credit-hub', icon: Shield },
      { id: 'reports', title: 'Reports', path: '/reports', icon: FileText },
      { id: 'settings', title: 'Settings', path: '/settings', icon: Settings },
    ],
    manager: [
      { id: 'contacts', title: 'Contacts', path: '/contacts', icon: Users },
      { id: 'credit-hub', title: 'Credit Hub', path: '/credit-hub', icon: Shield },
      { id: 'pipeline', title: 'Pipeline', path: '/pipeline', icon: GitBranch },
      { id: 'reports', title: 'Reports', path: '/reports', icon: FileText },
      { id: 'settings', title: 'Settings', path: '/settings', icon: Settings },
    ],
    user: [
      { id: 'contacts', title: 'Contacts', path: '/contacts', icon: Users },
      { id: 'credit-hub', title: 'Credit Hub', path: '/credit-hub', icon: Shield },
      { id: 'tasks', title: 'Tasks', path: '/tasks', icon: CheckSquare },
      { id: 'calendar', title: 'Calendar', path: '/calendar', icon: Calendar },
      { id: 'settings', title: 'Settings', path: '/settings', icon: Settings },
    ],
    client: [
      { id: 'portal', title: 'My Portal', path: '/client-portal', icon: User },
      { id: 'credit-hub', title: 'My Credit', path: '/credit-hub', icon: Shield },
      { id: 'scores', title: 'Scores', path: '/credit-scores', icon: TrendingUp },
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
    affiliate: [
      { id: 'dashboard', title: 'Dashboard', path: '/affiliates', icon: Handshake },
      { id: 'referrals', title: 'Referrals', path: '/affiliates', icon: Users },
      { id: 'commissions', title: 'Earnings', path: '/affiliates', icon: DollarSign },
      { id: 'settings', title: 'Settings', path: '/settings', icon: Settings },
    ],
    viewer: [
      { id: 'reports', title: 'Reports', path: '/reports', icon: FileText },
      { id: 'analytics', title: 'Analytics', path: '/analytics', icon: BarChart },
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