import { useEffect, useId, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeading } from '@/components/layout/PageHeading';
import type { GroupFormValues } from '../../features/groups/GroupForm';
import {
  useGroupsList,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
} from '../../features/groups/hooks';
import GroupForm from '../../features/groups/GroupForm';
import Modal from '../../components/Modal';

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

  const handleDelete = (id: string) => {
    if (!window.confirm(t('list.deleteConfirm'))) {
      return;
    }

    deleteMut.mutate(id);
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    setSearchParams(params);
  };

  const filtered = (data?.content || []).filter((g) =>
    g.name?.toLowerCase().includes(queryParam.toLowerCase()),
  ); // TODO: server-side search when API adds query parameter

  const createTitleId = useId();
  const searchInputId = useId();
  const searchLabel =
    t('list.searchLabel', {
      defaultValue: t('list.searchPlaceholder', {
        defaultValue: tCommon('actions.search', { defaultValue: 'Search groups' }),
      }),
    }) || t('list.searchPlaceholder');

  return (
    <div className="p-4">
      <PageHeading autoFocus className="text-xl font-semibold mb-4">
        {t('page.title')}
      </PageHeading>
      <div className="flex items-center gap-2 mb-4">
        <label className="sr-only" htmlFor={searchInputId}>
          {searchLabel}
        </label>
        <input
          id={searchInputId}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('list.searchPlaceholder')}
          className="border p-2 rounded w-full max-w-sm"
        />
        <button
          type="button"
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
              <caption className="sr-only">{t('table.caption')}</caption>
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="text-left p-2">
                    {t('table.name')}
                  </th>
                  <th scope="col" className="text-left p-2">
                    {t('table.members')}
                  </th>
                  <th scope="col" className="p-2 text-right">
                    {tCommon('table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => (
                  <tr key={g.id} className="border-t">
                    <th scope="row" className="p-2 text-left font-normal align-top">
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
                    </th>
                    <td className="p-2 align-top">{g.memberIds?.length ?? 0}</td>
                    <td className="p-2 text-right align-top">
                      {editingId === g.id ? null : (
                        <div className="flex gap-2 justify-end">
                          <button
                            className="px-2 py-1 text-sm bg-gray-200 rounded"
                            type="button"
                            onClick={() => setEditingId(g.id!)}
                          >
                            {tCommon('actions.edit')}
                          </button>
                          <button
                            className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                            type="button"
                            onClick={() => g.id && handleDelete(g.id)}
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
            <div role="status" aria-live="polite">
              {t('list.empty')}
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={pageParam === 0}
              type="button"
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
              type="button"
              onClick={() => goToPage(pageParam + 1)}
            >
              {tCommon('pagination.next')}
            </button>
          </div>
        </div>
      ) : null}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        closeLabel={tCommon('actions.close', { defaultValue: 'Close dialog' })}
        titleId={createTitleId}
      >
        <h2 id={createTitleId} className="text-lg font-semibold mb-2">
          {t('modals.createTitle')}
        </h2>
        <GroupForm
          onSubmit={handleCreate}
          onCancel={() => setCreating(false)}
          autoFocusFirstField
        />
      </Modal>
    </div>
  );
}
