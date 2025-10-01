import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '@/features/auth/useAuth';
import { useChangeEmail, useChangePassword } from '@/features/me/hooks';
import { DEFAULT_LANGUAGE } from '@/i18n';
import { FormErrorSummary } from '@/components/forms/FormErrorSummary';
import { createOnInvalidFocus, describedBy, fieldErrorId, fieldNameToId } from '@/lib/formAccessibility';

const MIN_PASSWORD_LENGTH = 8;

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
};

type EmailFormValues = {
  currentPassword: string;
  newEmail: string;
};

export default function SecurityPage() {
  const { t } = useTranslation('me');
  const { t: tCommon } = useTranslation('common');
  const { t: tValidation } = useTranslation('validation');
  const navigate = useNavigate();
  const params = useParams<{ lang?: string }>();
  const language = params.lang ?? DEFAULT_LANGUAGE;
  const { logout } = useAuth();

  const changePasswordMutation = useChangePassword();
  const changeEmailMutation = useChangeEmail();

  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  const passwordSchema = useMemo(
    () =>
      z.object({
        currentPassword: z
          .string()
          .trim()
          .min(1, { message: tValidation('required') }),
        newPassword: z
          .string()
          .trim()
          .min(MIN_PASSWORD_LENGTH, {
            message: tValidation('tooSmall.string', { minimum: MIN_PASSWORD_LENGTH }),
          }),
      }),
    [tValidation],
  );

  const emailSchema = useMemo(
    () =>
      z.object({
        currentPassword: z
          .string()
          .trim()
          .min(1, { message: tValidation('required') }),
        newEmail: z
          .string()
          .trim()
          .email({ message: tValidation('email') })
          .transform((value) => value.toLowerCase()),
      }),
    [tValidation],
  );

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: {
      errors: passwordErrors,
      isSubmitting: isPasswordSubmitting,
      submitCount: passwordSubmitCount,
    },
    setError: setPasswordError,
    reset: resetPasswordForm,
    setFocus: setPasswordFocus,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  });

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: {
      errors: emailErrors,
      isSubmitting: isEmailSubmitting,
      submitCount: emailSubmitCount,
    },
    setError: setEmailError,
    reset: resetEmailForm,
    setFocus: setEmailFocus,
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      currentPassword: '',
      newEmail: '',
    },
  });

  const showPasswordSummary = passwordSubmitCount > 0;
  const showEmailSummary = emailSubmitCount > 0;

  const onPasswordSubmit = handlePasswordSubmit(
    async (values) => {
      try {
        await changePasswordMutation.mutateAsync({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        resetPasswordForm();
        toast.success(t('security.password.success'));
        logout();
        navigate(`/${language}/login`, { replace: true });
      } catch (error) {
        if (isAxiosError(error)) {
          if (error.response?.status === 401) {
            const message = t('security.password.invalidCredentials');
            setPasswordError('currentPassword', { type: 'server', message });
            toast.error(message);
            return;
          }

          const responseData = error.response?.data as
            | { detail?: string; message?: string; error?: string }
            | undefined;
          const problemDetail = responseData?.detail ?? responseData?.message ?? responseData?.error ?? null;

          toast.error(problemDetail ?? t('security.password.error'));
          return;
        }

        toast.error(t('security.password.error'));
      }
    },
    createOnInvalidFocus(setPasswordFocus),
  );

  const onEmailSubmit = handleEmailSubmit(
    async (values) => {
      setEmailNotice(null);
      try {
        await changeEmailMutation.mutateAsync({
          currentPassword: values.currentPassword,
          newEmail: values.newEmail,
        });
        resetEmailForm();
        setEmailNotice(t('security.email.success', { email: values.newEmail }));
      } catch (error) {
        if (isAxiosError(error)) {
          if (error.response?.status === 401) {
            const message = t('security.email.invalidCredentials');
            setEmailError('currentPassword', { type: 'server', message });
            toast.error(message);
            return;
          }

          const responseData = error.response?.data as
            | { detail?: string; message?: string; error?: string }
            | undefined;
          const problemDetail = responseData?.detail ?? responseData?.message ?? responseData?.error ?? null;

          toast.error(problemDetail ?? t('security.email.error'));
          return;
        }

        toast.error(t('security.email.error'));
      }
    },
    createOnInvalidFocus(setEmailFocus),
  );

  const emailFieldId = (field: keyof EmailFormValues) => fieldNameToId(`email-${field}`);
  const emailFieldErrorId = (field: keyof EmailFormValues) => fieldErrorId(`email-${field}`);
  const emailDescribedBy = (field: keyof EmailFormValues) =>
    describedBy(`email-${field}`, {
      includeError: Boolean(emailErrors[field]),
    });
  const mapEmailFieldId = (name: string) => fieldNameToId(`email-${name}`);

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('security.title')}</h1>
        <p className="text-sm text-gray-600">{t('security.subtitle')}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <form className="space-y-4 rounded border border-gray-200 p-6 shadow-sm" onSubmit={onPasswordSubmit} noValidate>
          {showPasswordSummary ? (
            <FormErrorSummary
              errors={passwordErrors}
              title={tCommon('forms.errorSummary.title')}
              description={tCommon('forms.errorSummary.description')}
            />
          ) : null}
          <div>
            <h2 className="text-lg font-semibold">{t('security.password.title')}</h2>
            <p className="text-sm text-gray-600">{t('security.password.description')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="currentPassword">
              {t('security.password.fields.currentPassword')}
            </label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...registerPassword('currentPassword')}
              aria-invalid={Boolean(passwordErrors.currentPassword)}
              aria-describedby={describedBy('currentPassword', {
                includeError: Boolean(passwordErrors.currentPassword),
              })}
            />
            {passwordErrors.currentPassword ? (
              <p id={fieldErrorId('currentPassword')} className="mt-1 text-sm text-red-600">
                {passwordErrors.currentPassword.message}
              </p>
            ) : null}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="newPassword">
              {t('security.password.fields.newPassword')}
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              className="mt-1 w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...registerPassword('newPassword')}
              aria-invalid={Boolean(passwordErrors.newPassword)}
              aria-describedby={describedBy('newPassword', {
                includeError: Boolean(passwordErrors.newPassword),
              })}
            />
            {passwordErrors.newPassword ? (
              <p id={fieldErrorId('newPassword')} className="mt-1 text-sm text-red-600">
                {passwordErrors.newPassword.message}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            disabled={
              isPasswordSubmitting || changePasswordMutation.isPending
            }
          >
            {t('security.password.submit')}
          </button>
        </form>

        <form className="space-y-4 rounded border border-gray-200 p-6 shadow-sm" onSubmit={onEmailSubmit} noValidate>
          {showEmailSummary ? (
            <FormErrorSummary
              errors={emailErrors}
              title={tCommon('forms.errorSummary.title')}
              description={tCommon('forms.errorSummary.description')}
              getFieldId={mapEmailFieldId}
              getItemLabel={(name) => {
                if (name === 'currentPassword') {
                  return t('security.email.fields.currentPassword');
                }
                if (name === 'newEmail') {
                  return t('security.email.fields.newEmail');
                }
                return undefined;
              }}
            />
          ) : null}
          <div>
            <h2 className="text-lg font-semibold">{t('security.email.title')}</h2>
            <p className="text-sm text-gray-600">{t('security.email.description')}</p>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor={emailFieldId('currentPassword')}
            >
              {t('security.email.fields.currentPassword')}
            </label>
            <input
              id={emailFieldId('currentPassword')}
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...registerEmail('currentPassword')}
              aria-invalid={Boolean(emailErrors.currentPassword)}
              aria-describedby={emailDescribedBy('currentPassword')}
            />
            {emailErrors.currentPassword ? (
              <p id={emailFieldErrorId('currentPassword')} className="mt-1 text-sm text-red-600">
                {emailErrors.currentPassword.message}
              </p>
            ) : null}
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor={emailFieldId('newEmail')}
            >
              {t('security.email.fields.newEmail')}
            </label>
            <input
              id={emailFieldId('newEmail')}
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...registerEmail('newEmail')}
              aria-invalid={Boolean(emailErrors.newEmail)}
              aria-describedby={emailDescribedBy('newEmail')}
            />
            {emailErrors.newEmail ? (
              <p id={emailFieldErrorId('newEmail')} className="mt-1 text-sm text-red-600">
                {emailErrors.newEmail.message}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            disabled={isEmailSubmitting || changeEmailMutation.isPending}
          >
            {t('security.email.submit')}
          </button>
          {emailNotice ? (
            <p className="text-sm text-green-700">{emailNotice}</p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
