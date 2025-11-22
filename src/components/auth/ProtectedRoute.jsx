// src/components/auth/ProtectedRoute.jsx
// ============================================================================
// PROTECTED ROUTE COMPONENT
// ============================================================================
// Route wrapper with role-based access control
// Version: 1.0
// Date: November 21, 2025

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Box, CircularProgress, Alert } from '@mui/material';
import { Lock } from 'lucide-react';

/**
 * ProtectedRoute - Wrapper for routes that require authentication and/or specific permissions
 * 
 * @param {React.ReactNode} children - Route content
 * @param {string|string[]} requiredPermission - Required permission(s)
 * @param {string} requiredRole - Minimum role required
 * @param {boolean} requireAll - Require all permissions (default: false)
 * @param {string} redirectTo - Where to redirect if not authorized (default: '/login')
 */
const ProtectedRoute = ({
  children,
  requiredPermission,
  requiredRole,
  requireAll = false,
  redirectTo = '/login'
}) => {
  const { currentUser, loading } = useAuth();
  const { can, isAtLeast, hasAllPermissions, hasAnyPermission } = usePermissions();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'background.default'
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Not logged in - redirect to login
  if (!currentUser) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check permissions if required
  if (requiredPermission) {
    let hasAccess = false;

    if (Array.isArray(requiredPermission)) {
      hasAccess = requireAll
        ? hasAllPermissions(requiredPermission)
        : hasAnyPermission(requiredPermission);
    } else {
      hasAccess = can(requiredPermission);
    }

    if (!hasAccess) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            backgroundColor: 'background.default'
          }}
        >
          <Alert
            severity="error"
            icon={<Lock />}
            sx={{ maxWidth: 600 }}
          >
            <strong>Access Denied</strong>
            <br />
            You don't have the required permissions to access this page.
            Please contact your administrator if you need access.
          </Alert>
        </Box>
      );
    }
  }

  // Check role if required
  if (requiredRole) {
    if (!isAtLeast(requiredRole)) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            backgroundColor: 'background.default'
          }}
        >
          <Alert
            severity="error"
            icon={<Lock />}
            sx={{ maxWidth: 600 }}
          >
            <strong>Insufficient Privileges</strong>
            <br />
            This page requires {requiredRole} access or higher.
            Your current role does not have sufficient privileges.
          </Alert>
        </Box>
      );
    }
  }

  // User is authenticated and authorized - render content
  return <>{children}</>;
};

/**
 * AdminRoute - Quick wrapper for admin-only routes
 */
export const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="admin">
    {children}
  </ProtectedRoute>
);

/**
 * ManagerRoute - Quick wrapper for manager+ routes
 */
export const ManagerRoute = ({ children }) => (
  <ProtectedRoute requiredRole="manager">
    {children}
  </ProtectedRoute>
);

/**
 * EmployeeRoute - Quick wrapper for employee+ routes
 */
export const EmployeeRoute = ({ children }) => (
  <ProtectedRoute requiredRole="user">
    {children}
  </ProtectedRoute>
);

/**
 * ClientRoute - Quick wrapper for client routes
 */
export const ClientRoute = ({ children }) => (
  <ProtectedRoute requiredRole="client">
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
