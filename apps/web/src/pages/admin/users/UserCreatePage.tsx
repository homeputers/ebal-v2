import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeading } from '@/components/layout/PageHeading';
import { toast } from 'sonner';

import type { CreateUserBody } from '@/api/users';
import { UserCreateForm } from '@/features/users/UserForm';
import { useCreateUser } from '@/features/users/hooks';

export default function UserCreatePage() {
  const { t } = useTranslation('adminUsers');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const createMutation = useCreateUser();

  const handleSubmit = async (values: CreateUserBody) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success(t('messages.createSuccess'));
      navigate('..', { relative: 'path' });
    } catch (error) {
      toast.error(t('messages.createError'));
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <PageHeading autoFocus className="text-2xl font-semibold">
            {t('page.createTitle')}
          </PageHeading>
          <p className="text-sm text-gray-600">{t('create.heading')}</p>
        </div>
        <button
          type="button"
          className="rounded border px-4 py-2"
          onClick={() => navigate('..')}
        >
          {tCommon('actions.back')}
        </button>
      </div>

      <UserCreateForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('..')}
        isSubmitting={createMutation.isPending}
        autoFocusFirstField
      />
    </div>
  );
}
