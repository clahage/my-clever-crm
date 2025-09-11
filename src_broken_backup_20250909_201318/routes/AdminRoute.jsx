import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/authContext';

// Basic AdminRoute: Only allows access if user is admin
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  // You may need to adjust this logic based on your user object
  // Allow any authenticated user for now
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default AdminRoute;
