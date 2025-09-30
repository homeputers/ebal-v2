import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useGroupsList,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
} from '../../features/groups/hooks';
import GroupForm, { GroupFormValues } from '../../features/groups/GroupForm';

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { t: tCommon } = useTranslation('common');

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        tabIndex={-1}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50"
        aria-label={tCommon('actions.close', { defaultValue: 'Close dialog' })}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-md rounded bg-white p-4 shadow"
          tabIndex={-1}
        >
          {children}
        </div>
      </div>
    </>
  );
}

export default function GroupsPage() {
  const { t } = useTranslation('groups');
  const { t: tCommon } = useTranslation('common');
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('query') ?? '';
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

  const params = useMemo(() => ({ page: pageParam, size: 20 }), [pageParam]);
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

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    setSearchParams(params);
  };

  const filtered = (data?.content || []).filter((g) =>
    g.name?.toLowerCase().includes(queryParam.toLowerCase()),
  ); // TODO: server-side search when API adds query parameter

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">{t('page.title')}</h1>
      <div className="flex items-center gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('list.searchPlaceholder')}
          className="border p-2 rounded w-full max-w-sm"
        />
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {t('actions.new')}
        </button>
      </div>

      {isLoading && <div>{tCommon('status.loading')}</div>}
      {isError && <div>{tCommon('status.loadFailed')}</div>}

      {!isLoading && data ? (
        <div className="mt-4">
          {filtered.length > 0 ? (
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2">{t('table.name')}</th>
                  <th className="text-left p-2">{t('table.members')}</th>
                  <th className="p-2 text-right">{tCommon('table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => (
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
                          to={g.id ?? ''}
                          className="text-blue-600 hover:underline"
                        >
                          {g.name}
                        </Link>
                      )}
                    </td>
                    <td className="p-2 align-top">{g.memberIds?.length ?? 0}</td>
                    <td className="p-2 text-right align-top">
                      {editingId === g.id ? null : (
                        <div className="flex gap-2 justify-end">
                          <button
                            className="px-2 py-1 text-sm bg-gray-200 rounded"
                            onClick={() => setEditingId(g.id!)}
                          >
                            {tCommon('actions.edit')}
                          </button>
                          <button
                            className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                            onClick={() => deleteMut.mutate(g.id!)}
                          >
                            {tCommon('actions.delete')}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>{t('list.empty')}</div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={pageParam === 0}
              onClick={() => goToPage(Math.max(0, pageParam - 1))}
            >
              {tCommon('pagination.previous')}
            </button>
            <span>
              {tCommon('pagination.pageOf', {
                page: (data.number ?? 0) + 1,
                total: data.totalPages ?? 1,
              })}
            </span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={
                data.number !== undefined &&
                data.totalPages !== undefined &&
                data.number + 1 >= data.totalPages
              }
              onClick={() => goToPage(pageParam + 1)}
            >
              {tCommon('pagination.next')}
            </button>
          </div>
        </div>
      ) : null}

      <Modal open={creating} onClose={() => setCreating(false)}>
        <h2 className="text-lg font-semibold mb-2">{t('modals.createTitle')}</h2>
        <GroupForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      </Modal>
    </div>
  );
}
