import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { AvatarUploader } from '@/features/me/components/AvatarUploader';
import {
  useDeleteAvatar,
  useMyProfile,
  useUpdateMyProfile,
} from '@/features/me/hooks';
import type { UpdateMyProfileBody } from '@/api/me';
import { DEFAULT_LANGUAGE } from '@/i18n';
import { FormErrorSummary } from '@/components/forms/FormErrorSummary';
import { createOnInvalidFocus, describedBy, fieldErrorId } from '@/lib/formAccessibility';

type ProfileFormValues = {
  displayName: string;
};

export default function ProfilePage() {
  const { t } = useTranslation('me');
  const { t: tCommon } = useTranslation('common');
  const { t: tValidation } = useTranslation('validation');
  const { t: tRoles } = useTranslation('adminUsers');
  const params = useParams<{ lang?: string }>();
  const language = params.lang ?? DEFAULT_LANGUAGE;

  const profileQuery = useMyProfile();
  const updateMutation = useUpdateMyProfile();
  const deleteAvatarMutation = useDeleteAvatar();

  const schema = useMemo(
    () =>
      z.object({
        displayName: z
          .string()
          .trim()
          .min(1, { message: tValidation('required') })
          .max(120, {
            message: tValidation('tooBig.string', { maximum: 120 }),
          }),
      }),
    [tValidation],
  );

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting, isDirty, submitCount },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: '',
    },
  });

  const showErrorSummary = submitCount > 0;

  const profile = profileQuery.data;

  useEffect(() => {
    if (profile) {
      reset({ displayName: profile.displayName ?? '' });
    }
  }, [profile, reset]);

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        const payload: UpdateMyProfileBody = {
          displayName: values.displayName,
          avatarAction: 'KEEP',
        };

        await updateMutation.mutateAsync(payload);
        toast.success(t('profile.notifications.updateSuccess'));
      } catch (error) {
        const message = isAxiosError(error)
          ? error.response?.data?.message ?? error.response?.data?.error
          : null;
        toast.error(message ?? t('profile.notifications.updateError'));
      }
    },
    createOnInvalidFocus(setFocus),
  );

  const handleRemoveAvatar = async () => {
    try {
      await deleteAvatarMutation.mutateAsync();
      toast.success(t('profile.notifications.removeAvatarSuccess'));
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.message ?? error.response?.data?.error
        : null;
      toast.error(message ?? t('profile.notifications.removeAvatarError'));
    }
  };

  if (profileQuery.isLoading) {
    return <div className="p-6">{tCommon('status.loading')}</div>;
  }

  if (profileQuery.isError || !profile) {
    return <div className="p-6">{tCommon('status.loadFailed')}</div>;
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t('profile.title')}</h1>
          <p className="text-sm text-gray-600">{t('profile.subtitle')}</p>
        </div>
        <Link
          to={`/${language}/me/security`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {t('links.security')}
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <AvatarUploader
            avatarUrl={profile.avatarUrl}
            onUploadSuccess={() => {
              toast.success(t('profile.avatar.success'));
            }}
            onUploadError={(message) => {
              toast.error(message);
            }}
          />
          <button
            type="button"
            onClick={handleRemoveAvatar}
            className="text-sm text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-red-300"
            disabled={!profile.avatarUrl || deleteAvatarMutation.isPending}
          >
            {t('profile.avatar.remove')}
          </button>
        </div>
        <form className="space-y-6" onSubmit={onSubmit} noValidate>
          {showErrorSummary ? (
            <FormErrorSummary
              errors={errors}
              title={tCommon('forms.errorSummary.title')}
              description={tCommon('forms.errorSummary.description')}
            />
          ) : null}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700" htmlFor="displayName">
              {t('profile.fields.displayName')}
            </label>
            <input
              id="displayName"
              type="text"
              className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('displayName')}
              aria-invalid={Boolean(errors.displayName)}
              aria-describedby={describedBy('displayName', {
                includeError: Boolean(errors.displayName),
              })}
            />
            {errors.displayName ? (
              <p id={fieldErrorId('displayName')} className="text-sm text-red-600">
                {errors.displayName.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('profile.fields.email')}
            </label>
            <input
              value={profile.email}
              readOnly
              className="w-full cursor-not-allowed rounded border border-gray-200 bg-gray-100 p-2 text-gray-600"
            />
          </div>

          <div className="space-y-2">
            <span className="block text-sm font-medium text-gray-700">
              {t('profile.fields.roles')}
            </span>
            <div className="flex flex-wrap gap-2">
              {profile.roles.length > 0 ? (
                profile.roles.map((role) => (
                  <span
                    key={role}
                    className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700"
                  >
                    {tRoles(`roles.${role}`)}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">
                  {tCommon('labels.notAvailable')}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              disabled={isSubmitting || updateMutation.isPending || !isDirty}
            >
              {tCommon('actions.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
