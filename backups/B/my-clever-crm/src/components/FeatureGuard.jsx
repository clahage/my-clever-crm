import React from 'react';
import { usePermission } from '../usePermission';

const FeatureGuard = ({ 
  feature, 
  children, 
  fallback = null, 
  showMessage = true,
  debug = false
}) => {
  const { hasFeatureAccess, isAuthenticated, isMasterAdmin, loading } = usePermission();

  // Debug logging during development
  if (debug && process.env.NODE_ENV === 'development') {
    console.log(`🔍 FeatureGuard Debug: ${feature}`, {
      isAuthenticated,
      isMasterAdmin,
      hasAccess: hasFeatureAccess(feature),
      loading
    });
  }

  // Show loading state while permissions are being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Check authentication first
  if (!isAuthenticated) {
    if (showMessage) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-4">Please sign in to access this feature.</p>
            <a 
              href="/login" 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      );
    }
    return fallback;
  }

  // Check feature access using the permission system
  if (!hasFeatureAccess(feature)) {
    if (showMessage) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600 mb-4">
              You don't have permission to access "{feature}". Please contact your administrator if you believe this is an error.
            </p>
            <a 
              href="/" 
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go to Dashboard
            </a>
            {debug && process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer">Debug Info</summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify({
                    feature,
                    isAuthenticated,
                    isMasterAdmin,
                    hasAccess: hasFeatureAccess(feature)
                  }, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return fallback;
  }

  // Access granted - render the protected content
  return children;
};

export default FeatureGuard;