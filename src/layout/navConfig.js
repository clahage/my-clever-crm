// src/layout/navConfig.js
// ============================================================================
<<<<<<< HEAD
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
  MapPin, AlertCircle, Eye, Wrench, Lock, Key, HelpCircle, ExternalLink, RefreshCw, PiggyBank
=======
// SPEEDYCRM NAVIGATION CONFIGURATION - VERSION 4.1
// ============================================================================
// FIXED: Role hierarchy now works properly (higher roles see lower role items)
// FIXED: All hubs now visible in navigation
// FIXED: getRoleLevel handles all role formats (string, numeric, etc.)
// LAST UPDATED: 2025-11-24
// ============================================================================

import {
  // CORE ICONS
  Home, 
  LayoutDashboard, 
  Settings, 
  Database, 
  Calendar,
  
  // PEOPLE & ORG ICONS
  Users, 
  User, 
  UserPlus, 
  Building2, 
  Handshake, 
  DollarSign,
  
  // DATA & DOCS ICONS
  FileText, 
  Archive,
  FolderOpen,
  
  // COMMUNICATION ICONS
  Mail,
  MessageSquare,
  Phone,
  
  // OTHER ICONS
  Shield, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Smartphone, 
  Palette, 
  Brush, 
  Globe, 
  CreditCard, 
  HelpCircle, 
  BarChart, 
  Zap, 
  AlertCircle, 
  TrendingUp, 
  Brain, 
  Crown, 
  Eye,
  Target,
  PieChart,
  Car,
  Scale,
  Briefcase,
  Clock,
  CheckSquare,
  RefreshCw
>>>>>>> 9bb51df (Complete hub architecture consolidation - Pipeline integrated into Clients Hub)
} from 'lucide-react';

// ============================================================================
// ROLE HIERARCHY - CRITICAL FOR PERMISSION CHECKS
// ============================================================================
// Higher numbers = more access. A user with level 8 can see everything
// a user with level 1-7 can see.

export const ROLE_HIERARCHY = {
  viewer: 1,
  prospect: 2,
  client: 3,
  affiliate: 4,
  user: 5,
  manager: 6,
  admin: 7,
  masteradmin: 8  // lowercase for normalization
};

// Also support numeric keys for direct lookup
const ROLE_LEVEL_MAP = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8,
  '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  viewer: 1,
  prospect: 2,
  client: 3,
  affiliate: 4,
  user: 5,
  employee: 5,
  manager: 6,
  admin: 7,
  administrator: 7,
  masteradmin: 8,
  masterAdmin: 8,
  master_admin: 8,
  'master-admin': 8,
  superadmin: 8,
  super_admin: 8,
  owner: 8
};

export const ROLES = {
  masterAdmin: {
    level: 8,
    label: 'Master Admin',
    description: 'Full system control',
    color: 'yellow',
    icon: Crown
  },
  admin: {
    level: 7,
    label: 'Administrator',
    description: 'Team leadership & management',
    color: 'red',
    icon: Shield
  },
  manager: {
    level: 6,
    label: 'Manager',
    description: 'Department oversight',
    color: 'purple',
    icon: Users
  },
  user: {
    level: 5,
    label: 'Employee',
    description: 'Daily operations',
<<<<<<< HEAD
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
=======
    color: 'blue',
    icon: User
  },
  affiliate: {
    level: 4,
    label: 'Affiliate Partner',
    description: 'Referral partner',
    color: 'cyan',
    icon: Handshake
  },
  client: {
    level: 3,
    label: 'Client',
    description: 'Active customer',
    color: 'green',
    icon: UserPlus
  },
  prospect: {
    level: 2,
    label: 'Prospect',
    description: 'Potential client',
    color: 'orange',
    icon: Target
  },
>>>>>>> 9bb51df (Complete hub architecture consolidation - Pipeline integrated into Clients Hub)
  viewer: {
    level: 1,
    label: 'Viewer',
    description: 'Read-only access',
    color: 'gray',
    icon: Eye
  }
};

// ============================================================================
// HELPER: Get role level from role name - HANDLES ALL FORMATS
// ============================================================================
const getRoleLevel = (role) => {
  // Handle null/undefined - default to viewer (1)
  if (role === null || role === undefined) {
    console.log('⚠️ getRoleLevel: null/undefined role, defaulting to 1');
    return 1;
  }
  
  // If it's already a number between 1-8, use it directly
  if (typeof role === 'number') {
    if (role >= 1 && role <= 8) {
      return role;
    }
    console.log('⚠️ getRoleLevel: numeric role out of range:', role);
    return 5; // Default to user level
  }
  
  // Convert to string and normalize
  const roleStr = String(role).toLowerCase().replace(/[-_ ]/g, '');
  
  // Check direct lookup first
  if (ROLE_LEVEL_MAP[roleStr] !== undefined) {
    return ROLE_LEVEL_MAP[roleStr];
  }
  
  // Check original (non-normalized) value
  if (ROLE_LEVEL_MAP[role] !== undefined) {
    return ROLE_LEVEL_MAP[role];
  }
  
  // Check ROLE_HIERARCHY
  if (ROLE_HIERARCHY[roleStr] !== undefined) {
    return ROLE_HIERARCHY[roleStr];
  }
  
  // Log unknown role and default to user (5)
  console.log('⚠️ getRoleLevel: Unknown role "' + role + '", defaulting to user (5)');
  return 5;
};

// ============================================================================
// CORE NAVIGATION ITEMS - ALL HUBS ORGANIZED BY CATEGORY
// ============================================================================
// Permission levels:
// - 'viewer' = everyone can see (level 1+)
// - 'prospect' = prospects and above (level 2+)
// - 'client' = clients and above (level 3+)
// - 'affiliate' = affiliates and above (level 4+)
// - 'user' = employees and above (level 5+)
// - 'manager' = managers and above (level 6+)
// - 'admin' = admins and master admins (level 7+)
// - 'masterAdmin' = master admin only (level 8)
// ============================================================================
// ============================================================================
export const navigationItems = [
<<<<<<< HEAD
=======
  // =========================================================================
  // SECTION 1: CORE DASHBOARD & OVERVIEW
  // =========================================================================
>>>>>>> 9bb51df (Complete hub architecture consolidation - Pipeline integrated into Clients Hub)
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
=======
    icon: Home,
    permission: 'viewer',
    description: 'Main dashboard overview'
  },

  // =========================================================================
  // SECTION 2: CLIENT MANAGEMENT GROUP
  // =========================================================================
>>>>>>> 9bb51df (Complete hub architecture consolidation - Pipeline integrated into Clients Hub)
  {
    id: 'client-management-group',
    title: 'Client Management',
    icon: Users,
    isGroup: true,
    permission: 'user',
    category: 'clients',
    items: [
      {
<<<<<<< HEAD
        id: 'clients-pipeline-hub',
        title: 'Clients & Pipeline',
        path: '/clients-hub',
        icon: Users,
        permission: 'user',
        badge: 'AI',
        description: 'Complete client & contact management'
      },
      {
            color: 'blue',
            icon: User
          },
          affiliate: {
            level: 4,
            label: 'Affiliate Partner',
            description: 'Referral partner',
            color: 'cyan',
            icon: Handshake
          },
          client: {
            level: 3,
            label: 'Client',
            description: 'Active customer',
            color: 'green',
            icon: UserPlus
          },
          prospect: {
            level: 2,
            label: 'Prospect',
            description: 'Potential client',
            color: 'orange',
            icon: Target
          },
      },
      {
        id: 'analytics-hub',
        title: 'Analytics',
        path: '/analytics-hub',
        icon: BarChart,
        permission: 'user',
        badge: 'AI',
        description: 'Reports, dashboards, insights'
      },
      {
        id: 'learning-hub',
        title: 'Learning & Resources',
        path: '/learning-hub',
        icon: GraduationCap,
        permission: 'user',
        description: 'Courses, guides, knowledge base'
      },
      {
        id: 'support-hub',
        title: 'Support',
        path: '/support-hub',
        icon: HelpCircle,
        permission: 'user',
        description: 'Support tickets, help center'
=======
        id: 'clients-hub',
        title: 'Contacts Hub',
        path: '/clients-hub',
        icon: Users,
        permission: 'user',
        description: 'All contacts & client management'
      },
      {
        id: 'pipeline',
        title: 'Sales Pipeline',
        path: '/clients-hub',
        icon: Target,
        permission: 'user',
        description: 'Lead pipeline & conversion'
      },
      {
        id: 'onboarding-hub',
        title: 'Onboarding Hub',
        path: '/onboarding-hub',
        icon: UserPlus,
        permission: 'user',
        description: 'Client onboarding workflows'
      },
      {
        id: 'client-success-hub',
        title: 'Client Success',
        path: '/client-success-hub',
        icon: Award,
        permission: 'manager',
        badge: 'PRO',
        description: 'Client retention & success tracking'
      }
    ]
  },

  // =========================================================================
  // SECTION 3: CREDIT & DISPUTES GROUP
  // =========================================================================
  {
    id: 'credit-disputes-group',
    title: 'Credit & Disputes',
    icon: Shield,
    isGroup: true,
    permission: 'user',
    category: 'credit',
    items: [
      {
        id: 'credit-hub',
        title: 'Credit Reports Hub',
        path: '/credit-hub',
        icon: Shield,
        permission: 'user',
        badge: 'IDIQ',
        description: 'IDIQ credit reports & analysis'
      },
      {
        id: 'dispute-hub',
        title: 'Disputes Hub',
        path: '/dispute-hub',
        icon: FileText,
        permission: 'user',
        badge: 'AI',
        description: 'Dispute management & letters'
      },
      {
        id: 'tradeline-hub',
        title: 'Tradeline Hub',
        path: '/tradeline-hub',
        icon: CreditCard,
        permission: 'manager',
        badge: 'PRO',
        description: 'Tradeline services & matching'
>>>>>>> 9bb51df (Complete hub architecture consolidation - Pipeline integrated into Clients Hub)
      },
      {
        id: 'financial-planning-hub',
        title: 'Financial Planning',
        path: '/financial-planning-hub',
<<<<<<< HEAD
        icon: PiggyBank,
        permission: 'user',
        badge: 'AI',
        description: 'Debt reduction & budget planning'
      },
      {
        id: 'tradeline-hub',
        title: 'Tradeline Services',
        path: '/tradeline-hub',
        icon: Award,
        permission: 'manager',
        badge: 'AI',
        description: 'Tradeline rental management'
=======
        icon: PieChart,
        permission: 'user',
        badge: 'AI',
        description: 'Debt payoff & budget planning'
      }
    ]
  },

  // =========================================================================
  // SECTION 4: COMMUNICATIONS GROUP
  // =========================================================================
  {
    id: 'communications-group',
    title: 'Communications',
    icon: Mail,
    isGroup: true,
    permission: 'user',
    category: 'comms',
    items: [
      {
        id: 'comms-hub',
        title: 'Communications Hub',
        path: '/comms-hub',
        icon: Mail,
        permission: 'user',
        description: 'Email, SMS & campaigns'
      },
      {
        id: 'marketing-hub',
        title: 'Marketing Hub',
        path: '/marketing-hub',
        icon: Target,
        permission: 'user',
        badge: 'AI',
        description: 'Marketing campaigns & SEO'
      }
    ]
  },

  // =========================================================================
  // SECTION 5: DOCUMENTS & CONTRACTS GROUP
  // =========================================================================
  {
    id: 'documents-group',
    title: 'Documents',
    icon: FolderOpen,
    isGroup: true,
    permission: 'user',
    category: 'docs',
    items: [
      {
        id: 'documents-hub',
        title: 'Documents Hub',
        path: '/documents-hub',
        icon: Archive,
        permission: 'user',
        description: 'Document storage & management'
      },
      {
        id: 'contracts-hub',
        title: 'Contracts Hub',
        path: '/contracts-hub',
        icon: FileText,
        permission: 'user',
        description: 'E-contracts & agreements'
      }
    ]
  },

  // =========================================================================
  // SECTION 6: SCHEDULING & TASKS GROUP
  // =========================================================================
  {
    id: 'scheduling-group',
    title: 'Scheduling',
    icon: Calendar,
    isGroup: true,
    permission: 'user',
    category: 'scheduling',
    items: [
      {
        id: 'calendar-hub',
        title: 'Calendar Hub',
        path: '/calendar-hub',
        icon: Calendar,
        permission: 'user',
        badge: 'AI',
        description: 'AI-powered calendar & scheduling'
      },
      {
        id: 'tasks-hub',
        title: 'Tasks Hub',
        path: '/tasks-hub',
        icon: CheckSquare,
        permission: 'user',
        description: 'Task management & reminders'
      }
    ]
  },

  // =========================================================================
  // SECTION 7: ANALYTICS & REPORTING GROUP
  // =========================================================================
  {
    id: 'analytics-group',
    title: 'Analytics & Reports',
    icon: BarChart,
    isGroup: true,
    permission: 'user',
    category: 'analytics',
    items: [
      {
        id: 'analytics-reporting-hub',
        title: 'Analytics Hub',
        path: '/analytics-reporting-hub',
        icon: BarChart,
        permission: 'user',
        badge: 'AI',
        description: 'Business intelligence & reports'
      },
      {
        id: 'ai-hub',
        title: 'AI Super Hub',
        path: '/ai-hub',
        icon: Brain,
        permission: 'user',
        badge: 'AI',
        description: 'AI-powered tools & insights'
      }
    ]
  },

  // =========================================================================
  // SECTION 8: BILLING & REVENUE GROUP
  // =========================================================================
  {
    id: 'billing-group',
    title: 'Billing & Revenue',
    icon: DollarSign,
    isGroup: true,
    permission: 'user',
    category: 'billing',
    items: [
      {
        id: 'billing-payments-hub',
        title: 'Billing Hub',
        path: '/billing-payments-hub',
        icon: DollarSign,
        permission: 'user',
        description: 'Invoices & payments'
>>>>>>> 9bb51df (Complete hub architecture consolidation - Pipeline integrated into Clients Hub)
      },
      {
        id: 'revenue-hub',
        title: 'Revenue Hub',
        path: '/revenue-hub',
<<<<<<< HEAD
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
=======
        icon: TrendingUp,
        permission: 'manager',
        badge: 'PRO',
        description: 'Revenue tracking & analytics'
      },
      {
        id: 'revenue-partnerships-hub',
        title: 'Revenue Partnerships',
        path: '/revenue-partnerships-hub',
        icon: Handshake,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Partnership revenue tracking'
      }
    ]
  },

  // =========================================================================
  // SECTION 9: AUTOMATION GROUP
  // =========================================================================
  {
    id: 'automation-group',
    title: 'Automation',
    icon: Zap,
    isGroup: true,
    permission: 'user',
    category: 'automation',
    items: [
      {
        id: 'automation-hub',
        title: 'Automation Hub',
        path: '/automation-hub',
        icon: Zap,
        permission: 'user',
        badge: 'PRO',
        description: 'Workflow automation'
      }
    ]
  },

  // =========================================================================
  // SECTION 10: AFFILIATES & REFERRALS GROUP
  // =========================================================================
  {
    id: 'affiliates-group',
    title: 'Affiliates',
    icon: Handshake,
    isGroup: true,
    permission: 'affiliate',
    category: 'affiliates',
    items: [
      {
        id: 'affiliates-hub',
        title: 'Affiliates Hub',
        path: '/affiliates-hub',
        icon: Handshake,
        permission: 'affiliate',
        description: 'Affiliate management'
      },
      {
        id: 'referral-partner-hub',
        title: 'Referral Partners',
        path: '/referral-partner-hub',
        icon: Users,
        permission: 'user',
        description: 'Referral partner management'
      }
    ]
  },

  // =========================================================================
  // SECTION 11: LEARNING & TRAINING GROUP
  // =========================================================================
  {
    id: 'learning-group',
    title: 'Learning',
    icon: GraduationCap,
    isGroup: true,
    permission: 'prospect',
    category: 'learning',
    items: [
      {
        id: 'learning-hub',
        title: 'Learning Hub',
        path: '/learning-hub',
        icon: GraduationCap,
        permission: 'prospect',
        description: 'Training & education'
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
        id: 'certification-hub',
        title: 'Certification System',
        path: '/certification-hub',
        icon: Award,
        permission: 'user',
        description: 'Certification & accreditation'
      },
      {
        id: 'resources-hub',
        title: 'Resource Library',
        path: '/resources-hub',
        icon: Archive,
        permission: 'prospect',
        description: 'Knowledge base & resources'
      }
    ]
  },

  // =========================================================================
  // SECTION 12: CLIENT PORTAL HUBS (Visible to clients and above)
  // =========================================================================
  {
    id: 'client-portal-group',
    title: 'My Portal',
    icon: User,
    isGroup: true,
    permission: 'client',
    category: 'portal',
    items: [
      {
        id: 'progress-portal-hub',
        title: 'My Progress',
        path: '/progress-portal-hub',
        icon: TrendingUp,
        permission: 'client',
        description: 'Track your credit repair progress'
      },
      {
        id: 'rental-boost-hub',
        title: 'Rental Boost',
        path: '/rental-boost-hub',
        icon: Home,
        permission: 'client',
        badge: 'AI',
        description: 'AI-powered rental preparation'
      },
      {
        id: 'mortgage-readiness-hub',
        title: 'Mortgage Ready',
        path: '/mortgage-readiness-hub',
        icon: Building2,
        permission: 'client',
        badge: 'AI',
        description: '90-day mortgage accelerator'
      },
      {
        id: 'auto-loan-hub',
        title: 'Auto Loans',
        path: '/auto-loan-hub',
        icon: Car,
        permission: 'client',
        badge: 'AI',
        description: 'AI auto loan concierge'
      },
      {
        id: 'credit-emergency-hub',
        title: 'Credit Emergency',
        path: '/credit-emergency-hub',
        icon: AlertCircle,
        permission: 'client',
        badge: 'URGENT',
        description: '7-14 day rapid repair'
      },
      {
        id: 'attorney-network-hub',
        title: 'Attorney Network',
        path: '/attorney-network-hub',
        icon: Scale,
        permission: 'client',
        badge: 'LEGAL',
        description: 'FCRA/FDCPA violation cases'
      },
      {
        id: 'certification-academy-hub',
        title: 'Certification Academy',
        path: '/certification-academy-hub',
        icon: GraduationCap,
        permission: 'client',
        badge: 'PRO',
        description: 'Professional certification'
      }
    ]
  },

  // =========================================================================
  // SECTION 13: COMPLIANCE & LEGAL GROUP
  // =========================================================================
  {
    id: 'compliance-group',
    title: 'Compliance',
    icon: Shield,
    isGroup: true,
    permission: 'manager',
    category: 'compliance',
    items: [
      {
        id: 'compliance-hub',
        title: 'Compliance Hub',
        path: '/compliance-hub',
        icon: Shield,
        permission: 'manager',
        badge: 'LEGAL',
        description: 'Regulatory compliance'
      }
    ]
  },

  // =========================================================================
  // SECTION 14: SUPPORT GROUP
  // =========================================================================
  {
    id: 'support-group',
    title: 'Support',
    icon: HelpCircle,
    isGroup: true,
    permission: 'viewer',
    category: 'support',
    items: [
      {
        id: 'support-hub',
        title: 'Support Hub',
        path: '/support-hub',
        icon: HelpCircle,
        permission: 'viewer',
        description: 'Help desk & support'
      }
    ]
  },

  // =========================================================================
  // SECTION 15: ADMINISTRATION GROUP (Admin only)
  // =========================================================================
  {
    id: 'admin-group',
    title: 'Administration',
    icon: Settings,
    isGroup: true,
    permission: 'admin',
    mobileHidden: true,
    category: 'admin',
    items: [
      {
        id: 'settings-hub',
        title: 'Settings Hub',
        path: '/settings-hub',
        icon: Settings,
>>>>>>> 9bb51df (Complete hub architecture consolidation - Pipeline integrated into Clients Hub)
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Admin dispute management'
      },
      {
<<<<<<< HEAD
        id: 'compliance-hub',
        title: 'Compliance Hub',
        path: '/compliance-hub',
        icon: Shield,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Regulatory compliance'
      }
    ]
  },
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
        id: 'support',
        title: 'Support',
        path: '/support',
        icon: HelpCircle,
        permission: 'prospect',
        mobileHidden: false,
        description: 'Get help'
=======
        id: 'mobile-app-hub',
        title: 'Mobile App Hub',
        path: '/mobile-app-hub',
        icon: Smartphone,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Mobile app management'
>>>>>>> 9bb51df (Complete hub architecture consolidation - Pipeline integrated into Clients Hub)
      },
      {
        id: 'system-map',
        title: 'System Map',
        path: '/system-map',
        icon: Database,
        permission: 'admin',
<<<<<<< HEAD
        mobileHidden: true,
        description: 'View system architecture'
      }
    ]
  },
=======
        description: 'View system architecture'
      },
      {
        id: 'dispute-admin',
        title: 'Dispute Admin',
        path: '/dispute-admin',
        icon: FileText,
        permission: 'admin',
        badge: 'ADMIN',
        description: 'Dispute administration panel'
      }
    ]
  },

  // =========================================================================
  // SECTION 16: WHITE LABEL GROUP (Admin/MasterAdmin only)
  // =========================================================================
>>>>>>> 9bb51df (Complete hub architecture consolidation - Pipeline integrated into Clients Hub)
  {
    id: 'white-label-group',
    title: 'White Label',
    icon: Palette,
    isGroup: true,
    permission: 'admin',
    mobileHidden: true,
    category: 'whitelabel',
    items: [
      {
<<<<<<< HEAD
        id: 'wl-branding',
        title: 'Branding',
        path: '/whitelabel/branding',
        icon: Brush,
        permission: 'masterAdmin',
        mobileHidden: true,
=======
        id: 'white-label-crm-hub',
        title: 'White Label CRM',
        path: '/white-label-crm-hub',
        icon: Building2,
        permission: 'admin',
        badge: 'PRO',
        description: 'CRM licensing & partners'
      },
      {
        id: 'wl-branding',
        title: 'Branding',
        path: '/settings-hub?tab=branding',
        icon: Brush,
        permission: 'admin',
>>>>>>> 9bb51df (Complete hub architecture consolidation - Pipeline integrated into Clients Hub)
        description: 'Customize branding'
      },
      {
        id: 'wl-domains',
        title: 'Domains',
<<<<<<< HEAD
        path: '/whitelabel/domains',
        icon: Globe,
        permission: 'masterAdmin',
        mobileHidden: true,
=======
        path: '/settings-hub?tab=domains',
        icon: Globe,
        permission: 'admin',
>>>>>>> 9bb51df (Complete hub architecture consolidation - Pipeline integrated into Clients Hub)
        description: 'Manage domains'
      },
      {
        id: 'wl-plans',
        title: 'Plans & Billing',
<<<<<<< HEAD
        path: '/whitelabel/plans',
        icon: CreditCard,
        permission: 'masterAdmin',
        mobileHidden: true,
=======
        path: '/settings-hub?tab=plans',
        icon: CreditCard,
        permission: 'admin',
>>>>>>> 9bb51df (Complete hub architecture consolidation - Pipeline integrated into Clients Hub)
        description: 'Subscription plans'
      },
      {
        id: 'wl-tenants',
        title: 'Tenants',
<<<<<<< HEAD
        path: '/whitelabel/tenants',
        icon: Building2,
        permission: 'masterAdmin',
        mobileHidden: true,
=======
        path: '/settings-hub?tab=tenants',
        icon: Building2,
        permission: 'admin',
>>>>>>> 9bb51df (Complete hub architecture consolidation - Pipeline integrated into Clients Hub)
        description: 'Multi-tenant management'
      }
    ]
  }
];
// End of navigationItems export. All code below this line was removed to ensure only one valid export and no orphaned fragments remain.

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
// ROLE-SPECIFIC BASE NAVIGATION (Quick access items per role)
// ============================================================================

export const roleSpecificItems = {
  masterAdmin: [
    { id: 'dashboard', title: 'Dashboard', path: '/smart-dashboard', icon: Home },
    { id: 'contacts', title: 'Contacts', path: '/clients-hub', icon: Users },
    { id: 'credit-hub', title: 'Credit Hub', path: '/credit-hub', icon: Shield },
    { id: 'disputes', title: 'Disputes', path: '/dispute-hub', icon: FileText },
    { id: 'analytics', title: 'Analytics', path: '/analytics-reporting-hub', icon: BarChart },
    { id: 'settings', title: 'Settings', path: '/settings-hub', icon: Settings },
  ],
  admin: [
    { id: 'dashboard', title: 'Dashboard', path: '/smart-dashboard', icon: Home },
    { id: 'contacts', title: 'Contacts', path: '/clients-hub', icon: Users },
    { id: 'credit-hub', title: 'Credit Hub', path: '/credit-hub', icon: Shield },
    { id: 'disputes', title: 'Disputes', path: '/dispute-hub', icon: FileText },
    { id: 'analytics', title: 'Analytics', path: '/analytics-reporting-hub', icon: BarChart },
    { id: 'settings', title: 'Settings', path: '/settings-hub', icon: Settings },
  ],
  manager: [
    { id: 'dashboard', title: 'Dashboard', path: '/smart-dashboard', icon: Home },
    { id: 'contacts', title: 'Contacts', path: '/clients-hub', icon: Users },
    { id: 'credit-hub', title: 'Credit Hub', path: '/credit-hub', icon: Shield },
    { id: 'analytics', title: 'Analytics', path: '/analytics-reporting-hub', icon: BarChart },
    { id: 'tasks', title: 'Tasks', path: '/tasks-hub', icon: CheckSquare },
  ],
  user: [
    { id: 'dashboard', title: 'Dashboard', path: '/smart-dashboard', icon: Home },
    { id: 'contacts', title: 'Contacts', path: '/clients-hub', icon: Users },
    { id: 'credit-hub', title: 'Credit Hub', path: '/credit-hub', icon: Shield },
    { id: 'tasks', title: 'Tasks', path: '/tasks-hub', icon: CheckSquare },
    { id: 'calendar', title: 'Calendar', path: '/calendar-hub', icon: Calendar },
  ],
  affiliate: [
    { id: 'dashboard', title: 'Dashboard', path: '/affiliates-hub', icon: Handshake },
    { id: 'referrals', title: 'Referrals', path: '/affiliates-hub', icon: Users },
    { id: 'commissions', title: 'Earnings', path: '/affiliates-hub', icon: DollarSign },
    { id: 'resources', title: 'Resources', path: '/resources-hub', icon: Archive },
  ],
  client: [
    { id: 'portal', title: 'My Portal', path: '/client-portal', icon: User },
    { id: 'credit', title: 'My Credit', path: '/credit-hub', icon: Shield },
    { id: 'progress', title: 'Progress', path: '/progress-portal-hub', icon: TrendingUp },
    { id: 'disputes', title: 'Disputes', path: '/dispute-hub', icon: FileText },
    { id: 'documents', title: 'Documents', path: '/documents-hub', icon: Archive },
    { id: 'support', title: 'Support', path: '/support-hub', icon: HelpCircle },
  ],
  prospect: [
    { id: 'portal', title: 'Portal', path: '/client-portal', icon: User },
    { id: 'learning', title: 'Learn', path: '/learning-hub', icon: BookOpen },
    { id: 'resources', title: 'Resources', path: '/resources-hub', icon: Archive },
    { id: 'support', title: 'Support', path: '/support-hub', icon: HelpCircle },
  ],
  viewer: [
    { id: 'analytics', title: 'Analytics', path: '/analytics-reporting-hub', icon: BarChart },
    { id: 'support', title: 'Support', path: '/support-hub', icon: HelpCircle },
  ]
};

// ============================================================================
// NAVIGATION FILTERING FUNCTIONS - FIXED WITH ROLE HIERARCHY
// ============================================================================

/**
 * Check if user has permission based on role hierarchy
 * @param {string|number} userRole - The user's current role
 * @param {string|string[]} requiredPermission - Required permission(s)
 * @returns {boolean} - Whether user has permission
 */
export function hasPermission(userRole, requiredPermission) {
  const userLevel = getRoleLevel(userRole);
  
  // If no permission required, everyone can see
  if (!requiredPermission) {
    return true;
  }
  
  // Handle array of allowed roles (explicit list)
  if (Array.isArray(requiredPermission)) {
    // Get the MINIMUM level from the allowed list (most permissive)
    const levels = requiredPermission.map(r => getRoleLevel(r));
    const minRequiredLevel = Math.min(...levels);
    
    // User must be at or above the minimum level
    return userLevel >= minRequiredLevel;
  }
  
  // Handle single permission (hierarchical)
  // User must have role level >= required permission level
  const requiredLevel = getRoleLevel(requiredPermission);
  return userLevel >= requiredLevel;
}

<<<<<<< HEAD
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
=======
/**
 * Get full navigation including role-specific items
 * @param {string|number} userRole - The user's current role
 * @returns {Array} - Combined navigation items
 */
export function getFullNavigation(userRole = 'user') {
  // Normalize role for lookup
  const normalizedRole = typeof userRole === 'string' 
    ? userRole.toLowerCase().replace(/[-_ ]/g, '')
    : String(userRole);
  
  const roleItems = roleSpecificItems[normalizedRole] || 
                    roleSpecificItems[userRole] || 
                    roleSpecificItems.user;
  return [...roleItems, ...navigationItems];
}

/**
 * Filter navigation items by user role using HIERARCHY
 * FIXED: Now uses role hierarchy instead of exact match!
 * @param {Array} items - Navigation items to filter
 * @param {string|number} userRole - The user's current role
 * @param {boolean} isMobile - Whether on mobile device
 * @returns {Array} - Filtered navigation items
 */
export function filterNavigationByRole(items, userRole = 'user', isMobile = false) {
  const userLevel = getRoleLevel(userRole);
  console.log('🔐 Filtering navigation for role:', userRole, '| Level:', userLevel);
  
  const filtered = items
    .map((item) => {
      if (!item) return null;
      
      // Check permission using hierarchy
      if (item.permission && !hasPermission(userRole, item.permission)) {
        return null;
      }
      
      // Handle mobile hidden items
      if (isMobile && item.mobileHidden) {
        return null;
      }
      
      // Handle groups (accordion items)
      if (item.isGroup && Array.isArray(item.items)) {
        // Filter sub-items within the group
        const filteredItems = item.items.filter((sub) => {
          if (isMobile && sub.mobileHidden) return false;
          return hasPermission(userRole, sub.permission);
        });
        
        // Exclude empty groups
        if (filteredItems.length === 0) return null;
        
        return { ...item, items: filteredItems };
      }
      
      // Return standalone items
      return { ...item };
    })
    .filter(Boolean);
  
  console.log('🔐 Filtered items count:', filtered.length);
  return filtered;
}

/**
 * Get navigation items visible on mobile
 * @param {string|number} userRole - The user's current role
 * @returns {Array} - Mobile-filtered navigation items
 */
export function getMobileNavigation(userRole = 'user') {
  const allItems = getFullNavigation(userRole);
  return filterNavigationByRole(allItems, userRole, true);
}

/**
 * Get quick access items for a role
 * @param {string|number} userRole - The user's current role
 * @returns {Array} - Quick access items
 */
export function getQuickAccessItems(userRole = 'user') {
  // Normalize role for lookup
  const normalizedRole = typeof userRole === 'string' 
    ? userRole.toLowerCase().replace(/[-_ ]/g, '')
    : String(userRole);
    
  return roleSpecificItems[normalizedRole] || 
         roleSpecificItems[userRole] || 
         roleSpecificItems.user;
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default navigationItems;
>>>>>>> 9bb51df (Complete hub architecture consolidation - Pipeline integrated into Clients Hub)
