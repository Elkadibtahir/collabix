import type { ReactNode } from 'react';
import { useAuth } from '../../lib/auth-context';

export interface PermissionGuardProps {
  children: ReactNode;
  requirePermissions?: string[];
  requireRoles?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function PermissionGuard({
  children,
  requirePermissions,
  requireRoles,
  requireAll = true,
  fallback = null,
}: PermissionGuardProps) {
  const { user } = useAuth();

  if (!user) return <>{fallback}</>;

  if (requirePermissions?.length) {
    const has = requireAll
      ? requirePermissions.every((p) => user.permissions.includes(p))
      : requirePermissions.some((p) => user.permissions.includes(p));
    if (!has) return <>{fallback}</>;
  }

  if (requireRoles?.length) {
    const has = requireAll
      ? requireRoles.every((r) => user.roles.includes(r))
      : requireRoles.some((r) => user.roles.includes(r));
    if (!has) return <>{fallback}</>;
  }

  return <>{children}</>;
}

export interface CanProps {
  children: ReactNode;
  permission: string;
  fallback?: ReactNode;
}

export function Can({ children, permission, fallback = null }: CanProps) {
  return (
    <PermissionGuard requirePermissions={[permission]} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export interface CannotProps {
  children: ReactNode;
  permission: string;
}

export function Cannot({ children, permission }: CannotProps) {
  const { user } = useAuth();
  if (!user || !user.permissions) return null;
  if (user.permissions.includes(permission)) return null;
  return <>{children}</>;
}

export interface RoleGuardProps {
  children: ReactNode;
  role: string;
  fallback?: ReactNode;
}

export function RoleGuard({ children, role, fallback = null }: RoleGuardProps) {
  return (
    <PermissionGuard requireRoles={[role]} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}
