import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { subscribeToSessionExpiration } from '@/api/auth';
import { authQueryKeys } from '@/features/auth/hooks';
import { queryClient } from '@/lib/queryClient';
import { buildLanguagePath } from '@/pages/auth/utils';

type SessionExpirationHandlerProps = {
  currentLanguage: string;
};

export function SessionExpirationHandler({
  currentLanguage,
}: SessionExpirationHandlerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('common');

  useEffect(() => {
    const unsubscribe = subscribeToSessionExpiration(() => {
      queryClient.removeQueries({ queryKey: authQueryKeys.all });
      toast.error(t('auth.sessionExpired'));
      const loginPath = buildLanguagePath(currentLanguage, 'login');
      if (location.pathname !== loginPath) {
        navigate(loginPath, { replace: true, state: { from: location } });
      }
    });

    return unsubscribe;
  }, [currentLanguage, location, navigate, t]);

  return null;
}
