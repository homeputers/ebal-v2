import { useEffect, useId, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useSongSetsList,
  useCreateSet,
  useUpdateSet,
  useDeleteSet,
} from '../../features/sets/hooks';
import SetForm, { SetFormValues } from '../../features/sets/SetForm';
import type { ListSetsParams, ListSetsResponse } from '../../api/sets';
import Modal from '../../components/Modal';

type SongSetsQueryParams = ListSetsParams & { query?: string };
type SongSetRow =
  NonNullable<ListSetsResponse['content']>[number] & { itemsCount?: number | null };


const PAGE_SIZE = 20;

export default function SongSetsPage() {
  const { t } = useTranslation('songSets');
  const { t: tCommon } = useTranslation('common');
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('query') ?? '';
  const rawPage = Number(searchParams.get('page') ?? '0');
  const pageParam = Number.isNaN(rawPage) ? 0 : rawPage;
  const [search, setSearch] = useState(queryParam);

  useEffect(() => {
    setSearch(queryParam);
  }, [queryParam]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (search) {
        params.set('query', search);
      } else {
        params.delete('query');
      }
      params.set('page', '0');
      setSearchParams(params);
    }, 300);

    return () => clearTimeout(handle);
  }, [search]);

  const params = useMemo(() => {
    const nextParams: SongSetsQueryParams = {
      page: pageParam,
      size: PAGE_SIZE,
    };

    if (queryParam) {
      nextParams.query = queryParam;
    }

    return nextParams;
  }, [pageParam, queryParam]);

  const { data, isLoading, isError } = useSongSetsList(params);

  const createMut = useCreateSet();
  const updateMut = useUpdateSet();
  const deleteMut = useDeleteSet();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const createTitleId = useId();
  const editTitleId = useId();

  const handleCreate = (values: SetFormValues) => {
    createMut.mutate(values, {
      onSuccess: () => setCreating(false),
    });
  };

  const handleUpdate = (id: string, values: SetFormValues) => {
    updateMut.mutate(
      { id, body: values },
      {
        onSuccess: () => setEditing(null),
      },
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirm.delete'))) {
      deleteMut.mutate(id);
    }
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(Math.max(0, page)));
    setSearchParams(params);
  };

  const sets = (data?.content ?? []) as SongSetRow[];
  const hasResults = sets.length > 0;

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
      {isError && <div>{t('status.loadFailed')}</div>}

      {!isLoading && data ? (
        <div className="mt-4">
          {hasResults ? (
            <>
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2">{t('table.name')}</th>
                    <th className="text-left p-2">{t('table.items')}</th>
                    <th className="p-2 text-right">{tCommon('table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sets.map((set) => {
                    const setId = set.id;
                    if (!setId) return null;

                    const itemsCount =
                      typeof set.itemsCount === 'number' ? set.itemsCount : null;

                    return (
                      <tr key={setId} className="border-t">
                        <td className="p-2 align-top">{set.name}</td>
                        <td className="p-2 align-top">{itemsCount ?? '—'}</td>
                        <td className="p-2 text-right align-top">
                          <div className="flex gap-2 justify-end">
                            <Link
                              to={setId}
                              className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                            >
                              {tCommon('actions.open')}
                            </Link>
                            <button
                              className="px-2 py-1 text-sm bg-gray-200 rounded"
                              onClick={() => setEditing({ id: setId, name: set.name ?? '' })}
                            >
                              {tCommon('actions.edit')}
                            </button>
                            <button
                              className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                              onClick={() => handleDelete(setId)}
                            >
                              {tCommon('actions.delete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex items-center gap-2 mt-4">
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  disabled={pageParam === 0}
                  onClick={() => goToPage(pageParam - 1)}
                >
                  {tCommon('pagination.previous')}
                </button>
                <span>
                  {tCommon('pagination.pageOf', {
                    page: (data.number ?? pageParam) + 1,
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
            </>
          ) : (
            <div>{t('list.empty')}</div>
          )}
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
        <SetForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        closeLabel={tCommon('actions.close', { defaultValue: 'Close dialog' })}
        titleId={editTitleId}
      >
        <h2 id={editTitleId} className="text-lg font-semibold mb-2">
          {t('modals.editTitle')}
        </h2>
        {editing && (
          <SetForm
            defaultValues={{ name: editing.name }}
            onSubmit={(values) => handleUpdate(editing.id, values)}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}
