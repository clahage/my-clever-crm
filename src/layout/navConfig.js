// src/layout/navConfig.js
// ENHANCED NAVIGATION CONFIGURATION - VERSION 3.0
// ROLE-BASED VISIBILITY + MOBILE OPTIMIZATION + ACCORDION SUPPORT
// LAST UPDATED: 2025-10-12

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
  
  // ==========================================================================
  // 👥 CONTACTS & CRM
  // ==========================================================================
  {
    id: 'contacts-group',
    title: 'Contacts & CRM',
    icon: Users,
    isGroup: true,
    permission: 'user', // Employees and up
    mobileHidden: false,
    category: 'crm',
    items: [
      { 
        id: 'contacts', 
        title: 'All Contacts', 
        path: '/contacts', 
        icon: List, 
        permission: 'user',
        mobileHidden: false,
        description: 'Manage all client contacts'
      },
      {
        id: 'email-workflows',
        title: 'Email Workflows',
        path: '/email-workflows',
        icon: Mail,
        permission: 'admin',
        mobileHidden: true,
        badge: 'AI',
        description: 'Automated email campaigns with AI personalization'
      },
      { 
        id: 'pipeline', 
        title: 'Sales Pipeline', 
        path: '/pipeline', 
        icon: GitBranch, 
        permission: 'user', 
        badge: 'NEW',
        mobileHidden: true,
        description: 'Visual sales pipeline'
      },
      { 
        id: 'import', 
        title: 'Import Contacts', 
        path: '/import', 
        icon: Upload, 
        permission: 'user',
        mobileHidden: true,
        description: 'Bulk import from CSV/Excel'
      },
      { 
        id: 'export', 
        title: 'Export Data', 
        path: '/export', 
        icon: Download, 
        permission: 'manager',
        mobileHidden: true,
        description: 'Export contacts and reports'
      },
      { 
        id: 'contact-reports', 
        title: 'Contact Reports', 
        path: '/contact-reports', 
        icon: BarChart, 
        permission: 'manager',
        mobileHidden: true,
        description: 'Analytics and insights'
      },
      { 
        id: 'segments', 
        title: 'Segments', 
        path: '/segments', 
        icon: Layers, 
        permission: 'user',
        mobileHidden: true,
        description: 'Contact segmentation and filters'
      }
      ,{
        id: 'client-intake',
        title: 'Client Intake',
        path: '/intake',
        icon: UserPlus,
        permission: 'user',
        mobileHidden: false,
        description: 'Full client intake form (UltimateClientForm)'
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
    permission: 'client', // Clients and employees
    mobileHidden: false,
    category: 'credit',
    items: [
      { 
        id: 'credit-simulator', 
        title: 'Credit Simulator', 
        path: '/credit-simulator', 
        icon: Calculator, 
        permission: 'client', 
        badge: 'AI',
        mobileHidden: false,
        description: 'Simulate score changes'
      },
      { 
        id: 'business-credit', 
        title: 'Business Credit', 
        path: '/business-credit', 
        icon: Building, 
        permission: 'client', 
        badge: 'PRO',
        mobileHidden: true,
        description: 'Business credit building'
      },
      { 
        id: 'credit-scores', 
        title: 'My Credit Scores', 
        path: '/credit-scores', 
        icon: TrendingUp, 
        permission: 'client',
        mobileHidden: false,
        description: 'Track all 3 bureaus'
      },
      { 
        id: 'dispute-letters', 
        title: 'Dispute Center', 
        path: '/dispute-letters', 
        icon: FileText, 
        permission: 'client', 
        mobileHidden: false,
        description: 'AI Disputes + Fax Integration', 
        badge: 'FAX'
      },
      { 
        id: 'dispute-status', 
        title: 'Dispute Status', 
        path: '/dispute-status', 
        icon: AlertCircle, 
        permission: 'client',
        mobileHidden: false,
        description: 'Track dispute progress'
      },
      { 
        id: 'dispute-admin-panel', 
        title: 'Admin Dispute Panel', 
        path: '/admin/dispute-admin-panel', 
        icon: Settings, 
        permission: 'admin',
        mobileHidden: true,
        description: 'Admin dispute management'
      },
      { 
        id: 'credit-reports', 
        title: 'My Reports', 
        path: '/credit-reports', 
        icon: FileSpreadsheet, 
        permission: 'client',
        mobileHidden: false,
        description: 'View and analyze reports'
      },
      { 
        id: 'credit-monitoring', 
        title: 'Credit Monitoring', 
        path: '/credit-monitoring', 
        icon: Eye, 
        permission: 'client',
        mobileHidden: false,
        description: 'Real-time credit monitoring'
      }
    ]
  },

  // 💳 IDIQ CREDIT MONITORING (AI-Powered)
  // ==========================================================================
  {
  id: 'idiq-group',
  title: 'IDIQ Monitoring',
  icon: Shield,
  isGroup: true,
  permission: 'client', // Clients can view their reports, staff can enroll
  mobileHidden: false,
  category: 'credit',
  badge: 'AI',
  items: [
    { 
      id: 'idiq-enroll', 
      title: 'Enroll Client', 
      path: '/idiq/enroll', 
      icon: UserPlus, 
      permission: 'user', // Staff only (roles 5-8)
      mobileHidden: false,
      badge: 'AI',
      description: 'AI-powered IDIQ enrollment with fraud detection'
    },
    { 
      id: 'idiq-reports', 
      title: 'Credit Reports', 
      path: '/credit-reports', 
      icon: FileText, 
      permission: 'client', // Clients + Staff (roles 3, 5-8)
      mobileHidden: false,
      description: 'View IDIQ credit reports with AI analysis'
    },
    { 
      id: 'idiq-dashboard', 
      title: 'IDIQ Dashboard', 
      path: '/idiq-dashboard', 
      icon: LayoutDashboard, 
      permission: 'user', // Staff only
      mobileHidden: false,
      badge: 'SOON',
      description: 'Monitor all IDIQ enrollments and status'
    }
  ]
},

  // ==========================================================================
  // 🧠 AI INTELLIGENCE (Admin Only)
  // ==========================================================================
  {
    id: 'ai-intelligence-group',
    title: '🧠 AI Intelligence',
    icon: Brain,
    isGroup: true,
    permission: 'admin',
    mobileHidden: true,
    category: 'ai',
    items: [
      { 
        id: 'credit-analysis', 
        title: 'Credit Analysis Engine', 
        path: '/credit-analysis', 
        icon: Brain, 
        permission: 'admin',
        badge: 'AI',
        mobileHidden: true,
        description: 'AI-powered credit analysis and predictions'
      },
      { 
        id: 'predictive-analytics', 
        title: 'Predictive Analytics', 
        path: '/predictive-analytics', 
        icon: TrendingUp, 
        permission: 'admin',
        badge: 'AI',
        mobileHidden: true,
        description: 'Revenue forecasting and churn prediction'
      }
    ]
  },

  // ==========================================================================
  // 💬 COMMUNICATION
  // ==========================================================================
  {
    id: 'communication-group',
    title: 'Communication',
    icon: MessageSquare,
    isGroup: true,
    permission: 'user',
    mobileHidden: false,
    category: 'communication',
    items: [
      { 
        id: 'letters', 
        title: 'Letters', 
        path: '/letters', 
        icon: Mail, 
        permission: 'user',
        mobileHidden: true,
        description: 'Send physical mail'
      },
      { 
        id: 'emails', 
        title: 'Emails', 
        path: '/emails', 
        icon: Mail, 
        permission: 'user',
        mobileHidden: false,
        description: 'Email campaigns'
      },
      { 
        id: 'sms', 
        title: 'SMS Messages', 
        path: '/sms', 
        icon: MessageSquare, 
        permission: 'user',
        mobileHidden: false,
        description: 'Text messaging'
      },
      { 
        id: 'communications', 
        title: 'Communications', 
        path: '/communications', 
        icon: MessageSquare, 
        visibleTo: ['admin','user'],
        mobileHidden: false,
        description: 'Unified communications center'
      },
      { 
        id: 'drip-campaigns', 
        title: 'Drip Campaigns', 
        path: '/drip-campaigns', 
        icon: Zap, 
        permission: 'manager',
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
        description: 'Message templates'
      },
      { 
        id: 'call-logs', 
        title: 'Call Logs', 
        path: '/call-logs', 
        icon: Phone, 
        permission: 'user',
        mobileHidden: false,
        description: 'Track phone calls'
      },
      { 
        id: 'notifications', 
        title: 'Notifications', 
        path: '/notifications', 
        icon: Bell, 
        permission: 'prospect',
        mobileHidden: false,
        description: 'System notifications'
      }
    ]
  },

  // ==========================================================================
  // 🎓 LEARNING & TRAINING
  // ==========================================================================
  {
    id: 'learning-group',
    title: 'Learning & Training',
    icon: GraduationCap,
    isGroup: true,
    permission: 'prospect', // Open to all
    mobileHidden: false,
    category: 'learning',
    items: [
      { 
        id: 'learning-center', 
        title: 'Learning Center', 
        path: '/learning-center', 
        icon: BookOpen, 
        permission: 'prospect', 
        badge: 'FREE', 
        mobileHidden: false,
        description: 'Courses, certifications, resources'
      },
      { 
        id: 'achievements', 
        title: 'My Achievements', 
        path: '/achievements', 
        icon: Award, 
        permission: 'client',
        mobileHidden: false,
        description: 'Track your progress'
      },
      { 
        id: 'certificates', 
        title: 'My Certificates', 
        path: '/certificates', 
        icon: Trophy, 
        permission: 'client',
        mobileHidden: false,
        description: 'Earned certificates'
      }
    ]
  },

  // ==========================================================================
  // 📄 DOCUMENTS
  // ==========================================================================
  {
    id: 'documents-group',
    title: 'Documents',
    icon: FileText,
    isGroup: true,
    permission: 'client',
    mobileHidden: false,
    category: 'documents',
    items: [
      { 
        id: 'document-center', 
        title: 'Document Hub', 
        path: '/document-center', 
        icon: FolderOpen, 
        permission: 'user',
        badge: 'AI',
        mobileHidden: true,
        description: 'AI-powered document management'
      },
      { 
        id: 'documents', 
        title: 'My Documents', 
        path: '/documents', 
        icon: FileText, 
        permission: 'client',
        mobileHidden: false,
        description: 'View and manage documents'
      },
      { 
        id: 'econtracts', 
        title: 'E-Contracts', 
        path: '/econtracts', 
        icon: FileSpreadsheet, 
        permission: 'client',
        mobileHidden: false,
        description: 'Digital contracts and agreements'
      },
      { 
        id: 'forms', 
        title: 'Forms', 
        path: '/forms', 
        icon: CheckSquare, 
        permission: 'client',
        mobileHidden: true,
        description: 'Client intake forms'
      },
      { 
        id: 'full-agreement', 
        title: 'Service Agreement', 
        path: '/full-agreement', 
        icon: FileText, 
        permission: 'client',
        mobileHidden: true,
        description: 'Credit repair service agreement'
      },
      { 
        id: 'information-sheet', 
        title: 'Client Information', 
        path: '/information-sheet', 
        icon: FileText, 
        permission: 'client',
        mobileHidden: true,
        description: 'Personal information form'
      },
      { 
        id: 'power-of-attorney', 
        title: 'Power of Attorney', 
        path: '/power-of-attorney', 
        icon: Shield, 
        permission: 'client',
        mobileHidden: true,
        description: 'Legal authorization (FCRA compliance)'
      },
      { 
        id: 'ach-authorization', 
        title: 'Payment Authorization', 
        path: '/ach-authorization', 
        icon: CreditCard, 
        permission: 'client',
        mobileHidden: true,
        description: 'ACH payment authorization'
      },
      { 
        id: 'addendums', 
        title: 'Contract Addendums', 
        path: '/addendums', 
        icon: Layers, 
        permission: 'client',
        mobileHidden: true,
        description: 'Contract modifications'
      },
      { 
        id: 'document-storage', 
        title: 'Document Storage', 
        path: '/document-storage', 
        icon: Archive, 
        permission: 'user',
        mobileHidden: true,
        description: 'File storage and archive'
      }
    ]
  },

  // ==========================================================================
  // 💼 BUSINESS TOOLS
  // ==========================================================================
  {
    id: 'business-group',
    title: 'Business Tools',
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
        icon: Building, 
        permission: 'user',
        mobileHidden: true,
        description: 'Company management'
      },
      { 
        id: 'location', 
        title: 'Locations', 
        path: '/location', 
        icon: MapPin, 
        permission: 'manager',
        mobileHidden: true,
        description: 'Office locations'
      },
      { 
        id: 'invoices', 
        title: 'Invoices', 
        path: '/invoices', 
        icon: FileSpreadsheet, 
        permission: 'client',
        mobileHidden: false,
        description: 'View invoices and billing'
      },
      { 
        id: 'affiliates', 
        title: 'Affiliate Program', 
        path: '/affiliates', 
        icon: Globe, 
        permission: 'affiliate',
        mobileHidden: false,
        description: 'Affiliate dashboard and commissions'
      },
      { 
        id: 'billing', 
        title: 'Billing Management', 
        path: '/billing', 
        icon: DollarSign, 
        permission: 'admin',
        mobileHidden: true,
        description: 'Payment processing and billing'
      },
      { 
        id: 'products', 
        title: 'Products', 
        path: '/products', 
        icon: Package, 
        permission: 'admin',
        mobileHidden: true,
        description: 'Product catalog'
      }
    ]
  },

  // ==========================================================================
  // 📅 SCHEDULING
  // ==========================================================================
  {
    id: 'schedule-group',
    title: 'Scheduling',
    icon: Calendar,
    isGroup: true,
    permission: 'client',
    mobileHidden: false,
    category: 'scheduling',
    items: [
      { 
        id: 'calendar', 
        title: 'Calendar', 
        path: '/calendar', 
        icon: Calendar, 
        permission: 'user',
        mobileHidden: false,
        description: 'Shared calendar'
      },
      { 
        id: 'appointments', 
        title: 'Appointments', 
        path: '/appointments', 
        icon: Calendar, 
        permission: 'client',
        mobileHidden: false,
        description: 'Book and manage appointments'
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
        permission: 'client',
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
    icon: BarChart3,
    isGroup: true,
    permission: 'manager',
    mobileHidden: true,
    category: 'analytics',
    items: [
      { 
        id: 'analytics', 
        title: 'Analytics Dashboard', 
        path: '/analytics', 
        icon: BarChart, 
        permission: 'manager',
        mobileHidden: true,
        description: 'Business analytics'
      },
      { 
        id: 'reports', 
        title: 'Reports', 
        path: '/reports', 
        icon: FileText, 
        permission: 'manager',
        mobileHidden: true,
        description: 'Generate reports'
      },
      { 
        id: 'goals', 
        title: 'Goals', 
        path: '/goals', 
        icon: Target, 
        permission: 'user',
        mobileHidden: false,
        description: 'Set and track goals'
      }
    ]
  },

  // ==========================================================================
  // 📚 RESOURCES
  // ==========================================================================
  {
    id: 'resources-group',
    title: 'Resources',
    icon: BookOpen,
    isGroup: true,
    permission: 'prospect', // Open to all
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
        description: 'Frequently asked questions'
      }
    ]
  },

  // ==========================================================================
  // 📱 MOBILE APPS (Admin Only)
  // ==========================================================================
  {
    id: 'mobile-apps-group',
    title: 'Mobile Apps',
    icon: Smartphone,
    isGroup: true,
    permission: 'admin',
    mobileHidden: true,
    category: 'admin',
    items: [
      { 
        id: 'apps-overview', 
        title: 'Overview', 
        path: '/apps/overview', 
        icon: Info, 
        permission: 'admin',
        mobileHidden: true,
        description: 'Mobile app management'
      },
      { 
        id: 'apps-employee', 
        title: 'Employee App', 
        path: '/apps/employee', 
        icon: Users, 
        permission: 'admin',
        mobileHidden: true,
        description: 'Internal team app'
      },
      { 
        id: 'apps-client', 
        title: 'Client App', 
        path: '/apps/client', 
        icon: User, 
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
      { id: 'idiq-enroll', title: 'IDIQ', path: '/idiq/enroll', icon: Shield },
      { id: 'analytics', title: 'Analytics', path: '/analytics', icon: BarChart },
      { id: 'settings', title: 'Settings', path: '/settings', icon: Settings },
    ],
    admin: [
      { id: 'portal', title: 'Admin', path: '/portal', icon: LayoutDashboard },
      { id: 'contacts', title: 'Contacts', path: '/contacts', icon: Users },
      { id: 'idiq-enroll', title: 'IDIQ', path: '/idiq/enroll', icon: Shield },
      { id: 'reports', title: 'Reports', path: '/reports', icon: FileText },
      { id: 'settings', title: 'Settings', path: '/settings', icon: Settings },
    ],
    manager: [
      { id: 'contacts', title: 'Contacts', path: '/contacts', icon: Users },
      { id: 'idiq-enroll', title: 'IDIQ', path: '/idiq/enroll', icon: Shield },
      { id: 'pipeline', title: 'Pipeline', path: '/pipeline', icon: GitBranch },
      { id: 'reports', title: 'Reports', path: '/reports', icon: FileText },
      { id: 'settings', title: 'Settings', path: '/settings', icon: Settings },
    ],
    user: [
      { id: 'contacts', title: 'Contacts', path: '/contacts', icon: Users },
      { id: 'idiq-enroll', title: 'IDIQ', path: '/idiq/enroll', icon: Shield },
      { id: 'tasks', title: 'Tasks', path: '/tasks', icon: CheckSquare },
      { id: 'calendar', title: 'Calendar', path: '/calendar', icon: Calendar },
      { id: 'settings', title: 'Settings', path: '/settings', icon: Settings },
    ],
    client: [
      { id: 'portal', title: 'My Portal', path: '/client-portal', icon: User },
      { id: 'idiq-report', title: 'My Credit', path: '/idiq/reports', icon: Shield },
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
