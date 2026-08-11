import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hr360-app/context/AuthContext';

/**
 * A wrapper for routes that should only be accessible to Admins.
 * If a regular employee tries to access an AdminRoute, they are redirected to the dashboard.
 */
export default function AdminRoute({ children }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Assuming roles are strings like 'Admin' or 'Employee'. Case-insensitive check.
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
