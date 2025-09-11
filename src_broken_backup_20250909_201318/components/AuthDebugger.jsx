import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermission } from '../usePermission';

export const AuthDebugger = () => {
  const auth = useAuth();
  const permissions = usePermission();

  return (
    <div style={{position: 'fixed', top: 16, right: 16, background: '#991b1b', color: 'white', padding: 16, borderRadius: 8, fontSize: 12, zIndex: 9999, maxWidth: 320}}>
      <h3 style={{fontWeight: 'bold', marginBottom: 8}}>Auth Debug Info:</h3>
      <div style={{lineHeight: 1.6}}>
        <div>User: {auth.user ? 'EXISTS' : 'NULL'}</div>
        <div>User Email: {auth.user?.email || 'N/A'}</div>
        <div>Is Anonymous: {auth.user?.isAnonymous ? 'YES' : 'NO'}</div>
        <div>User Profile: {auth.userProfile ? 'EXISTS' : 'NULL'}</div>
        <div>User Role: {auth.userProfile?.role || 'N/A'}</div>
        <div>Loading: {auth.loading ? 'YES' : 'NO'}</div>
        <div>Auth Error: {auth.authError || 'None'}</div>
        <div>isAuthenticated: {permissions.isAuthenticated ? 'YES' : 'NO'}</div>
        <div>isMasterAdmin: {permissions.isMasterAdmin ? 'YES' : 'NO'}</div>
        <div>hasFeatureAccess('dashboard'): {permissions.hasFeatureAccess('dashboard') ? 'YES' : 'NO'}</div>
      </div>
    </div>
  );
};

export default AuthDebugger;
