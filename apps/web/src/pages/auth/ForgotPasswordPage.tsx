import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AuthPageLayout } from '@/pages/auth/AuthPageLayout';
import { buildLanguagePath } from '@/pages/auth/utils';
import { useForgotPassword } from '@/features/auth/hooks';

export default function ForgotPasswordPage() {
  const { t } = useTranslation('auth');
  const { t: tValidation } = useTranslation('validation');
  const params = useParams();
  const language = params.lang;
  const navigate = useNavigate();
  const forgotPasswordMutation = useForgotPassword();

  const schema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .trim()
          .min(1, { message: tValidation('required') })
          .email({ message: tValidation('email') }),
      }),
    [tValidation],
  );

  type ForgotPasswordForm = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await forgotPasswordMutation.mutateAsync(values);
      toast.success(t('forgotPassword.notifications.success'));
      reset();
      navigate(buildLanguagePath(language, 'login'));
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.message ?? error.response?.data?.error
        : null;
      toast.error(message ?? t('forgotPassword.notifications.error'));
    }
  });

  return (
    <AuthPageLayout
      title={t('forgotPassword.title')}
      description={t('forgotPassword.description')}
      footer={
        <Link
          to={buildLanguagePath(language, 'login')}
          className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
        >
          {t('forgotPassword.links.backToLogin')}
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="email">
            {t('forgotPassword.fields.email')}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('email')}
          />
          {errors.email ? (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || forgotPasswordMutation.isPending}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {t('forgotPassword.actions.submit')}
        </button>
        <p className="text-xs text-gray-500">
          {t('forgotPassword.helpText')}
        </p>
      </form>
    </AuthPageLayout>
  );
}
