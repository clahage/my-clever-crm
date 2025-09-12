import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../authContext';
import { usePermission } from '../usePermission';

const AuthenticatedLayout = ({ children }) => {
  const { loading } = useAuth();
  const { isAuthenticated } = usePermission();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // ProtectedRoute will handle redirect
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Top navigation can be added here if needed */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
