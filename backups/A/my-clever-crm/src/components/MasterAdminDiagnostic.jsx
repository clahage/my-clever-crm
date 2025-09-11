import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../authContext';
import { usePermission } from '../usePermission';

export const MasterAdminDiagnostic = () => {
  const location = useLocation();
  const { user, userProfile, isAuthenticated, isMasterAdmin } = useAuth();
  const { hasFeatureAccess, hasPermission, getUserRole, isAdmin } = usePermission();

  // Test all possible feature names
  const featuresToTest = [
    'dashboard', 'clients', 'leads', 'reports', 'disputes', 'settings', 
    'activity', 'features', 'progress', 'admin', '*'
  ];

  return (
    <div className="fixed top-4 left-4 bg-red-900 text-white p-4 rounded-lg text-xs max-w-md z-50 max-h-96 overflow-y-auto">
      <h3 className="font-bold mb-2 text-yellow-300">🔍 Master Admin Diagnostic:</h3>
      {/* Basic Auth State */}
      <div className="mb-3 border-b border-red-700 pb-2">
        <div><strong>Current Page:</strong> {location.pathname}</div>
        <div><strong>User Email:</strong> {user?.email || 'None'}</div>
        <div><strong>Is Authenticated:</strong> {isAuthenticated() ? '✅ YES' : '❌ NO'}</div>
        <div><strong>Is Master Admin:</strong> {isMasterAdmin() ? '✅ YES' : '❌ NO'}</div>
        <div><strong>User Role:</strong> {getUserRole()}</div>
        <div><strong>Is Admin (method):</strong> {isAdmin() ? '✅ YES' : '❌ NO'}</div>
      </div>
      {/* User Profile Details */}
      <div className="mb-3 border-b border-red-700 pb-2">
        <div><strong>Profile Role:</strong> {userProfile?.role || 'None'}</div>
        <div><strong>Allowed Features:</strong></div>
        <div className="ml-2 text-yellow-200">
          {JSON.stringify(userProfile?.allowedFeatures, null, 1)}
        </div>
        <div><strong>Has Wildcard (*):</strong> {userProfile?.allowedFeatures?.includes('*') ? '✅ YES' : '❌ NO'}</div>
      </div>
      {/* Feature Access Tests */}
      <div className="mb-3">
        <div><strong>Feature Access Tests:</strong></div>
        {featuresToTest.map(feature => (
          <div key={feature} className="ml-2 flex justify-between">
            <span>{feature}:</span>
            <span className={hasFeatureAccess(feature) ? 'text-green-300' : 'text-red-300'}>
              {hasFeatureAccess(feature) ? '✅' : '❌'}
            </span>
          </div>
        ))}
      </div>
      {/* Permission Tests */}
      <div className="mb-3">
        <div><strong>Permission Tests:</strong></div>
        <div className="ml-2 flex justify-between">
          <span>disputes.read:</span>
          <span className={hasPermission('disputes', 'read') ? 'text-green-300' : 'text-red-300'}>
            {hasPermission('disputes', 'read') ? '✅' : '❌'}
          </span>
        </div>
        <div className="ml-2 flex justify-between">
          <span>admin.write:</span>
          <span className={hasPermission('admin', 'write') ? 'text-green-300' : 'text-red-300'}>
            {hasPermission('admin', 'write') ? '✅' : '❌'}
          </span>
        </div>
      </div>
      {/* Raw Data */}
      <div className="border-t border-red-700 pt-2">
        <div><strong>Raw userProfile:</strong></div>
        <pre className="text-xs text-yellow-200 mt-1 overflow-auto">
          {JSON.stringify(userProfile, null, 1)}
        </pre>
      </div>
    </div>
  );
};

export default MasterAdminDiagnostic;
