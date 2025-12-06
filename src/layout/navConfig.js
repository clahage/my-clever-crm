// src/layout/navConfig.js
import { BugReport } from '@mui/icons-material';
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
  const userKey = typeof userRole === 'string' ? userRole.toLowerCase() : userRole;
  const requiredKey = typeof requiredRole === 'string' ? requiredRole.toLowerCase() : requiredRole;
  const userLevel = ROLE_HIERARCHY[userKey] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredKey] || 0;
  return userLevel >= requiredLevel;
}

export function isVisible(item, userRole, isMobile = false) {
  // Master admin sees everything
  const normalizedRole = typeof userRole === 'string' ? userRole.toLowerCase() : userRole;
  if (normalizedRole === 'masteradmin') return true;
  // Check mobile visibility
  if (isMobile && item.mobileHidden) return false;
  if (item.visibleTo) {
    if (Array.isArray(item.visibleTo)) {
      return item.visibleTo.map(r => typeof r === 'string' ? r.toLowerCase() : r).includes(normalizedRole);
    }
    return (typeof item.visibleTo === 'string' ? item.visibleTo.toLowerCase() : item.visibleTo) === normalizedRole;
  }
  if (item.permission) {
    return hasPermission(userRole, item.permission);
  }
  return true;
}

export const navigationItems = [
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
  {
    id: 'communications-hub',
    title: 'Communications',
    path: '/comms-hub',
    icon: Mail,
    permission: 'user',
    description: 'Email, SMS, campaigns',
    category: 'comms'
  },
  {
    id: 'learning-hub',
    title: 'Learning & Resources',
    path: '/learning-hub',
    icon: GraduationCap,
    permission: 'user',
    description: 'Courses, guides, knowledge base',
    category: 'learning'
  },
  {
    id: 'client-portal',
    title: 'Client Portal',
    path: '/client-portal',
    icon: User,
    permission: 'client',
    description: 'Client self-service dashboard',
    category: 'client'
  },
  {
    id: 'admin-portal',
    title: 'Admin Portal',
    path: '/portal',
    icon: Shield,
    permission: 'admin',
    badge: 'ADMIN',
    description: '6-tab command center for complete system control',
    category: 'admin'
  }
        
        