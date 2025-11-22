// src/components/auth/PermissionGate.jsx
// ============================================================================
// PERMISSION GATE COMPONENT
// ============================================================================
// Conditionally renders children based on user permissions
// Version: 1.0
// Date: November 21, 2025

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert, Box } from '@mui/material';
import { Lock } from 'lucide-react';

/**
 * PermissionGate - Conditionally render content based on permissions
 * 
 * @param {string|string[]} permission - Required permission(s)
 * @param {string} requireRole - Required minimum role
 * @param {boolean} requireAll - If true, user must have ALL permissions (default: false)
 * @param {React.ReactNode} children - Content to render if authorized
 * @param {React.ReactNode} fallback - Content to render if not authorized
 * @param {boolean} showDenied - Show access denied message (default: false)
 */
const PermissionGate = ({
  permission,
  requireRole,
  requireAll = false,
  children,
  fallback = null,
  showDenied = false
}) => {
  const { can, isAtLeast, hasAllPermissions, hasAnyPermission } = usePermissions();

  // Check permissions
  let hasAccess = true;

  if (permission) {
    if (Array.isArray(permission)) {
      hasAccess = requireAll 
        ? hasAllPermissions(permission)
        : hasAnyPermission(permission);
    } else {
      hasAccess = can(permission);
    }
  }

  // Check role requirement
  if (requireRole && hasAccess) {
    hasAccess = isAtLeast(requireRole);
  }

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If not authorized, show fallback or denied message
  if (showDenied) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="warning" 
          icon={<Lock />}
          sx={{ 
            maxWidth: 600, 
            mx: 'auto',
            '& .MuiAlert-icon': {
              color: 'warning.main'
            }
          }}
        >
          <strong>Access Restricted</strong>
          <br />
          You don't have permission to access this content. Please contact your administrator if you believe this is an error.
        </Alert>
      </Box>
    );
  }

  return <>{fallback}</>;
};

/**
 * RoleGate - Simpler component that only checks role
 */
export const RoleGate = ({ 
  role, 
  minRole,
  children, 
  fallback = null,
  showDenied = false 
}) => {
  const { isRole, isAtLeast } = usePermissions();

  let hasAccess = false;

  if (role) {
    hasAccess = Array.isArray(role) 
      ? role.some(r => isRole(r))
      : isRole(role);
  } else if (minRole) {
    hasAccess = isAtLeast(minRole);
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showDenied) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" icon={<Lock />}>
          This feature is only available to {minRole || role} users.
        </Alert>
      </Box>
    );
  }

  return <>{fallback}</>;
};

/**
 * AdminOnly - Quick component for admin-only content
 */
export const AdminOnly = ({ children, fallback = null }) => (
  <RoleGate minRole="admin" fallback={fallback}>
    {children}
  </RoleGate>
);

/**
 * ManagerOnly - Quick component for manager+ content
 */
export const ManagerOnly = ({ children, fallback = null }) => (
  <RoleGate minRole="manager" fallback={fallback}>
    {children}
  </RoleGate>
);

/**
 * EmployeeOnly - Quick component for employee+ content
 */
export const EmployeeOnly = ({ children, fallback = null }) => (
  <RoleGate minRole="user" fallback={fallback}>
    {children}
  </RoleGate>
);

/**
 * ClientOnly - Quick component for client-only content
 */
export const ClientOnly = ({ children, fallback = null }) => (
  <RoleGate role="client" fallback={fallback}>
    {children}
  </RoleGate>
);

/**
 * ProspectOnly - Quick component for prospect-only content
 */
export const ProspectOnly = ({ children, fallback = null }) => (
  <RoleGate role="prospect" fallback={fallback}>
    {children}
  </RoleGate>
);

export default PermissionGate;
