// src/layout/navConfig.js
// Complete navigation with Portal, Credit Workflow, and AI Reviews

import {
  // core
  Home, Settings,

  // people & org
  Users, User, Building, Building2, Globe, Handshake,

  // docs & data
  FileText, FileSpreadsheet, Archive, CheckSquare, Package, Database, Download, Upload,

  // comms
  MessageSquare, Mail, Phone, Bell, Zap, Calendar,

  // CRM / credit
  CreditCard, TrendingUp, Calculator, GitBranch, Layers, List, DollarSign,

  // analytics
  PieChart, BarChart, Target,

  // learning
  GraduationCap, BookOpen, Award,

  // misc UI / utilities
  MapPin, AlertCircle,

  // White Label & Mobile
  Palette, Brush, Smartphone, Info,

  // AI Tools
  Brain, Sparkles,

  // Business
  Briefcase,
  
  // NEW: Portal & Workflow
  LayoutDashboard,
  FileUp,
  ClipboardCheck
} from 'lucide-react';

export const navigationItems = [
  // --- Dashboard -------------------------------------------------------------
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/',
    icon: Home,
    permission: 'user'
  },

  // === NEW: ADMIN COMMAND CENTER =============================================
  {
    id: 'admin-portal',
    title: '🎯 Admin Portal',
    path: '/portal',
    icon: LayoutDashboard,
    permission: 'admin',
    badge: 'NEW',
    description: '6-tab command center for complete system control'
  },

  // === NEW: CREDIT REPORT WORKFLOW ===========================================
  {
    id: 'credit-workflow',
    title: 'Credit Report Workflow',
    path: '/credit-report-workflow',
    icon: FileUp,
    permission: 'admin',
    badge: 'NEW',
    description: 'IDIQ API, Manual Entry, PDF Upload'
  },

  // === NEW: AI REVIEW SYSTEM =================================================
  {
    id: 'ai-reviews',
    title: 'AI Review Dashboard',
    path: '/admin/ai-reviews',
    icon: Brain,
    permission: 'admin',
    badge: 'AI',
    description: 'Review, approve, and send AI-generated credit analysis'
  },

  // --- Contacts & CRM --------------------------------------------------------
  {
    id: 'contacts-group',
    title: 'Contacts & CRM',
    icon: Users,
    isGroup: true,
    defaultExpanded: false, // Changed from true to false!
    items: [
      { id: 'contacts',        title: 'All Contacts',      path: '/contacts',          icon: List,          permission: 'user' },
      { id: 'pipeline',        title: 'Pipeline',          path: '/pipeline',          icon: GitBranch,     permission: 'user', badge: 'NEW' },
      { id: 'import',          title: 'Import Contacts',   path: '/import',            icon: Upload,        permission: 'user' },
      { id: 'export',          title: 'Export Data',       path: '/export',            icon: Download,      permission: 'user' },
      { id: 'contact-reports', title: 'Contact Reports',   path: '/contact-reports',   icon: BarChart,      permission: 'user' },
      { id: 'segments',        title: 'Segments',          path: '/segments',          icon: Layers,        permission: 'user' }
    ]
  },

  // --- Credit Management -----------------------------------------------------
  {
    id: 'credit-group',
    title: 'Credit Management',
    icon: CreditCard,
    isGroup: true,
    defaultExpanded: false,
    items: [
      { id: 'credit-simulator',    title: 'Credit Simulator',       path: '/credit-simulator',      icon: Calculator,    permission: 'user', badge: 'NEW' },
      { id: 'business-credit',     title: 'Business Credit',        path: '/business-credit',       icon: Building,      permission: 'user', badge: 'PRO' },
      { id: 'credit-scores',       title: 'Credit Scores',          path: '/credit-scores',         icon: TrendingUp,    permission: 'user' },
      { id: 'dispute-letters',     title: 'Dispute Command Center', path: '/dispute-letters',       icon: FileText,      permission: 'user', description: 'AI Disputes + Telnyx Fax', badge: 'FAX' },
      { id: 'dispute-status',      title: 'Dispute Status',         path: '/dispute-status',        icon: AlertCircle,   permission: 'user' },
      { id: 'dispute-admin-panel', title: 'Dispute Admin Panel',    path: '/admin/dispute-admin-panel', icon: Settings,  permission: 'admin' },
      { id: 'credit-reports',      title: 'Credit Reports',         path: '/credit-reports',        icon: FileSpreadsheet, permission: 'user' },
      { id: 'credit-monitoring',   title: 'Monitoring',             path: '/credit-monitoring',     icon: AlertCircle,   permission: 'user' }
    ]
  },

  // === AI Intelligence =======================================================
  {
    id: 'ai-intelligence-group',
    title: '🧠 AI Intelligence',
    icon: Brain,
    isGroup: true,
    defaultExpanded: false,
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

  // --- Communication ---------------------------------------------------------
  {
    id: 'communication-group',
    title: 'Communication',
    icon: MessageSquare,
    isGroup: true,
    defaultExpanded: false,
    items: [
      { id: 'letters',       title: 'Letters',         path: '/letters',         icon: Mail,          permission: 'user' },
      { id: 'emails',        title: 'Emails',          path: '/emails',          icon: Mail,          permission: 'user' },
      { id: 'sms',           title: 'SMS',             path: '/sms',             icon: MessageSquare, permission: 'user' },
      { id: 'drip-campaigns',title: 'Drip Campaigns',  path: '/drip-campaigns',  icon: Zap,           permission: 'user' },
      { id: 'templates',     title: 'Templates',       path: '/templates',       icon: FileText,      permission: 'user' },
      { id: 'call-logs',     title: 'Call Logs',       path: '/call-logs',       icon: Phone,         permission: 'user' },
      { id: 'notifications', title: 'Notifications',   path: '/notifications',   icon: Bell,          permission: 'user' }
    ]
  },

  // --- Learning & Training ---------------------------------------------------
  {
    id: 'learning-group',
    title: 'Learning & Training',
    icon: GraduationCap,
    isGroup: true,
    defaultExpanded: false,
    items: [
      { id: 'learning-center', title: 'Learning Center', path: '/learning-center', icon: BookOpen, permission: 'user', badge: 'NEW', description: 'Courses, certifications, resources' },
      { id: 'achievements',    title: 'My Achievements', path: '/achievements',    icon: Award,    permission: 'user' },
      { id: 'certificates',    title: 'My Certificates', path: '/certificates',    icon: Award,    permission: 'user' }
    ]
  },

  // --- Documents -------------------------------------------------------------
  {
    id: 'documents-group',
    title: 'Documents',
    icon: FileText,
    isGroup: true,
    defaultExpanded: false,
    items: [
      { id: 'documents',          title: 'All Documents',     path: '/documents',           icon: FileText,       permission: 'user' },
      { id: 'econtracts',         title: 'E-Contracts',       path: '/econtracts',          icon: FileSpreadsheet, permission: 'user' },
      { id: 'forms',              title: 'Forms',             path: '/forms',               icon: CheckSquare,    permission: 'user' },
      { id: 'full-agreement',     title: 'Full Agreement',    path: '/full-agreement',      icon: FileText,       permission: 'user' },
      { id: 'information-sheet',  title: 'Information Sheet', path: '/information-sheet',   icon: FileText,       permission: 'user' },
      { id: 'power-of-attorney',  title: 'Power of Attorney', path: '/power-of-attorney',   icon: Settings,       permission: 'user' },
      { id: 'ach-authorization',  title: 'ACH Authorization', path: '/ach-authorization',   icon: CreditCard,     permission: 'user' },
      { id: 'addendums',          title: 'Addendums',         path: '/addendums',           icon: Layers,         permission: 'user' },
      { id: 'document-storage',   title: 'Document Storage',  path: '/document-storage',    icon: Archive,        permission: 'user' }
    ]
  },

  // --- Business Tools --------------------------------------------------------
  {
    id: 'business-group',
    title: 'Business Tools',
    icon: Briefcase,
    isGroup: true,
    defaultExpanded: false,
    items: [
      { id: 'companies', title: 'Companies', path: '/companies', icon: Building,   permission: 'user' },
      { id: 'location',  title: 'Locations', path: '/location',  icon: MapPin,     permission: 'user' },
      { id: 'invoices',  title: 'Invoices',  path: '/invoices',  icon: FileSpreadsheet, permission: 'user' },
      { id: 'affiliates',title: 'Affiliates',path: '/affiliates',icon: Globe,      permission: 'admin' },
      { id: 'billing',   title: 'Billing',    path: '/billing',   icon: DollarSign, permission: 'admin' },
      { id: 'products',  title: 'Products',   path: '/products',  icon: Package,    permission: 'admin' }
    ]
  },

  // --- Scheduling ------------------------------------------------------------
  {
    id: 'schedule-group',
    title: 'Scheduling',
    icon: Calendar,
    isGroup: true,
    defaultExpanded: false,
    items: [
      { id: 'calendar',    title: 'Calendar',    path: '/calendar',    icon: Calendar,   permission: 'user' },
      { id: 'appointments',title: 'Appointments',path: '/appointments',icon: Calendar,   permission: 'user' },
      { id: 'tasks',       title: 'Tasks',       path: '/tasks',       icon: CheckSquare,permission: 'user' },
      { id: 'reminders',   title: 'Reminders',   path: '/reminders',   icon: Bell,       permission: 'user' }
    ]
  },

  // --- Analytics & Reports ---------------------------------------------------
  {
    id: 'analytics-group',
    title: 'Analytics & Reports',
    icon: PieChart,
    isGroup: true,
    defaultExpanded: false,
    items: [
      { id: 'analytics', title: 'Analytics Dashboard', path: '/analytics', icon: BarChart, permission: 'user' },
      { id: 'reports',   title: 'Reports',             path: '/reports',   icon: FileText, permission: 'user' },
      { id: 'goals',     title: 'Goals',               path: '/goals',     icon: Target,   permission: 'user' }
    ]
  },

  // --- Resources -------------------------------------------------------------
  {
    id: 'resources-group',
    title: 'Resources',
    icon: BookOpen,
    isGroup: true,
    defaultExpanded: false,
    permission: 'user',
    items: [
      { id: 'articles', title: 'Articles', path: '/resources/articles', icon: FileText,   permission: 'user' },
      { id: 'faq',      title: 'FAQ',      path: '/resources/faq',      icon: AlertCircle, permission: 'user' }
    ]
  },

  // --- Mobile Apps -----------------------------------------------------------
  {
    id: 'mobile-apps-group',
    title: 'Mobile Apps',
    icon: Smartphone,
    isGroup: true,
    defaultExpanded: false,
    permission: 'admin',
    items: [
      { id: 'apps-overview',  title: 'Overview',       path: '/apps/overview',  icon: Info,       permission: 'admin' },
      { id: 'apps-employee',  title: 'Employee App',   path: '/apps/employee',  icon: Users,      permission: 'admin' },
      { id: 'apps-client',    title: 'Client App',     path: '/apps/client',    icon: User,       permission: 'admin' },
      { id: 'apps-affiliate', title: 'Affiliate App',  path: '/apps/affiliate', icon: Handshake,  permission: 'admin' }
    ]
  },

  // --- Administration --------------------------------------------------------
  {
    id: 'admin-group',
    title: 'Administration',
    icon: Settings,
    isGroup: true,
    defaultExpanded: false,
    items: [
      { id: 'settings',     title: 'Settings',         path: '/settings',        icon: Settings, permission: 'user' },
      { id: 'team',         title: 'Team Management',  path: '/team',            icon: Users,    permission: 'admin' },
      { id: 'document-center', title: 'Document Center', path: '/document-center', icon: FileText, permission: 'user', badge: 'AI' },
      { id: 'roles',        title: 'Roles & Permissions', path: '/roles',        icon: Settings, permission: 'admin' },
      { id: 'user-roles',   title: 'User Role Manager',  path: '/user-roles',    icon: Users,    permission: 'admin' },
      { id: 'integrations', title: 'Integrations',     path: '/integrations',    icon: Zap,      permission: 'admin' },
      { id: 'support',      title: 'Support',          path: '/support',         icon: AlertCircle, permission: 'user' },
      { id: 'system-map',   title: 'System Map',       path: '/system-map',      icon: Database, permission: 'admin' }
    ]
  },

  // --- White Label -----------------------------------------------------------
  {
    id: 'white-label-group',
    title: 'White Label',
    icon: Palette,
    isGroup: true,
    defaultExpanded: false,
    permission: 'admin',
    items: [
      { id: 'wl-branding', title: 'Branding',       path: '/whitelabel/branding', icon: Brush,      permission: 'admin' },
      { id: 'wl-domains',  title: 'Domains',        path: '/whitelabel/domains',  icon: Globe,      permission: 'admin' },
      { id: 'wl-plans',    title: 'Plans & Billing',path: '/whitelabel/plans',    icon: CreditCard, permission: 'admin' },
      { id: 'wl-tenants',  title: 'Tenants',        path: '/whitelabel/tenants',  icon: Building2,  permission: 'admin' }
    ]
  }
];

/**
 * Role-aware view of navigation
 */
export function filterNavigationByRole(items, userRole = 'user') {
  const canSee = (perm) => {
    if (!perm) return true;
    if (perm === 'user') return true;
    if (perm === 'admin') return userRole === 'admin' || userRole === 'masterAdmin';
    if (Array.isArray(perm)) return perm.includes(userRole);
    return false;
  };

  return items
    .map((item) => {
      if (!canSee(item.permission)) return null;

      if (item.isGroup && Array.isArray(item.items)) {
        const filtered = item.items.filter((sub) => canSee(sub.permission));
        if (filtered.length === 0) return null;
        return { ...item, items: filtered };
      }

      return { ...item };
    })
    .filter(Boolean);
}

export default navigationItems;