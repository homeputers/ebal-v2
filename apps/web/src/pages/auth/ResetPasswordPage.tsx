import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from '@/lib/toast';

import { AuthPageLayout } from '@/pages/auth/AuthPageLayout';
import { buildLanguagePath } from '@/pages/auth/utils';
import { useResetPassword } from '@/features/auth/hooks';
import { FormErrorSummary } from '@/components/forms/FormErrorSummary';
import { createOnInvalidFocus, describedBy, fieldErrorId, fieldHelpTextId } from '@/lib/formAccessibility';

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordPage() {
  const { t } = useTranslation('auth');
  const { t: tValidation } = useTranslation('validation');
  const { t: tCommon } = useTranslation('common');
  const params = useParams();
  const language = params.lang;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialToken = searchParams.get('token') ?? '';
  const resetPasswordMutation = useResetPassword();
  const [hasInvalidTokenError, setHasInvalidTokenError] = useState(false);
  const [invalidTokenValue, setInvalidTokenValue] = useState<string | null>(null);
  const [allowManualTokenEntry, setAllowManualTokenEntry] = useState(
    initialToken.trim().length === 0,
  );

  const schema = useMemo(
    () =>
      z
        .object({
          token: z
            .string()
            .trim()
            .min(1, { message: tValidation('required') }),
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
    watch,
    setError,
    clearErrors,
    setFocus,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      token: initialToken,
      newPassword: '',
      confirmPassword: '',
    },
  });

  const showErrorSummary = submitCount > 0;
  const helpTextId = fieldHelpTextId('resetPasswordHelp');

  const tokenValue = watch('token') ?? '';
  const trimmedTokenValue = tokenValue.trim();
  const isTokenMissing = trimmedTokenValue.length === 0;
  const resetLinkWarningMessage = t('resetPassword.notifications.missingToken');
  const shouldShowResetLinkWarning = (allowManualTokenEntry && isTokenMissing) || hasInvalidTokenError;

  useEffect(() => {
    reset({
      token: initialToken,
      newPassword: '',
      confirmPassword: '',
    });
    setAllowManualTokenEntry(initialToken.trim().length === 0);
    setHasInvalidTokenError(false);
    setInvalidTokenValue(null);
    clearErrors('token');
  }, [initialToken, reset, clearErrors]);

  useEffect(() => {
    if (invalidTokenValue === null) {
      return;
    }

    if (tokenValue !== invalidTokenValue) {
      setHasInvalidTokenError(false);
      setInvalidTokenValue(null);
      clearErrors('token');
    }
  }, [tokenValue, invalidTokenValue, clearErrors]);

  const onSubmit = handleSubmit(
    async (values) => {
      const rawToken = values.token;
      const normalizedToken = rawToken.trim();

      if (!normalizedToken) {
        toast.error(resetLinkWarningMessage);
        setError('token', { type: 'manual', message: resetLinkWarningMessage });
        setFocus('token');
        return;
      }

      try {
        await resetPasswordMutation.mutateAsync({
          token: normalizedToken,
          newPassword: values.newPassword,
        });
        toast.success(t('resetPassword.notifications.success'));
        reset({
          token: initialToken,
          newPassword: '',
          confirmPassword: '',
        });
        navigate(buildLanguagePath(language, 'login'));
      } catch (error) {
        let responseMessage: string | null = null;
        let fallbackMessage = t('resetPassword.notifications.error');

        if (isAxiosError(error)) {
          const status = error.response?.status ?? 0;
          if ([400, 404, 410].includes(status)) {
            const attemptedToken = rawToken;
            setHasInvalidTokenError(true);
            setInvalidTokenValue(attemptedToken);
            setAllowManualTokenEntry(true);
            setError('token', { type: 'manual', message: resetLinkWarningMessage });
            setFocus('token');
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
    },
    createOnInvalidFocus(setFocus),
  );

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
        {showErrorSummary ? (
          <FormErrorSummary
            errors={errors}
            title={tCommon('forms.errorSummary.title')}
            description={tCommon('forms.errorSummary.description')}
          />
        ) : null}
        {allowManualTokenEntry ? (
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="token">
              {t('resetPassword.fields.token')}
            </label>
            <input
              id="token"
              type="text"
              autoComplete="off"
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('token')}
              aria-invalid={Boolean(errors.token)}
              aria-describedby={describedBy('token', {
                includeError: Boolean(errors.token),
              })}
            />
            {errors.token ? (
              <p id={fieldErrorId('token')} className="mt-1 text-sm text-red-600">
                {errors.token.message}
              </p>
            ) : null}
          </div>
        ) : (
          <input type="hidden" {...register('token')} />
        )}
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
            aria-invalid={Boolean(errors.newPassword)}
            aria-describedby={describedBy('newPassword', {
              includeError: Boolean(errors.newPassword),
            })}
          />
          {errors.newPassword ? (
            <p id={fieldErrorId('newPassword')} className="mt-1 text-sm text-red-600">
              {errors.newPassword.message}
            </p>
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
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={describedBy('confirmPassword', {
              includeError: Boolean(errors.confirmPassword),
              extraIds: [helpTextId],
            })}
          />
          {errors.confirmPassword ? (
            <p id={fieldErrorId('confirmPassword')} className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || resetPasswordMutation.isPending || isTokenMissing}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {t('resetPassword.actions.submit')}
        </button>
        <p id={helpTextId} className="text-xs text-gray-500">{t('resetPassword.helpText')}</p>
      </form>
    </AuthPageLayout>
  );
}
