import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  useServicesList,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from '../../features/services/hooks';
import ServiceForm from '../../features/services/ServiceForm';
import type { ListServicesResponse } from '../../api/services';

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white p-4 rounded shadow max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('query') ?? '';
  const fromParam = searchParams.get('from') ?? '';
  const toParam = searchParams.get('to') ?? '';
  const pageParam = Number(searchParams.get('page') ?? '0');

  const [search, setSearch] = useState(queryParam);

  useEffect(() => {
    setSearch(queryParam);
  }, [queryParam]);

  useEffect(() => {
    const h = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (search) params.set('query', search);
      else params.delete('query');
      params.set('page', '0');
      setSearchParams(params);
    }, 300);
    return () => clearTimeout(h);
  }, [search]);

  const handleDateChange = (key: 'from' | 'to', value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '0');
    setSearchParams(params);
  };

  const params = useMemo(() => ({ page: pageParam, size: 20 }), [pageParam]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError } = useServicesList(params as any);

  const createMut = useCreateService();
  const updateMut = useUpdateService();
  const deleteMut = useDeleteService();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<
    NonNullable<ListServicesResponse['content']>[number] | null
  >(null);

  const handleCreate = (vals: Parameters<typeof createMut.mutate>[0]) => {
    createMut.mutate(vals, { onSuccess: () => setCreating(false) });
  };

  const handleUpdate = (id: string, vals: Parameters<typeof updateMut.mutate>[0]['body']) => {
    updateMut.mutate({ id, body: vals }, { onSuccess: () => setEditing(null) });
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    setSearchParams(params);
  };

  const services = data?.content ?? [];

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Services</h1>
      <div className="flex flex-wrap items-end gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="border p-2 rounded w-full max-w-sm"
        />
        <input
          type="date"
          value={fromParam}
          onChange={(e) => handleDateChange('from', e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={toParam}
          onChange={(e) => handleDateChange('to', e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          New Service
        </button>
      </div>
      {isLoading && <div>Loading…</div>}
      {isError && <div>Failed to load</div>}
      {!isLoading && services.length > 0 ? (
        <div className="mt-4">
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-2">Starts At</th>
                <th className="text-left p-2">Location</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{s.startsAt ? new Date(s.startsAt).toLocaleString() : ''}</td>
                  <td className="p-2">{s.location}</td>
                  <td className="p-2 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        to={s.id ?? ''}
                        className="px-2 py-1 text-sm bg-green-500 text-white rounded"
                      >
                        Open plan
                      </Link>
                      <button
                        className="px-2 py-1 text-sm bg-gray-200 rounded"
                        onClick={() => setEditing(s)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                        onClick={() => deleteMut.mutate(s.id!)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center gap-2 mt-4">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={pageParam === 0}
              onClick={() => goToPage(Math.max(0, pageParam - 1))}
            >
              Previous
            </button>
            <span>
              Page {(data?.number ?? 0) + 1} of {data?.totalPages ?? 1}
            </span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={
                data?.number !== undefined &&
                data?.totalPages !== undefined &&
                data.number + 1 >= data.totalPages
              }
              onClick={() => goToPage(pageParam + 1)}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        !isLoading && <div>No services found</div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)}>
        <h2 className="text-lg font-semibold mb-2">New Service</h2>
        <ServiceForm
          onSubmit={handleCreate}
          onCancel={() => setCreating(false)}
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)}>
        <h2 className="text-lg font-semibold mb-2">Edit Service</h2>
        {editing && (
          <ServiceForm
            defaultValues={{
              startsAt: editing.startsAt ? editing.startsAt.slice(0, 16) : '',
              location: editing.location || '',
            }}
            onSubmit={(vals) => handleUpdate(editing.id!, vals)}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}
