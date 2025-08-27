import { useAuth } from './contexts/AuthContext';
import { useMemo } from 'react';

export const usePermission = () => {
  const { user, userProfile, loading } = useAuth();

  // Admin email detection
  const adminEmails = ['chris@speedycreditrepair.com', 'clahage@gmail.com'];
  const normalizedUserEmail = (user?.email || '').toLowerCase();
  const normalizedProfileEmail = (userProfile?.email || '').toLowerCase();

  const authState = useMemo(() => {
    const isAuthenticated = !!(user && !loading);
    
    const isMasterAdmin = (
      adminEmails.includes(normalizedUserEmail) ||
      adminEmails.includes(normalizedProfileEmail) ||
      userProfile?.role === 'master_admin' ||
      userProfile?.role === 'admin' ||
      userProfile?.allowedFeatures?.includes('*')
    );

    return {
      isAuthenticated,
      isMasterAdmin,
      isAdmin: isMasterAdmin,
      userRole: userProfile?.role || 'guest',
      userStatus: userProfile?.status || 'inactive'
    };
  }, [user, userProfile, loading, normalizedUserEmail, normalizedProfileEmail]);

  // Feature access function
  const hasFeatureAccess = (featureName) => {
    // Always allow access if not authenticated (for login page)
    if (!authState.isAuthenticated) {
      return false;
    }

    // Master admin has access to everything
    if (authState.isMasterAdmin) {
      return true;
    }

    // Check if user status is active
    if (authState.userStatus !== 'active') {
      return false;
    }

    // Check if user has wildcard access
    if (userProfile?.allowedFeatures?.includes('*')) {
      return true;
    }

    // Check if user has specific feature access
    if (userProfile?.allowedFeatures?.includes(featureName)) {
      return true;
    }

    // Default features for regular users
    const defaultUserFeatures = [
      'dispute_center',
      'progress_portal',
      'page_contacts',
      'page_clients'
    ];
    
    if (defaultUserFeatures.includes(featureName) && authState.userRole === 'user') {
      return true;
    }

    return false;
  };

  // Role-based permission check
  const hasRolePermission = (permission) => {
    if (authState.isMasterAdmin) {
      return true;
    }

    // Default admin permissions
    const adminPermissions = {
      canCreateUsers: true,
      canEditUsers: true,
      canDeleteUsers: false,
      canManageRoles: true
    };

    if (authState.userRole === 'admin' && adminPermissions[permission]) {
      return true;
    }

    return false;
  };

  return {
    ...authState,
    userProfile,
    user,
    loading,
    hasFeatureAccess,
    hasRolePermission,
    canManageUsers: () => hasRolePermission('canCreateUsers') || hasRolePermission('canEditUsers'),
    canManageRoles: () => hasRolePermission('canManageRoles'),
    getUserRole: () => authState.userRole,
    getAvailableFeatures: () => {
      if (authState.isMasterAdmin) {
        return ['*', 'admin_panel', 'user_management', 'dispute_center', 'progress_portal'];
      }
      const userFeatures = userProfile?.allowedFeatures || [];
      const defaultFeatures = ['dispute_center', 'progress_portal'];
      return [...new Set([...userFeatures, ...defaultFeatures])];
    },
    // Legacy compatibility
    roles: [],
    features: []
  };
};