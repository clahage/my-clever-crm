// src/layout/navConfig.js
// COMPLETE NAVIGATION CONFIGURATION - VERSION 2.0
// REORGANIZED INTO LOGICAL SECTIONS - FIXED AUTO-EXPAND ISSUES
// LAST UPDATED: 2025-10-11

import {
  // ===== CORE =====
  Home, LayoutDashboard, Settings, Database,

  // ===== PEOPLE & ORGANIZATION =====
  Users, User, UserPlus, UserCheck, Building, Building2, Globe, Handshake,

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
    permission: 'user',
    description: 'Main overview and analytics'
  },

  // ==========================================================================
  // 🏡 HOME - WELCOME/LANDING PAGE
  // ==========================================================================
  {
    id: 'home',
    title: 'Home',
    path: '/home',
    icon: LayoutDashboard,
    permission: 'user',
    description: 'Welcome page with feature overview'
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
    badge: 'NEW',
    description: '6-tab command center for complete system control'
  },

  // ==========================================================================
  // 💼 CLIENT PORTAL
  // ==========================================================================
  {
    id: 'client-portal',
    title: '👤 Client Portal',
    path: '/client-portal',
    icon: User,
    permission: 'user',
    badge: 'NEW',
    description: 'Client progress dashboard with scores, disputes, payments'
  },

  // ==========================================================================
  // 📊 CREDIT REPORT WORKFLOW
  // ==========================================================================
  {
    id: 'credit-workflow',
    title: 'Credit Report Workflow',
    path: '/credit-report-workflow',
    icon: Upload,
    permission: 'admin',
    badge: 'NEW',
    description: 'IDIQ API, Manual Entry, PDF Upload'
  },

  // ==========================================================================
  // 🤖 AI REVIEW SYSTEM
  // ==========================================================================
  {
    id: 'ai-reviews',
    title: 'AI Review Dashboard',
    path: '/admin/ai-reviews',
    icon: Brain,
    permission: 'admin',
    badge: 'AI',
    description: 'Review, approve, and send AI-generated credit analysis'
  },

  // ==========================================================================
  // 👥 CONTACTS & CRM
  // ==========================================================================
  {
    id: 'contacts-group',
    title: 'Contacts & CRM',
    icon: Users,
    isGroup: true,
    defaultExpanded: false, // FIXED: No auto-expand
    permission: 'user',
    items: [
      { 
        id: 'contacts', 
        title: 'All Contacts', 
        path: '/contacts', 
        icon: List, 
        permission: 'user',
        description: 'Manage all client contacts'
      },
      { 
        id: 'pipeline', 
        title: 'Pipeline', 
        path: '/pipeline', 
        icon: GitBranch, 
        permission: 'user', 
        badge: 'NEW',
        description: 'Visual sales pipeline'
      },
      { 
        id: 'import', 
        title: 'Import Contacts', 
        path: '/import', 
        icon: Upload, 
        permission: 'user',
        description: 'Bulk import from CSV/Excel'
      },
      { 
        id: 'export', 
        title: 'Export Data', 
        path: '/export', 
        icon: Download, 
        permission: 'user',
        description: 'Export contacts and reports'
      },
      { 
        id: 'contact-reports', 
        title: 'Contact Reports', 
        path: '/contact-reports', 
        icon: BarChart, 
        permission: 'user',
        description: 'Analytics and insights'
      },
      { 
        id: 'segments', 
        title: 'Segments', 
        path: '/segments', 
        icon: Layers, 
        permission: 'user',
        description: 'Contact segmentation and filters'
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
    defaultExpanded: false, // FIXED: No auto-expand
    permission: 'user',
    items: [
      { 
        id: 'credit-simulator', 
        title: 'Credit Simulator', 
        path: '/credit-simulator', 
        icon: Calculator, 
        permission: 'user', 
        badge: 'NEW',
        description: 'Simulate score changes'
      },
      { 
        id: 'business-credit', 
        title: 'Business Credit', 
        path: '/business-credit', 
        icon: Building, 
        permission: 'user', 
        badge: 'PRO',
        description: 'Business credit building'
      },
      { 
        id: 'credit-scores', 
        title: 'Credit Scores', 
        path: '/credit-scores', 
        icon: TrendingUp, 
        permission: 'user',
        description: 'Track all 3 bureaus'
      },
      { 
        id: 'dispute-letters', 
        title: 'Dispute Command Center', 
        path: '/dispute-letters', 
        icon: FileText, 
        permission: 'user', 
        description: 'AI Disputes + Telnyx Fax', 
        badge: 'FAX'
      },
      { 
        id: 'dispute-status', 
        title: 'Dispute Status', 
        path: '/dispute-status', 
        icon: AlertCircle, 
        permission: 'user',
        description: 'Track dispute progress'
      },
      { 
        id: 'dispute-admin-panel', 
        title: 'Dispute Admin Panel', 
        path: '/admin/dispute-admin-panel', 
        icon: Settings, 
        permission: 'admin',
        description: 'Admin dispute management'
      },
      { 
        id: 'credit-reports', 
        title: 'Credit Reports', 
        path: '/credit-reports', 
        icon: FileSpreadsheet, 
        permission: 'user',
        description: 'View and analyze reports'
      },
      { 
        id: 'credit-monitoring', 
        title: 'Monitoring', 
        path: '/credit-monitoring', 
        icon: Eye, 
        permission: 'user',
        description: 'Real-time credit monitoring'
      }
    ]
  },

  // ==========================================================================
  // 🧠 AI INTELLIGENCE
  // ==========================================================================
  {
    id: 'ai-intelligence-group',
    title: '🧠 AI Intelligence',
    icon: Brain,
    isGroup: true,
    defaultExpanded: false, // FIXED: No auto-expand
    permission: 'admin',
    items: [
      { 
        id: 'credit-analysis', 
        title: 'Credit Analysis Engine', 
        path: '/credit-analysis', 
        icon: Brain, 
        permission: 'admin',
        badge: 'AI',
        description: 'AI-powered credit analysis and predictions'
      },
      { 
        id: 'predictive-analytics', 
        title: 'Predictive Analytics', 
        path: '/predictive-analytics', 
        icon: TrendingUp, 
        permission: 'admin',
        badge: 'NEW',
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
    defaultExpanded: false, // FIXED: No auto-expand
    permission: 'user',
    items: [
      { 
        id: 'letters', 
        title: 'Letters', 
        path: '/letters', 
        icon: Mail, 
        permission: 'user',
        description: 'Send physical mail'
      },
      { 
        id: 'emails', 
        title: 'Emails', 
        path: '/emails', 
        icon: Mail, 
        permission: 'user',
        description: 'Email campaigns'
      },
      { 
        id: 'sms', 
        title: 'SMS', 
        path: '/sms', 
        icon: MessageSquare, 
        permission: 'user',
        description: 'Text messaging'
      },
      { 
        id: 'drip-campaigns', 
        title: 'Drip Campaigns', 
        path: '/drip-campaigns', 
        icon: Zap, 
        permission: 'user',
        description: 'Automated sequences'
      },
      { 
        id: 'templates', 
        title: 'Templates', 
        path: '/templates', 
        icon: FileText, 
        permission: 'user',
        description: 'Message templates'
      },
      { 
        id: 'call-logs', 
        title: 'Call Logs', 
        path: '/call-logs', 
        icon: Phone, 
        permission: 'user',
        description: 'Track phone calls'
      },
      { 
        id: 'notifications', 
        title: 'Notifications', 
        path: '/notifications', 
        icon: Bell, 
        permission: 'user',
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
    defaultExpanded: false, // FIXED: No auto-expand
    permission: 'user',
    items: [
      { 
        id: 'learning-center', 
        title: 'Learning Center', 
        path: '/learning-center', 
        icon: BookOpen, 
        permission: 'user', 
        badge: 'NEW', 
        description: 'Courses, certifications, resources'
      },
      { 
        id: 'achievements', 
        title: 'My Achievements', 
        path: '/achievements', 
        icon: Award, 
        permission: 'user',
        description: 'Track your progress'
      },
      { 
        id: 'certificates', 
        title: 'My Certificates', 
        path: '/certificates', 
        icon: Trophy, 
        permission: 'user',
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
    defaultExpanded: false, // FIXED: No auto-expand
    permission: 'user',
    items: [
      { 
        id: 'documents', 
        title: 'All Documents', 
        path: '/documents', 
        icon: FileText, 
        permission: 'user',
        description: 'Document library'
      },
      { 
        id: 'econtracts', 
        title: 'E-Contracts', 
        path: '/econtracts', 
        icon: FileSpreadsheet, 
        permission: 'user',
        description: 'Digital contracts'
      },
      { 
        id: 'forms', 
        title: 'Forms', 
        path: '/forms', 
        icon: CheckSquare, 
        permission: 'user',
        description: 'Client intake forms'
      },
      { 
        id: 'full-agreement', 
        title: 'Full Agreement', 
        path: '/full-agreement', 
        icon: FileText, 
        permission: 'user',
        description: 'Service agreements'
      },
      { 
        id: 'information-sheet', 
        title: 'Information Sheet', 
        path: '/information-sheet', 
        icon: FileText, 
        permission: 'user',
        description: 'Client info sheets'
      },
      { 
        id: 'power-of-attorney', 
        title: 'Power of Attorney', 
        path: '/power-of-attorney', 
        icon: Shield, 
        permission: 'user',
        description: 'Legal authorizations'
      },
      { 
        id: 'ach-authorization', 
        title: 'ACH Authorization', 
        path: '/ach-authorization', 
        icon: CreditCard, 
        permission: 'user',
        description: 'Payment authorizations'
      },
      { 
        id: 'addendums', 
        title: 'Addendums', 
        path: '/addendums', 
        icon: Layers, 
        permission: 'user',
        description: 'Contract addendums'
      },
      { 
        id: 'document-storage', 
        title: 'Document Storage', 
        path: '/document-storage', 
        icon: Archive, 
        permission: 'user',
        description: 'File storage system'
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
    defaultExpanded: false, // FIXED: No auto-expand
    permission: 'user',
    items: [
      { 
        id: 'companies', 
        title: 'Companies', 
        path: '/companies', 
        icon: Building, 
        permission: 'user',
        description: 'Company management'
      },
      { 
        id: 'location', 
        title: 'Locations', 
        path: '/location', 
        icon: MapPin, 
        permission: 'user',
        description: 'Office locations'
      },
      { 
        id: 'invoices', 
        title: 'Invoices', 
        path: '/invoices', 
        icon: FileSpreadsheet, 
        permission: 'user',
        description: 'Billing and invoices'
      },
      { 
        id: 'affiliates', 
        title: 'Affiliates', 
        path: '/affiliates', 
        icon: Globe, 
        permission: 'admin',
        description: 'Affiliate program'
      },
      { 
        id: 'billing', 
        title: 'Billing', 
        path: '/billing', 
        icon: DollarSign, 
        permission: 'admin',
        description: 'Payment processing'
      },
      { 
        id: 'products', 
        title: 'Products', 
        path: '/products', 
        icon: Package, 
        permission: 'admin',
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
    defaultExpanded: false, // FIXED: No auto-expand
    permission: 'user',
    items: [
      { 
        id: 'calendar', 
        title: 'Calendar', 
        path: '/calendar', 
        icon: Calendar, 
        permission: 'user',
        description: 'Shared calendar'
      },
      { 
        id: 'appointments', 
        title: 'Appointments', 
        path: '/appointments', 
        icon: Calendar, 
        permission: 'user',
        description: 'Book appointments'
      },
      { 
        id: 'tasks', 
        title: 'Tasks', 
        path: '/tasks', 
        icon: CheckSquare, 
        permission: 'user',
        description: 'Task management'
      },
      { 
        id: 'reminders', 
        title: 'Reminders', 
        path: '/reminders', 
        icon: Bell, 
        permission: 'user',
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
    defaultExpanded: false, // FIXED: No auto-expand
    permission: 'user',
    items: [
      { 
        id: 'analytics', 
        title: 'Analytics Dashboard', 
        path: '/analytics', 
        icon: BarChart, 
        permission: 'user',
        description: 'Business analytics'
      },
      { 
        id: 'reports', 
        title: 'Reports', 
        path: '/reports', 
        icon: FileText, 
        permission: 'user',
        description: 'Generate reports'
      },
      { 
        id: 'goals', 
        title: 'Goals', 
        path: '/goals', 
        icon: Target, 
        permission: 'user',
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
    defaultExpanded: false, // FIXED: No auto-expand
    permission: 'user',
    items: [
      { 
        id: 'articles', 
        title: 'Articles', 
        path: '/resources/articles', 
        icon: FileText, 
        permission: 'user',
        description: 'Knowledge base'
      },
      { 
        id: 'faq', 
        title: 'FAQ', 
        path: '/resources/faq', 
        icon: HelpCircle, 
        permission: 'user',
        description: 'Frequently asked questions'
      }
    ]
  },

  // ==========================================================================
  // 📱 MOBILE APPS
  // ==========================================================================
  {
    id: 'mobile-apps-group',
    title: 'Mobile Apps',
    icon: Smartphone,
    isGroup: true,
    defaultExpanded: false, // FIXED: No auto-expand
    permission: 'admin',
    items: [
      { 
        id: 'apps-overview', 
        title: 'Overview', 
        path: '/apps/overview', 
        icon: Info, 
        permission: 'admin',
        description: 'Mobile app management'
      },
      { 
        id: 'apps-employee', 
        title: 'Employee App', 
        path: '/apps/employee', 
        icon: Users, 
        permission: 'admin',
        description: 'Internal team app'
      },
      { 
        id: 'apps-client', 
        title: 'Client App', 
        path: '/apps/client', 
        icon: User, 
        permission: 'admin',
        description: 'Client-facing app'
      },
      { 
        id: 'apps-affiliate', 
        title: 'Affiliate App', 
        path: '/apps/affiliate', 
        icon: Handshake, 
        permission: 'admin',
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
    defaultExpanded: false, // FIXED: No auto-expand
    permission: 'user',
    items: [
      { 
        id: 'settings', 
        title: 'Settings', 
        path: '/settings', 
        icon: Settings, 
        permission: 'user',
        description: 'User settings'
      },
      { 
        id: 'team', 
        title: 'Team Management', 
        path: '/team', 
        icon: Users, 
        permission: 'admin',
        description: 'Manage team members'
      },
      { 
        id: 'document-center', 
        title: 'Document Center', 
        path: '/document-center', 
        icon: FolderOpen, 
        permission: 'user', 
        badge: 'AI',
        description: 'Centralized document hub'
      },
      { 
        id: 'roles', 
        title: 'Roles & Permissions', 
        path: '/roles', 
        icon: Shield, 
        permission: 'admin',
        description: 'Role management'
      },
      { 
        id: 'user-roles', 
        title: 'User Role Manager', 
        path: '/user-roles', 
        icon: UserCheck, 
        permission: 'admin',
        description: 'Assign user roles'
      },
      { 
        id: 'integrations', 
        title: 'Integrations', 
        path: '/integrations', 
        icon: Zap, 
        permission: 'admin',
        description: 'Third-party integrations'
      },
      { 
        id: 'support', 
        title: 'Support', 
        path: '/support', 
        icon: HelpCircle, 
        permission: 'user',
        description: 'Get help'
      },
      { 
        id: 'system-map', 
        title: 'System Map', 
        path: '/system-map', 
        icon: Database, 
        permission: 'admin',
        description: 'View system architecture'
      }
    ]
  },

  // ==========================================================================
  // 🎨 WHITE LABEL
  // ==========================================================================
  {
    id: 'white-label-group',
    title: 'White Label',
    icon: Palette,
    isGroup: true,
    defaultExpanded: false, // FIXED: No auto-expand
    permission: 'admin',
    items: [
      { 
        id: 'wl-branding', 
        title: 'Branding', 
        path: '/whitelabel/branding', 
        icon: Brush, 
        permission: 'admin',
        description: 'Customize branding'
      },
      { 
        id: 'wl-domains', 
        title: 'Domains', 
        path: '/whitelabel/domains', 
        icon: Globe, 
        permission: 'admin',
        description: 'Manage domains'
      },
      { 
        id: 'wl-plans', 
        title: 'Plans & Billing', 
        path: '/whitelabel/plans', 
        icon: CreditCard, 
        permission: 'admin',
        description: 'Subscription plans'
      },
      { 
        id: 'wl-tenants', 
        title: 'Tenants', 
        path: '/whitelabel/tenants', 
        icon: Building2, 
        permission: 'admin',
        description: 'Multi-tenant management'
      }
    ]
  }
];

// ============================================================================
// ROLE-BASED NAVIGATION FILTER
// ============================================================================

/**
 * Filters navigation items based on user role and permissions
 * @param {Array} items - Navigation items to filter
 * @param {String} userRole - User's role (user, admin, masterAdmin)
 * @returns {Array} Filtered navigation items
 */
export function filterNavigationByRole(items, userRole = 'user') {
  const canSee = (perm) => {
    if (!perm) return true; // No permission required
    if (perm === 'user') return true; // Everyone can see 'user' items
    if (perm === 'admin') return userRole === 'admin' || userRole === 'masterAdmin';
    if (Array.isArray(perm)) return perm.includes(userRole);
    return false;
  };

  return items
    .map((item) => {
      // Check if user can see this item
      if (!canSee(item.permission)) return null;

      // If it's a group, filter its children
      if (item.isGroup && Array.isArray(item.items)) {
        const filteredItems = item.items.filter((sub) => canSee(sub.permission));
        
        // If no children are visible, hide the group
        if (filteredItems.length === 0) return null;
        
        return { ...item, items: filteredItems };
      }

      return { ...item };
    })
    .filter(Boolean); // Remove null items
}

export default navigationItems;