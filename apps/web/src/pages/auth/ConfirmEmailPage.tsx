import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isAxiosError } from 'axios';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useConfirmEmail } from '@/features/me/hooks';
import { useAuth } from '@/features/auth/useAuth';
import { AuthPageLayout } from '@/pages/auth/AuthPageLayout';
import { buildLanguagePath } from '@/pages/auth/utils';
import { DEFAULT_LANGUAGE } from '@/i18n';

export default function ConfirmEmailPage() {
  const { t } = useTranslation('me');
  const navigate = useNavigate();
  const params = useParams<{ lang?: string }>();
  const language = params.lang ?? DEFAULT_LANGUAGE;
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const timeoutRef = useRef<number | null>(null);

  const { mutateAsync: confirmEmail } = useConfirmEmail();
  const { logout } = useAuth();

  const [message, setMessage] = useState<string>(t('confirmEmail.loading'));
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error',
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(t('confirmEmail.missingToken'));
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await confirmEmail({ token });

        if (cancelled) {
          return;
        }

        setStatus('success');
        setMessage(t('confirmEmail.success'));
        logout();
        toast.success(t('security.toastReauth'));
        timeoutRef.current = window.setTimeout(() => {
          navigate(`/${language}/login`, { replace: true });
        }, 1500);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = isAxiosError(error)
          ? error.response?.data?.message ?? error.response?.data?.error
          : null;
        setMessage(message ?? t('confirmEmail.error'));
        setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [confirmEmail, language, logout, navigate, t, token]);

  return (
    <AuthPageLayout title={t('confirmEmail.title')}>
      <div className="space-y-4 text-sm text-gray-700">
        <p>{message}</p>
        {status === 'error' ? (
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 hover:underline"
            onClick={() => navigate(buildLanguagePath(language, 'login'))}
          >
            {t('confirmEmail.goToLogin')}
          </button>
        ) : null}
      </div>
    </AuthPageLayout>
  );
}
