import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { LoadingScreen } from './LoadingScreen';
import type { ReactNode } from 'react';

export interface ProtectedRouteProps {
  children?: ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  requireAll?: boolean;
}

export function ProtectedRoute({
  children,
  requiredRoles,
  requiredPermissions,
  requireAll = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles?.length && user) {
    const has = requireAll
      ? requiredRoles.every((r) => user.roles.includes(r))
      : requiredRoles.some((r) => user.roles.includes(r));
    if (!has) {
      return <Navigate to="/403" state={{ from: location }} replace />;
    }
  }

  if (requiredPermissions?.length && user) {
    const has = requireAll
      ? requiredPermissions.every((p) => user.permissions.includes(p))
      : requiredPermissions.some((p) => user.permissions.includes(p));
    if (!has) {
      return <Navigate to="/403" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
}

export interface PublicRouteProps {
  children?: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}
