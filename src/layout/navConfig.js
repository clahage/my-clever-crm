// src/layout/navConfig.js
// ============================================================================


// CONSOLIDATED NAVIGATION CONFIGURATION - VERSION 4.0
// PHASE 3: Hub-Based Navigation (67 items → 24 items)

// OPTIMIZED NAVIGATION CONFIGURATION - VERSION 4.0
// ============================================================================
// MAJOR UPDATE: Navigation reorganization (53 hubs → 20 strategic hubs)

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
  } from 'lucide-react';

  // ============================================================================
  // ROLE HIERARCHY & PERMISSIONS
  // ============================================================================
// ============================================================================
// ROLE HIERARCHY & PERMISSIONS
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

export const navigationItems = [
  // 🎯 SMART DASHBOARD - PRIMARY LANDING
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
  // 🧑‍🤝‍🧑 CLIENTS & PIPELINE GROUP
  {
    id: 'clients-pipeline-hub',
    title: 'Clients & Pipeline',
    path: '/clients-hub',
    icon: Users,
    permission: 'user',
    badge: 'AI',
    description: 'Complete client lifecycle: contacts, pipeline, intake, segments',
    category: 'clients'
  },
  // 🛡️ CREDIT REPORTS & ANALYSIS
  {
    id: 'credit-reports-hub',
    title: 'Credit Reports & Analysis',
    path: '/credit-hub',
    icon: Shield,
    permission: 'user',
    badge: 'AI',
    description: 'IDIQ integration, credit analysis, simulator, bureau communication',
    category: 'credit'
  },
  // ⚡ DISPUTE MANAGEMENT
  {
    id: 'dispute-management-hub',
    title: 'Dispute Management',
    path: '/dispute-hub',
    icon: AlertCircle,
    permission: 'user',
    badge: 'AI',
    description: 'Dispute tracking, letter generation, admin panel, status monitoring',
    category: 'disputes'
  },
  // 📊 ANALYTICS & REPORTING
  {
    id: 'analytics-reporting-hub',
    title: 'Analytics & Reports',
    path: '/analytics-reporting-hub',
    icon: BarChart,
    permission: 'user',
    badge: 'AI',
    description: 'Business intelligence & reports',
    category: 'analytics'
  },
  // 📁 DOCUMENTS & CONTRACTS
  {
    id: 'documents-hub',
    title: 'Documents & Contracts',
    path: '/documents-hub',
    icon: FolderOpen,
    permission: 'user',
    description: 'Document management, forms, templates, e-contracts, agreements',
    category: 'docs'
  },
  // 📅 SCHEDULING & TASKS
  {
    id: 'tasks-hub',
    title: 'Tasks & Scheduling',
    path: '/tasks-hub',
    icon: Calendar,
    permission: 'user',
    description: 'Calendar, tasks, scheduling, reminders, goals, team management',
    category: 'tasks'
  },
  // 💰 BILLING & REVENUE
  {
    id: 'billing-hub',
    title: 'Billing & Revenue',
    path: '/billing-hub',
    icon: DollarSign,
    permission: 'admin',
    badge: 'ADMIN',
    description: 'Billing, payments, collections, invoicing, payment integrations',
    category: 'billing'
  },
  // 🏆 CLIENT SUCCESS
  {
    id: 'client-success-hub',
    title: 'Client Success',
    path: '/client-success-hub',
    icon: Award,
    permission: 'manager',
    badge: 'PRO',
    description: 'Client retention & success tracking',
    category: 'success'
  },
  // 🧠 AI SUPER HUB
  {
    id: 'ai-hub',
    title: 'AI Super Hub',
    path: '/ai-hub',
    icon: Brain,
    permission: 'user',
    badge: 'AI',
    description: 'AI-powered tools & insights',
    category: 'ai'
  },
  // 📣 COMMUNICATIONS
  {
    id: 'communications-hub',
    title: 'Communications',
    path: '/comms-hub',
    icon: Mail,
    permission: 'user',
    description: 'Email, SMS, campaigns',
    category: 'comms'
  },
  // 🎓 LEARNING & RESOURCES
  {
    id: 'learning-hub',
    title: 'Learning & Resources',
    path: '/learning-hub',
    icon: GraduationCap,
    permission: 'user',
    description: 'Courses, guides, knowledge base',
    category: 'learning'
  },
  // 🏠 CLIENT PORTAL
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
  // 🛡️ ADMIN PORTAL
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
        
        