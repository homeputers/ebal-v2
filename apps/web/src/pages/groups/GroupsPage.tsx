import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGroupsList,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
} from '../../features/groups/hooks';
import GroupForm, { GroupFormValues } from '../../features/groups/GroupForm';

export default function GroupsPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const params = useMemo(
    () => ({ query: query || undefined, page, size: 20 }),
    [query, page],
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError } = useGroupsList(params as any);

  const createMut = useCreateGroup();
  const updateMut = useUpdateGroup();
  const deleteMut = useDeleteGroup();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = (values: GroupFormValues) => {
    createMut.mutate(values, {
      onSuccess: () => setCreating(false),
    });
  };

  const handleUpdate = (id: string, values: GroupFormValues) => {
    updateMut.mutate(
      { id, body: values },
      {
        onSuccess: () => setEditingId(null),
      },
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Groups</h1>
      <div className="flex items-center gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Search by name..."
          className="border p-2 rounded w-full max-w-sm"
        />
        {creating ? null : (
          <button
            onClick={() => setCreating(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            New Group
          </button>
        )}
      </div>

      {creating && (
        <div className="mb-4">
          <GroupForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      )}

      {isLoading && <div>Loading…</div>}
      {isError && <div>Failed to load</div>}

      {!isLoading && data ? (
        <div className="mt-4">
          {data.content && data.content.length > 0 ? (
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2">Name</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((g) => (
                  <tr key={g.id} className="border-t">
                    <td className="p-2 align-top">
                      {editingId === g.id ? (
                        <GroupForm
                          defaultValues={{ name: g.name || '' }}
                          onSubmit={(vals) => handleUpdate(g.id!, vals)}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : (
                        <Link
                          to={`/groups/${g.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {g.name}
                        </Link>
                      )}
                    </td>
                    <td className="p-2 text-right align-top">
                      {editingId === g.id ? null : (
                        <div className="flex gap-2 justify-end">
                          <button
                            className="px-2 py-1 text-sm bg-gray-200 rounded"
                            onClick={() => setEditingId(g.id!)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                            onClick={() => deleteMut.mutate(g.id!)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>No groups found</div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </button>
            <span>
              Page {(data.number ?? 0) + 1} of {data.totalPages ?? 1}
            </span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={
                data.number !== undefined &&
                data.totalPages !== undefined &&
                data.number + 1 >= data.totalPages
              }
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
