import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Role hierarchy - higher number = more permissions
const ROLE_HIERARCHY = {
  viewer: 1,
  prospect: 2,
  client: 3,
  affiliate: 4,
  user: 5,
  manager: 6,
  admin: 7,
  masterAdmin: 8
};

const ProtectedRoute = ({ children, requireAdmin = false, requiredRole = null }) => {
  const { user, loading, userProfile } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Authenticating...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get user's role from userProfile or default to 'user'
  const userRole = userProfile?.role || 'user';
  const userLevel = ROLE_HIERARCHY[userRole] || 5;

  // Check admin requirement (legacy support)
  if (requireAdmin && userRole !== 'admin' && userRole !== 'masterAdmin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You don't have permission to access this area.</p>
          <p className="text-sm text-gray-400 mt-2">Admin or Master Admin required.</p>
        </div>
      </div>
    );
  }

  // Check role-based permission
  if (requiredRole) {
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 1;

    // User must have at least the required role level
    if (userLevel < requiredLevel) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-white text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p>You don't have permission to access this area.</p>
            <p className="text-sm text-gray-400 mt-2">
              Required: {requiredRole} | Your role: {userRole}
            </p>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
export { ProtectedRoute };