// src/config/roleConfig.js
// ============================================================================
// ROLE-BASED ACCESS CONTROL (RBAC) CONFIGURATION
// ============================================================================
// Defines roles, permissions, and access control for the CRM system
// Version: 1.0 - Initial Implementation
// Date: November 21, 2025

import {
  Users, User, UserPlus, Crown, Shield, Briefcase, Eye,
  FileText, Mail, Phone, Calendar, CreditCard, Settings,
  BarChart, Brain, MessageSquare, Award, Building
} from 'lucide-react';

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

/**
 * Role hierarchy levels (higher = more access)
 * Used for permission inheritance and comparison
 */
export const ROLE_LEVELS = {
  viewer: 1,          // Read-only guest access
  prospect: 2,        // Potential client (limited access)
  client: 3,          // Active paying client
  affiliate: 4,       // Referral partner
  user: 5,            // Basic employee
  manager: 6,         // Department manager
  admin: 7,           // System administrator
  officeManager: 7.5, // Office manager (Laurie) - special role
  masterAdmin: 8      // Owner (full control)
};

/**
 * Complete role definitions with metadata
 */
export const ROLES = {
  // ===== INTERNAL ROLES =====
  masterAdmin: {
    id: 'masterAdmin',
    level: 8,
    label: 'Master Admin',
    shortLabel: 'Owner',
    description: 'Business owner with complete system control',
    icon: Crown,
    color: '#FFD700', // Gold
    bgColor: '#FFF8DC',
    permissions: '*', // All permissions
    defaultLandingPage: '/smart-dashboard',
    canImpersonate: true,
    canManageRoles: true,
    canAccessAllData: true,
    billingAccess: 'full',
    revenueVisibility: 'full'
  },

  officeManager: {
    id: 'officeManager',
    level: 7.5,
    label: 'Office Manager',
    shortLabel: 'Manager',
    description: 'Office manager (Laurie) - operations oversight',
    icon: Briefcase,
    color: '#9333EA', // Purple
    bgColor: '#F3E8FF',
    permissions: [
      // Client Management
      'clients.view',
      'clients.create',
      'clients.edit',
      'clients.delete',
      'clients.export',
      'clients.notes',
      
      // Communications
      'communications.view',
      'communications.send',
      'communications.templates',
      'communications.history',
      
      // Documents
      'documents.view',
      'documents.upload',
      'documents.edit',
      'documents.delete',
      'documents.share',
      
      // Tasks & Scheduling
      'tasks.view',
      'tasks.create',
      'tasks.edit',
      'tasks.assign',
      'tasks.complete',
      'calendar.view',
      'calendar.manage',
      
      // Credit Operations
      'credit.view_reports',
      'credit.disputes',
      'credit.bureau_communication',
      'credit.enroll_clients',
      
      // Billing (limited)
      'billing.view',
      'billing.invoices',
      'billing.payments.view',
      'billing.receipts',
      
      // Analytics (limited)
      'analytics.view',
      'reports.standard',
      'reports.export',
      
      // Team Management (limited)
      'team.view',
      'team.tasks.assign',
      
      // Settings (limited)
      'settings.general',
      'settings.templates',
      'settings.notifications'
    ],
    defaultLandingPage: '/clients-hub',
    canImpersonate: false,
    canManageRoles: false,
    canAccessAllData: true, // Can see all clients/data
    billingAccess: 'view', // Can see invoices but not modify
    revenueVisibility: 'summary' // Can see totals but not details
  },

  admin: {
    id: 'admin',
    level: 7,
    label: 'Administrator',
    shortLabel: 'Admin',
    description: 'System administrator with elevated privileges',
    icon: Shield,
    color: '#DC2626', // Red
    bgColor: '#FEE2E2',
    permissions: [
      'clients.*',
      'communications.*',
      'documents.*',
      'tasks.*',
      'calendar.*',
      'credit.*',
      'billing.view',
      'billing.invoices',
      'analytics.*',
      'reports.*',
      'team.*',
      'settings.general',
      'settings.templates'
    ],
    defaultLandingPage: '/smart-dashboard',
    canImpersonate: false,
    canManageRoles: false,
    canAccessAllData: true,
    billingAccess: 'view',
    revenueVisibility: 'summary'
  },

  manager: {
    id: 'manager',
    level: 6,
    label: 'Manager',
    shortLabel: 'Manager',
    description: 'Department manager with team oversight',
    icon: Users,
    color: '#7C3AED', // Purple
    bgColor: '#EDE9FE',
    permissions: [
      'clients.*',
      'communications.*',
      'documents.*',
      'tasks.*',
      'calendar.*',
      'credit.view_reports',
      'credit.disputes',
      'analytics.view',
      'reports.standard',
      'team.view'
    ],
    defaultLandingPage: '/clients-hub',
    canImpersonate: false,
    canManageRoles: false,
    canAccessAllData: false, // Only assigned clients
    billingAccess: 'none',
    revenueVisibility: 'none'
  },

  user: {
    id: 'user',
    level: 5,
    label: 'Employee',
    shortLabel: 'Staff',
    description: 'Standard employee with daily operation access',
    icon: User,
    color: '#2563EB', // Blue
    bgColor: '#DBEAFE',
    permissions: [
      'clients.view',
      'clients.edit',
      'clients.notes',
      'communications.view',
      'communications.send',
      'documents.view',
      'documents.upload',
      'tasks.view',
      'tasks.create',
      'tasks.edit',
      'calendar.view',
      'credit.view_reports',
      'reports.standard'
    ],
    defaultLandingPage: '/clients-hub',
    canImpersonate: false,
    canManageRoles: false,
    canAccessAllData: false,
    billingAccess: 'none',
    revenueVisibility: 'none'
  },

  // ===== CLIENT ROLES =====
  client: {
    id: 'client',
    level: 3,
    label: 'Client',
    shortLabel: 'Client',
    description: 'Active paying client with portal access',
    icon: User,
    color: '#059669', // Green
    bgColor: '#D1FAE5',
    permissions: [
      // View own data only
      'portal.view',
      'profile.view',
      'profile.edit',
      
      // Credit reports (own only)
      'credit.view_own_reports',
      'credit.view_disputes',
      
      // Documents (own only)
      'documents.view_own',
      'documents.download_own',
      
      // Communications (own only)
      'messages.view_own',
      'messages.send',
      
      // Progress tracking
      'progress.view_own',
      
      // Billing (own only)
      'billing.view_own',
      'billing.pay_own',
      
      // Support
      'support.create_ticket',
      'support.view_own_tickets'
    ],
    defaultLandingPage: '/progress-portal',
    canImpersonate: false,
    canManageRoles: false,
    canAccessAllData: false,
    dataScope: 'own', // Can only see their own data
    billingAccess: 'own', // Can only see their own invoices
    revenueVisibility: 'none'
  },

  prospect: {
    id: 'prospect',
    level: 2,
    label: 'Prospect',
    shortLabel: 'Prospect',
    description: 'Potential client with limited preview access',
    icon: UserPlus,
    color: '#EA580C', // Orange
    bgColor: '#FFEDD5',
    permissions: [
      'portal.view_limited',
      'profile.view',
      'profile.edit',
      'onboarding.view',
      'resources.view_public',
      'support.create_ticket'
    ],
    defaultLandingPage: '/onboarding-hub',
    canImpersonate: false,
    canManageRoles: false,
    canAccessAllData: false,
    dataScope: 'own',
    billingAccess: 'none',
    revenueVisibility: 'none'
  },

  viewer: {
    id: 'viewer',
    level: 1,
    label: 'Viewer',
    shortLabel: 'Guest',
    description: 'Read-only guest access',
    icon: Eye,
    color: '#6B7280', // Gray
    bgColor: '#F3F4F6',
    permissions: [
      'resources.view_public'
    ],
    defaultLandingPage: '/resources',
    canImpersonate: false,
    canManageRoles: false,
    canAccessAllData: false,
    dataScope: 'none',
    billingAccess: 'none',
    revenueVisibility: 'none'
  },

  // ===== PARTNER ROLES =====
  affiliate: {
    id: 'affiliate',
    level: 4,
    label: 'Affiliate',
    shortLabel: 'Partner',
    description: 'Referral partner with commission tracking',
    icon: Handshake,
    color: '#8B5CF6', // Violet
    bgColor: '#F5F3FF',
    permissions: [
      'portal.view',
      'profile.view',
      'profile.edit',
      'referrals.view_own',
      'referrals.create',
      'commissions.view_own',
      'marketing.view_materials',
      'marketing.download_materials',
      'reports.affiliate_own',
      'support.create_ticket'
    ],
    defaultLandingPage: '/affiliates-hub',
    canImpersonate: false,
    canManageRoles: false,
    canAccessAllData: false,
    dataScope: 'own',
    billingAccess: 'none',
    revenueVisibility: 'own' // Only their commissions
  }
};

// ============================================================================
// PERMISSION DEFINITIONS
// ============================================================================

/**
 * Granular permission definitions
 * Format: 'resource.action'
 */
export const PERMISSIONS = {
  // Clients
  'clients.view': 'View client list and details',
  'clients.create': 'Create new clients',
  'clients.edit': 'Edit client information',
  'clients.delete': 'Delete clients',
  'clients.export': 'Export client data',
  'clients.import': 'Import client data',
  'clients.notes': 'Add/edit client notes',
  'clients.tags': 'Manage client tags',
  'clients.segments': 'Manage client segments',
  
  // Communications
  'communications.view': 'View all communications',
  'communications.send': 'Send emails/SMS',
  'communications.templates': 'Manage templates',
  'communications.history': 'View communication history',
  'communications.campaigns': 'Manage campaigns',
  
  // Documents
  'documents.view': 'View all documents',
  'documents.view_own': 'View own documents only',
  'documents.upload': 'Upload documents',
  'documents.edit': 'Edit documents',
  'documents.delete': 'Delete documents',
  'documents.share': 'Share documents',
  'documents.download_own': 'Download own documents',
  
  // Tasks & Calendar
  'tasks.view': 'View all tasks',
  'tasks.create': 'Create tasks',
  'tasks.edit': 'Edit tasks',
  'tasks.delete': 'Delete tasks',
  'tasks.assign': 'Assign tasks to others',
  'tasks.complete': 'Mark tasks complete',
  'calendar.view': 'View calendar',
  'calendar.manage': 'Manage calendar events',
  
  // Credit Operations
  'credit.view_reports': 'View all credit reports',
  'credit.view_own_reports': 'View own credit reports only',
  'credit.disputes': 'Manage disputes',
  'credit.view_disputes': 'View dispute status',
  'credit.bureau_communication': 'Communicate with bureaus',
  'credit.enroll_clients': 'Enroll clients in IDIQ',
  
  // Billing
  'billing.view': 'View all billing',
  'billing.view_own': 'View own invoices only',
  'billing.invoices': 'Manage invoices',
  'billing.payments.view': 'View payment records',
  'billing.payments.process': 'Process payments',
  'billing.pay_own': 'Pay own invoices',
  'billing.receipts': 'Generate receipts',
  
  // Analytics & Reports
  'analytics.view': 'View analytics dashboard',
  'analytics.advanced': 'Advanced analytics',
  'reports.standard': 'Generate standard reports',
  'reports.custom': 'Create custom reports',
  'reports.export': 'Export reports',
  'reports.affiliate_own': 'View own affiliate reports',
  
  // Team Management
  'team.view': 'View team members',
  'team.manage': 'Manage team members',
  'team.roles': 'Assign roles',
  'team.tasks.assign': 'Assign tasks to team',
  
  // Settings
  'settings.general': 'Manage general settings',
  'settings.templates': 'Manage templates',
  'settings.notifications': 'Configure notifications',
  'settings.integrations': 'Manage integrations',
  'settings.security': 'Security settings',
  
  // Portal Access
  'portal.view': 'Access client portal',
  'portal.view_limited': 'Limited portal access',
  
  // Profile
  'profile.view': 'View own profile',
  'profile.edit': 'Edit own profile',
  
  // Progress
  'progress.view_own': 'View own progress',
  
  // Messages
  'messages.view_own': 'View own messages',
  'messages.send': 'Send messages',
  
  // Support
  'support.create_ticket': 'Create support tickets',
  'support.view_own_tickets': 'View own tickets',
  
  // Onboarding
  'onboarding.view': 'Access onboarding',
  
  // Resources
  'resources.view_public': 'View public resources',
  
  // Referrals
  'referrals.view_own': 'View own referrals',
  'referrals.create': 'Create referrals',
  
  // Commissions
  'commissions.view_own': 'View own commissions',
  
  // Marketing
  'marketing.view_materials': 'View marketing materials',
  'marketing.download_materials': 'Download marketing materials'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (role, permission) => {
  if (!role || !ROLES[role]) {
    console.warn(`Invalid role: ${role}`);
    return false;
  }

  const roleConfig = ROLES[role];

  // Master admin has all permissions
  if (roleConfig.permissions === '*') {
    return true;
  }

  // Check if permission exists in role's permission array
  if (Array.isArray(roleConfig.permissions)) {
    // Check for exact match
    if (roleConfig.permissions.includes(permission)) {
      return true;
    }

    // Check for wildcard match (e.g., 'clients.*' matches 'clients.view')
    const [resource] = permission.split('.');
    if (roleConfig.permissions.includes(`${resource}.*`)) {
      return true;
    }
  }

  return false;
};

/**
 * Check if user can access a specific route
 */
export const canAccessRoute = (userRole, requiredRole) => {
  if (!userRole || !requiredRole) return false;
  
  const userLevel = ROLE_LEVELS[userRole] || 0;
  const requiredLevel = ROLE_LEVELS[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
};

/**
 * Get role configuration by role ID
 */
export const getRoleConfig = (roleId) => {
  return ROLES[roleId] || null;
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (roleId) => {
  const role = ROLES[roleId];
  if (!role) return [];
  
  if (role.permissions === '*') {
    return Object.keys(PERMISSIONS);
  }
  
  return Array.isArray(role.permissions) ? role.permissions : [];
};

/**
 * Check if a role can access another user's data
 */
export const canAccessUserData = (userRole, targetUserId, currentUserId) => {
  const roleConfig = ROLES[userRole];
  if (!roleConfig) return false;

  // Master admin can access all data
  if (roleConfig.canAccessAllData) return true;

  // Can always access own data
  if (targetUserId === currentUserId) return true;

  return false;
};

/**
 * Get filtered navigation items based on role
 */
export const getNavigationForRole = (roleId, allNavItems) => {
  const roleConfig = ROLES[roleId];
  if (!roleConfig) return [];

  // Master admin sees everything
  if (roleConfig.permissions === '*') {
    return allNavItems;
  }

  // Filter nav items based on required permissions
  return allNavItems.filter(item => {
    // If no permission required, show to everyone
    if (!item.requiredPermission) return true;

    // Check if role has required permission
    return hasPermission(roleId, item.requiredPermission);
  });
};

/**
 * Get role badge component props
 */
export const getRoleBadge = (roleId) => {
  const role = ROLES[roleId];
  if (!role) return null;

  return {
    label: role.shortLabel || role.label,
    color: role.color,
    bgColor: role.bgColor,
    icon: role.icon
  };
};

// ============================================================================
// SPECIAL ROLE ASSIGNMENTS
// ============================================================================

/**
 * Special role assignments for specific users
 * This allows you to assign specific roles to specific people
 */
export const SPECIAL_ROLE_ASSIGNMENTS = {
  // Laurie - Office Manager
  // Replace with actual Laurie's user ID after account creation
  'LAURIE_USER_ID': 'officeManager',
  
  // Owner - Master Admin
  // Replace with actual owner's user ID
  'OWNER_USER_ID': 'masterAdmin',
};

/**
 * Get role for a specific user
 * Checks special assignments first, then falls back to user's stored role
 */
export const getUserRole = (userId, storedRole) => {
  // Check for special assignment
  if (SPECIAL_ROLE_ASSIGNMENTS[userId]) {
    return SPECIAL_ROLE_ASSIGNMENTS[userId];
  }
  
  // Fall back to stored role
  return storedRole || 'viewer';
};

// ============================================================================
// CLIENT/PROSPECT SPECIFIC CONFIGURATIONS
// ============================================================================

/**
 * Client portal configuration
 */
export const CLIENT_PORTAL_CONFIG = {
  client: {
    showDashboard: true,
    showProgress: true,
    showDocuments: true,
    showMessages: true,
    showBilling: true,
    showSupport: true,
    showCreditReports: true,
    showDisputes: true,
    allowFileUpload: true,
    allowPayments: true,
    features: [
      'progress-tracking',
      'credit-reports',
      'dispute-status',
      'documents',
      'messages',
      'billing',
      'support-tickets'
    ]
  },
  prospect: {
    showDashboard: false,
    showProgress: false,
    showDocuments: false,
    showMessages: true,
    showBilling: false,
    showSupport: true,
    showCreditReports: false,
    showDisputes: false,
    allowFileUpload: false,
    allowPayments: false,
    features: [
      'onboarding',
      'resources',
      'messages',
      'support-tickets'
    ]
  }
};

/**
 * Get client portal features for a role
 */
export const getClientPortalFeatures = (roleId) => {
  return CLIENT_PORTAL_CONFIG[roleId] || null;
};

export default {
  ROLE_LEVELS,
  ROLES,
  PERMISSIONS,
  hasPermission,
  canAccessRoute,
  getRoleConfig,
  getRolePermissions,
  canAccessUserData,
  getNavigationForRole,
  getRoleBadge,
  getUserRole,
  getClientPortalFeatures,
  SPECIAL_ROLE_ASSIGNMENTS,
  CLIENT_PORTAL_CONFIG
};
