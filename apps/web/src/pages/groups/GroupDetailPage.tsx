import { useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeading } from '@/components/layout/PageHeading';
import GroupForm from '../../features/groups/GroupForm';
import {
  useGroup,
  useUpdateGroup,
  useGroupMembers,
  useAddMemberToGroup,
  useRemoveMemberFromGroup,
} from '../../features/groups/hooks';
import MemberPicker from '../../components/pickers/MemberPicker';

export default function GroupDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { t } = useTranslation('groups');
  const { t: tCommon } = useTranslation('common');
  const groupQuery = useGroup(id);
  const updateGroup = useUpdateGroup();
  const membersQuery = useGroupMembers(id);
  const addMember = useAddMemberToGroup(id);
  const removeMember = useRemoveMemberFromGroup(id);

  const memberIdsInGroup = useMemo(
    () =>
      (membersQuery.data ?? [])
        .map((member) => member.id)
        .filter((id): id is string => typeof id === 'string'),
    [membersQuery.data],
  );

  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>(undefined);

  const handleAdd = () => {
    if (!selectedMemberId) return;
    addMember.mutate(selectedMemberId, {
      onSuccess: () => setSelectedMemberId(undefined),
    });
  };

  const handleUpdateGroup = (values: { name: string }) => {
    updateGroup.mutate({ id, body: values });
  };

  return (
    <div className="p-4 flex flex-col md:flex-row gap-6">
      <div className="md:w-1/2">
        <PageHeading autoFocus className="text-xl font-semibold mb-4">
          {t('detail.infoTitle')}
        </PageHeading>
        {groupQuery.isLoading && <div>{tCommon('status.loading')}</div>}
        {groupQuery.isError && <div>{tCommon('status.loadFailed')}</div>}
        {groupQuery.data && (
          <GroupForm
            defaultValues={{ name: groupQuery.data.name || '' }}
            onSubmit={handleUpdateGroup}
          />
        )}
      </div>
      <div className="md:w-1/2">
        <h2 className="text-xl font-semibold mb-4">{t('detail.membersTitle')}</h2>
        <div className="flex flex-col gap-2 mb-2 md:flex-row">
          <MemberPicker
            value={selectedMemberId}
            onChange={setSelectedMemberId}
            placeholder={t('detail.searchPlaceholder')}
            excludeIds={memberIdsInGroup}
          />
          <button
            onClick={handleAdd}
            disabled={!selectedMemberId}
            className="px-3 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {tCommon('actions.add')}
          </button>
        </div>
        {membersQuery.isLoading && <div>{tCommon('status.loading')}</div>}
        {membersQuery.isError && <div>{t('detail.loadFailedMembers')}</div>}
        {membersQuery.data && membersQuery.data.length > 0 ? (
          <table className="w-full border mt-2">
            <caption className="sr-only">{t('detail.membersTableCaption')}</caption>
            <thead>
              <tr className="bg-gray-50">
                <th scope="col" className="text-left p-2">
                  {t('table.name')}
                </th>
                <th scope="col" className="p-2 text-right">
                  {tCommon('table.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {membersQuery.data.map((m) => (
                <tr key={m.id} className="border-t">
                  <th scope="row" className="p-2 text-left font-normal">
                    {m.displayName}
                  </th>
                  <td className="p-2 text-right">
                    <button
                      className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                      onClick={() => {
                        if (confirm(t('detail.removeMemberConfirm'))) {
                          removeMember.mutate(m.id as string);
                        }
                      }}
                    >
                      {tCommon('actions.remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="mt-2" role="status" aria-live="polite">
            {t('detail.emptyMembers')}
          </div>
        )}
      </div>
    </div>
  );
}

