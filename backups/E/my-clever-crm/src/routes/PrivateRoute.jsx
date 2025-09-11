// scr-admin-vite/src/routes/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../authContext'; // NEW: Import useAuth hook

function PrivateRoute({ children }) {
  const { user, loading } = useAuth(); // NEW: Get user and loading state from AuthContext

  if (loading) {
    // Optionally, render a loading spinner or message while authentication is being checked
    return <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">Checking authentication...</div>;
  }

  if (!user) {
    // If not authenticated (user is null), redirect to the login page.
    return <Navigate to="/login" replace />;
  }

  // If authenticated (user is not null), render the child components (the protected route content)
  return children;
}

export default PrivateRoute;