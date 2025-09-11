import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ClientProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/client/login" replace />;
  if (user.role !== 'client') return <Navigate to="/" replace />;
  return children;
};

export default ClientProtectedRoute;
