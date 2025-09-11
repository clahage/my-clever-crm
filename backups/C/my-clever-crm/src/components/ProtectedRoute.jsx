import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermission } from '../usePermission';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isMasterAdmin, userRole, loading } = usePermission();
  // userProfile is not needed, use userRole instead
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
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin requirement
  if (requireAdmin && !isMasterAdmin && userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  return children;
};
