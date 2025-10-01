import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AuthPageLayout } from '@/pages/auth/AuthPageLayout';
import { buildLanguagePath } from '@/pages/auth/utils';
import { useChangePassword } from '@/features/auth/hooks';
import { FormErrorSummary } from '@/components/forms/FormErrorSummary';
import { createOnInvalidFocus, describedBy, fieldErrorId, fieldHelpTextId } from '@/lib/formAccessibility';

const MIN_PASSWORD_LENGTH = 8;

export default function ChangePasswordPage() {
  const { t } = useTranslation('auth');
  const { t: tValidation } = useTranslation('validation');
  const { t: tCommon } = useTranslation('common');
  const params = useParams();
  const language = params.lang;
  const changePasswordMutation = useChangePassword();

  const schema = useMemo(
    () =>
      z
        .object({
          currentPassword: z
            .string()
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

  type ChangePasswordForm = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const showErrorSummary = submitCount > 0;
  const helpTextId = fieldHelpTextId('changePasswordHelp');

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        await changePasswordMutation.mutateAsync({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        toast.success(t('changePassword.notifications.success'));
        reset();
      } catch (error) {
        const message = isAxiosError(error)
          ? error.response?.data?.message ?? error.response?.data?.error
          : null;
        toast.error(message ?? t('changePassword.notifications.error'));
      }
    },
    createOnInvalidFocus(setFocus),
  );

  return (
    <AuthPageLayout
      title={t('changePassword.title')}
      description={t('changePassword.description')}
      footer={
        <Link
          to={buildLanguagePath(language, 'forgot-password')}
          className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
        >
          {t('changePassword.links.forgotPassword')}
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        {showErrorSummary ? (
          <FormErrorSummary
            errors={errors}
            title={tCommon('forms.errorSummary.title')}
            description={tCommon('forms.errorSummary.description')}
          />
        ) : null}
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="currentPassword">
            {t('changePassword.fields.currentPassword')}
          </label>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('currentPassword')}
            aria-invalid={Boolean(errors.currentPassword)}
            aria-describedby={describedBy('currentPassword', {
              includeError: Boolean(errors.currentPassword),
            })}
          />
          {errors.currentPassword ? (
            <p id={fieldErrorId('currentPassword')} className="mt-1 text-sm text-red-600">
              {errors.currentPassword.message}
            </p>
          ) : null}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="newPassword">
            {t('changePassword.fields.newPassword')}
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
            {t('changePassword.fields.confirmPassword')}
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
          disabled={isSubmitting || changePasswordMutation.isPending}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {t('changePassword.actions.submit')}
        </button>
        <p id={helpTextId} className="text-xs text-gray-500">{t('changePassword.helpText')}</p>
      </form>
    </AuthPageLayout>
  );
}
