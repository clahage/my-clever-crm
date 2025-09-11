import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  // Check if user has admin role
  const isAdmin = user?.email?.includes('admin') || user?.email?.includes('speedycreditrepair.com');
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

export default AdminRoute;
