import { useMemo, useState } from 'react';
import { useMembersList, useCreateMember, useUpdateMember, useDeleteMember } from '../../features/members/hooks';

export default function MembersPage() {
  const [query, setQuery] = useState('');
  const params = useMemo(() => (query ? { query, page: 0, size: 20 } : { page: 0, size: 20 }), [query]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError } = useMembersList(params as any);

  const createMut = useCreateMember();
  const updateMut = useUpdateMember();
  const deleteMut = useDeleteMember();
  void createMut;
  void updateMut;
  void deleteMut;

  // TODO: render table with data?.content and controls to create/edit/delete
  // show loading/error/empty states
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Members</h1>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name..."
        className="border p-2 rounded w-full max-w-sm"
      />
      {isLoading && <div>Loading…</div>}
      {isError && <div>Failed to load</div>}
      {!isLoading && data ? (
        <div className="mt-4">
          {/* Render table rows from data.content */}
        </div>
      ) : null}
    </div>
  );
}
