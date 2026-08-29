import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Permission } from '../constants/auth';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactElement;
  permission?: Permission;
}

export function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const { isAuthenticated, hasPermission } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

