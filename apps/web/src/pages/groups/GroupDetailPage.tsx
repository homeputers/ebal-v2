import { useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import GroupForm from '../../features/groups/GroupForm';
import {
  useGroup,
  useUpdateGroup,
  useGroupMembers,
  useAddMemberToGroup,
  useRemoveMemberFromGroup,
} from '../../features/groups/hooks';
import { useMembersList } from '../../features/members/hooks';
import type { components } from '../../api/types';

type Member = components['schemas']['MemberResponse'];

export default function GroupDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const groupQuery = useGroup(id);
  const updateGroup = useUpdateGroup();
  const membersQuery = useGroupMembers(id);
  const addMember = useAddMemberToGroup(id);
  const removeMember = useRemoveMemberFromGroup(id);

  const [memberSearch, setMemberSearch] = useState('');
  const memberParams = useMemo(
    () => ({ q: memberSearch || undefined, page: 0, size: 20 }),
    [memberSearch],
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allMembers } = useMembersList(memberParams as any);

  const availableMembers: Member[] = (allMembers?.content || []).filter(
    (m) => !membersQuery.data?.some((gm) => gm.id === m.id),
  );

  const [selectedMemberId, setSelectedMemberId] = useState('');

  const handleAdd = () => {
    if (!selectedMemberId) return;
    addMember.mutate(selectedMemberId, {
      onSuccess: () => setSelectedMemberId(''),
    });
  };

  const handleUpdateGroup = (values: { name: string }) => {
    updateGroup.mutate({ id, body: values });
  };

  return (
    <div className="p-4 flex flex-col md:flex-row gap-6">
      <div className="md:w-1/2">
        <h1 className="text-xl font-semibold mb-4">Group Info</h1>
        {groupQuery.isLoading && <div>Loading…</div>}
        {groupQuery.isError && <div>Failed to load</div>}
        {groupQuery.data && (
          <GroupForm
            defaultValues={{ name: groupQuery.data.name || '' }}
            onSubmit={handleUpdateGroup}
          />
        )}
      </div>
      <div className="md:w-1/2">
        <h2 className="text-xl font-semibold mb-4">Members</h2>
        <div className="flex flex-col gap-2 mb-2 md:flex-row">
          <input
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            placeholder="Search members..."
            className="border p-2 rounded flex-1"
          />
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="border p-2 rounded flex-1"
          >
            <option value="">Select member</option>
            {availableMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!selectedMemberId}
            className="px-3 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Add
          </button>
        </div>
        {membersQuery.isLoading && <div>Loading…</div>}
        {membersQuery.isError && <div>Failed to load members</div>}
        {membersQuery.data && membersQuery.data.length > 0 ? (
          <table className="w-full border mt-2">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-2">Name</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {membersQuery.data.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="p-2">{m.displayName}</td>
                  <td className="p-2 text-right">
                    <button
                      className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                      onClick={() => {
                        if (confirm('Remove member?')) {
                          removeMember.mutate(m.id as string);
                        }
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="mt-2">No members</div>
        )}
      </div>
    </div>
  );
}

