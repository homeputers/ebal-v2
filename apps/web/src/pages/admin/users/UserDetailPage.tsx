import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeading } from '@/components/layout/PageHeading';
import { toast } from 'sonner';

import type { UpdateUserBody } from '@/api/users';
import { UserEditForm } from '@/features/users/UserForm';
import {
  useDeleteUser,
  useResetUserPassword,
  useUpdateUser,
  useUser,
} from '@/features/users/hooks';

export default function UserDetailPage() {
  const { t } = useTranslation('adminUsers');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const userQuery = useUser(id);
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const resetPasswordMutation = useResetUserPassword();

  const user = userQuery.data;

  const handleSubmit = async (values: UpdateUserBody) => {
    if (!id) {
      return;
    }

    try {
      await updateMutation.mutateAsync({ id, body: values });
      toast.success(t('messages.updateSuccess'));
    } catch (error) {
      toast.error(t('messages.updateError'));
    }
  };

  const handleResetPassword = async () => {
    if (!id || !user) {
      return;
    }

    const confirmed = window.confirm(
      t('detail.resetPasswordConfirm', { email: user.email }),
    );

    if (!confirmed) {
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync(id);
      toast.success(t('messages.resetPasswordSuccess'));
    } catch (error) {
      toast.error(t('messages.resetPasswordError'));
    }
  };

  const handleDelete = async () => {
    if (!id || !user) {
      return;
    }

    const confirmed = window.confirm(t('detail.deleteConfirm'));

    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast.success(t('messages.deleteSuccess'));
      navigate('..', { replace: true, relative: 'path' });
    } catch (error) {
      toast.error(t('messages.deleteError'));
    }
  };

  if (!id) {
    return <div className="p-6">{tCommon('status.loadFailed')}</div>;
  }

  if (userQuery.isLoading) {
    return <div className="p-6">{tCommon('status.loading')}</div>;
  }

  if (userQuery.isError || !user) {
    return <div className="p-6">{tCommon('status.loadFailed')}</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <PageHeading autoFocus className="text-2xl font-semibold">
            {t('page.detailTitle')}
          </PageHeading>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded border px-4 py-2"
            onClick={() => navigate('..', { relative: 'path' })}
          >
            {tCommon('actions.back')}
          </button>
          <button
            type="button"
            className="rounded border px-4 py-2"
            onClick={handleResetPassword}
            disabled={resetPasswordMutation.isPending}
          >
            {t('actions.resetPassword')}
          </button>
          <button
            type="button"
            className="rounded border border-red-300 bg-red-50 px-4 py-2 text-red-700"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {t('actions.delete')}
          </button>
        </div>
      </div>

      <UserEditForm
        defaultValues={{
          displayName: user.displayName ?? '',
          roles: user.roles ?? [],
          isActive: Boolean(user.isActive),
        }}
        email={user.email}
        onSubmit={handleSubmit}
        onCancel={() => navigate('..', { relative: 'path' })}
        isSubmitting={updateMutation.isPending}
        autoFocusFirstField
      />
    </div>
  );
}
