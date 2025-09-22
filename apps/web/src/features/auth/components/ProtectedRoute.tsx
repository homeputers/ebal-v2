import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/features/auth/useAuth';

type ProtectedRouteProps = {
  children?: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
};

export function ProtectedRoute({
  children,
  fallback,
  redirectTo,
}: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const { t } = useTranslation('common');

  if (!isAuthenticated) {
    if (children !== undefined) {
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

    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">
          {t('auth.requiredTitle')}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {t('auth.requiredDescription')}
        </p>
      </div>
    );
  }

  if (children !== undefined) {
    return <>{children}</>;
  }

  return <Outlet />;
}
