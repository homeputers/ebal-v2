import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isAxiosError } from 'axios';
import {
  Link,
  Navigate,
  type Location,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AuthPageLayout } from '@/pages/auth/AuthPageLayout';
import { buildLanguagePath } from '@/pages/auth/utils';
import { useLogin } from '@/features/auth/hooks';
import { useAuth } from '@/features/auth/useAuth';
import { FormErrorSummary } from '@/components/forms/FormErrorSummary';
import { createOnInvalidFocus, describedBy, fieldErrorId } from '@/lib/formAccessibility';

const MIN_PASSWORD_LENGTH = 8;

export default function LoginPage() {
  const { t } = useTranslation('auth');
  const { t: tValidation } = useTranslation('validation');
  const { t: tCommon } = useTranslation('common');
  const { isAuthenticated } = useAuth();
  const loginMutation = useLogin();
  const params = useParams();
  const language = params.lang;
  const location = useLocation();
  const navigate = useNavigate();

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .trim()
          .min(1, { message: tValidation('required') })
          .email({ message: tValidation('email') }),
        password: z
          .string()
          .min(MIN_PASSWORD_LENGTH, {
            message: tValidation('tooSmall.string', { minimum: MIN_PASSWORD_LENGTH }),
          }),
      }),
    [tValidation],
  );

  type LoginFormValues = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const showErrorSummary = submitCount > 0;

  const locationState = location.state as { from?: Location } | undefined;
  const fromLocation = locationState?.from;
  const fallbackPath = language ? buildLanguagePath(language, 'services') : '/';
  const redirectTo = fromLocation
    ? `${fromLocation.pathname}${fromLocation.search}${fromLocation.hash}`
    : fallbackPath;

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        await loginMutation.mutateAsync(values);
        toast.success(t('login.notifications.success'));
        navigate(redirectTo, { replace: true });
      } catch (error) {
        const message = isAxiosError(error)
          ? error.response?.data?.message ?? error.response?.data?.error
          : null;
        toast.error(message ?? t('login.notifications.error'));
      }
    },
    createOnInvalidFocus(setFocus),
  );

  if (isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  return (
    <AuthPageLayout
      title={t('login.title')}
      description={t('login.description')}
      footer={
        <div className="space-y-2">
          <div>
            <Link
              to={buildLanguagePath(language, 'forgot-password')}
              className="font-medium text-blue-600 hover:underline"
            >
              {t('login.links.forgotPassword')}
            </Link>
          </div>
          <div>
            <Link
              to={buildLanguagePath(language, 'reset-password')}
              className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
            >
              {t('login.links.haveToken')}
            </Link>
          </div>
        </div>
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
          <label className="block text-sm font-medium text-gray-700" htmlFor="email">
            {t('login.fields.email')}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy('email', { includeError: Boolean(errors.email) })}
          />
          {errors.email ? (
            <p id={fieldErrorId('email')} className="mt-1 text-sm text-red-600">
              {errors.email.message}
            </p>
          ) : null}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="password">
            {t('login.fields.password')}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('password')}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={describedBy('password', { includeError: Boolean(errors.password) })}
          />
          {errors.password ? (
            <p id={fieldErrorId('password')} className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || loginMutation.isPending}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {t('login.actions.submit')}
        </button>
      </form>
    </AuthPageLayout>
  );
}
