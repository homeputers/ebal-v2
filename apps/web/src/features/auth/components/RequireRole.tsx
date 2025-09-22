import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import type { Role } from '@/api/auth';
import { useAuth } from '@/features/auth/useAuth';

type RequireRoleProps =
  | {
      role: Role;
      roles?: never;
      children?: ReactNode;
      fallback?: ReactNode;
      redirectTo?: string;
    }
  | {
      role?: never;
      roles: Role[];
      children?: ReactNode;
      fallback?: ReactNode;
      redirectTo?: string;
    };

const normalizeRoles = (props: RequireRoleProps): Role[] => {
  if ('roles' in props && props.roles) {
    return props.roles;
  }

  if ('role' in props && props.role) {
    return [props.role];
  }

  return [];
};

export function RequireRole(props: RequireRoleProps) {
  const { fallback, redirectTo, children } = props;
  const { hasRole, isAuthenticated } = useAuth();
  const location = useLocation();
  const { t } = useTranslation('common');

  const requiredRoles = normalizeRoles(props);
  const isAllowed =
    requiredRoles.length === 0 ||
    requiredRoles.some((candidate) => hasRole(candidate));

  const hasChildren = children !== undefined;

  if (!isAuthenticated || !isAllowed) {
    if (hasChildren) {
      return <>{fallback ?? null}</>;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    if (redirectTo) {
      return (
        <Navigate to={redirectTo} replace state={{ from: location }} />
      );
    }

    const translationKey = !isAuthenticated
      ? ('auth.requiredTitle' as const)
      : ('auth.forbiddenTitle' as const);
    const descriptionKey = !isAuthenticated
      ? ('auth.requiredDescription' as const)
      : ('auth.forbiddenDescription' as const);

    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">{t(translationKey)}</h1>
        <p className="mt-2 text-sm text-gray-600">{t(descriptionKey)}</p>
      </div>
    );
  }

  if (hasChildren) {
    return <>{children}</>;
  }

  return <Outlet />;
}
