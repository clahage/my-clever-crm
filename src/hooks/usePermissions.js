// src/hooks/usePermissions.js
// ============================================================================
// CUSTOM HOOK FOR PERMISSION CHECKING
// ============================================================================
// Provides easy-to-use permission checking throughout the application
// Version: 1.0
// Date: November 21, 2025

import { useMemo } from 'use';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, canAccessRoute, canAccessUserData, ROLE_LEVELS } from '@/config/roleConfig';

/**
 * Custom hook for permission checking
 * @returns {Object} Permission checking functions and user role info
 */
export const usePermissions = () => {
  const { userProfile, currentUser } = useAuth();
  
  const userRole = userProfile?.role || 'viewer';
  const userId = currentUser?.uid;

  // Memoized permission checker
  const checkPermission = useMemo(() => {
    return (permission) => hasPermission(userRole, permission);
  }, [userRole]);

  // Memoized route access checker
  const checkRouteAccess = useMemo(() => {
    return (requiredRole) => canAccessRoute(userRole, requiredRole);
  }, [userRole]);

  // Memoized data access checker
  const checkDataAccess = useMemo(() => {
    return (targetUserId) => canAccessUserData(userRole, targetUserId, userId);
  }, [userRole, userId]);

  // Check if user is at least a certain role level
  const isAtLeast = useMemo(() => {
    return (roleId) => {
      const userLevel = ROLE_LEVELS[userRole] || 0;
      const requiredLevel = ROLE_LEVELS[roleId] || 0;
      return userLevel >= requiredLevel;
    };
  }, [userRole]);

  // Check if user is exactly a certain role
  const isRole = useMemo(() => {
    return (roleId) => userRole === roleId;
  }, [userRole]);

  // Quick role checks
  const isMasterAdmin = useMemo(() => userRole === 'masterAdmin', [userRole]);
  const isOfficeManager = useMemo(() => userRole === 'officeManager', [userRole]);
  const isAdmin = useMemo(() => userRole === 'admin' || userRole === 'officeManager' || userRole === 'masterAdmin', [userRole]);
  const isManager = useMemo(() => isAtLeast('manager'), [isAtLeast]);
  const isEmployee = useMemo(() => isAtLeast('user'), [isAtLeast]);
  const isClient = useMemo(() => userRole === 'client', [userRole]);
  const isProspect = useMemo(() => userRole === 'prospect', [userRole]);
  const isAffiliate = useMemo(() => userRole === 'affiliate', [userRole]);

  // Check multiple permissions (AND logic)
  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => checkPermission(permission));
  };

  // Check if has any of the permissions (OR logic)
  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => checkPermission(permission));
  };

  return {
    // Permission checking
    can: checkPermission,
    canAccessRoute: checkRouteAccess,
    canAccessData: checkDataAccess,
    hasAllPermissions,
    hasAnyPermission,
    
    // Role checking
    isAtLeast,
    isRole,
    
    // Quick role checks
    isMasterAdmin,
    isOfficeManager,
    isAdmin,
    isManager,
    isEmployee,
    isClient,
    isProspect,
    isAffiliate,
    
    // User info
    userRole,
    userId,
    userProfile,
    
    // Role level for comparisons
    roleLevel: ROLE_LEVELS[userRole] || 0
  };
};

export default usePermissions;
