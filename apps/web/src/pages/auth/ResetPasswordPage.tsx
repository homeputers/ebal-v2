import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AuthPageLayout } from '@/pages/auth/AuthPageLayout';
import { buildLanguagePath } from '@/pages/auth/utils';
import { useResetPassword } from '@/features/auth/hooks';

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordPage() {
  const { t } = useTranslation('auth');
  const { t: tValidation } = useTranslation('validation');
  const params = useParams();
  const language = params.lang;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const resetPasswordMutation = useResetPassword();
  const [hasInvalidTokenError, setHasInvalidTokenError] = useState(false);

  const schema = useMemo(
    () =>
      z
        .object({
          newPassword: z
            .string()
            .min(MIN_PASSWORD_LENGTH, {
              message: tValidation('tooSmall.string', { minimum: MIN_PASSWORD_LENGTH }),
            }),
          confirmPassword: z
            .string()
            .min(MIN_PASSWORD_LENGTH, {
              message: tValidation('tooSmall.string', { minimum: MIN_PASSWORD_LENGTH }),
            }),
        })
        .refine((value) => value.newPassword === value.confirmPassword, {
          path: ['confirmPassword'],
          message: tValidation('passwordMismatch'),
        }),
    [tValidation],
  );

  type ResetPasswordForm = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const isTokenMissing = token.trim().length === 0;
  const resetLinkWarningMessage = t('resetPassword.notifications.missingToken');
  const shouldShowResetLinkWarning = isTokenMissing || hasInvalidTokenError;

  useEffect(() => {
    setHasInvalidTokenError(false);
  }, [token]);

  const onSubmit = handleSubmit(async (values) => {
    if (isTokenMissing) {
      toast.error(resetLinkWarningMessage);
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword: values.newPassword,
      });
      toast.success(t('resetPassword.notifications.success'));
      reset();
      navigate(buildLanguagePath(language, 'login'));
    } catch (error) {
      let responseMessage: string | null = null;
      let fallbackMessage = t('resetPassword.notifications.error');

      if (isAxiosError(error)) {
        const status = error.response?.status ?? 0;
        if ([400, 404, 410].includes(status)) {
          setHasInvalidTokenError(true);
          fallbackMessage = resetLinkWarningMessage;
        }

        const data = error.response?.data as
          | {
              detail?: unknown;
              message?: unknown;
              error?: unknown;
            }
          | undefined;

        const detailMessage = typeof data?.detail === 'string' ? data.detail : null;
        const message = typeof data?.message === 'string' ? data.message : null;
        const errorMessage = typeof data?.error === 'string' ? data.error : null;

        responseMessage = detailMessage ?? message ?? errorMessage;
      }

      toast.error(responseMessage ?? fallbackMessage);
    }
  });

  return (
    <AuthPageLayout
      title={t('resetPassword.title')}
      description={t('resetPassword.description')}
      footer={
        <Link
          to={buildLanguagePath(language, 'login')}
          className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
        >
          {t('resetPassword.links.backToLogin')}
        </Link>
      }
    >
      {shouldShowResetLinkWarning ? (
        <div
          role="alert"
          className="rounded border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800"
        >
          {resetLinkWarningMessage}
        </div>
      ) : null}
      <form className="mt-4 space-y-4" onSubmit={onSubmit} noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="newPassword">
            {t('resetPassword.fields.newPassword')}
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('newPassword')}
          />
          {errors.newPassword ? (
            <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
          ) : null}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="confirmPassword">
            {t('resetPassword.fields.confirmPassword')}
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword ? (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={
            isSubmitting ||
            resetPasswordMutation.isPending ||
            isTokenMissing
          }
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {t('resetPassword.actions.submit')}
        </button>
        <p className="text-xs text-gray-500">{t('resetPassword.helpText')}</p>
      </form>
    </AuthPageLayout>
  );
}
