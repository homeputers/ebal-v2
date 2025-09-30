import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { components } from '../../api/types';
import {
  useSongsList,
  useCreateSong,
  useUpdateSong,
  useDeleteSong,
} from '../../features/songs/hooks';
import SongForm from '../../features/songs/SongForm';
import { useAuth } from '../../features/auth/useAuth';

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

type Song = components['schemas']['SongResponse'];
type SongRequest = components['schemas']['SongRequest'];

export default function SongsPage() {
  const { t } = useTranslation('songs');
  const { t: tCommon } = useTranslation('common');
  const { hasRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const titleParam = searchParams.get('title') ?? '';
  const tagParam = searchParams.get('tag') ?? '';
  const pageParam = Number(searchParams.get('page') ?? '0');
  const [search, setSearch] = useState(titleParam);

  useEffect(() => {
    setSearch(titleParam);
  }, [titleParam]);

  useEffect(() => {
    const h = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (search) params.set('title', search);
      else params.delete('title');
      params.set('page', '0');
      setSearchParams(params);
    }, 300);
    return () => clearTimeout(h);
  }, [search]);

  const params = useMemo(
    () => ({
      title: titleParam || undefined,
      tag: tagParam || undefined,
      page: pageParam,
      size: 20,
    }),
    [titleParam, tagParam, pageParam],
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError } = useSongsList(params as any);

  const createMut = useCreateSong();
  const updateMut = useUpdateSong();
  const deleteMut = useDeleteSong();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Song | null>(null);

  const canManageSongs = hasRole('ADMIN') || hasRole('PLANNER');

  const handleCreate = (vals: SongRequest) => {
    createMut.mutate(vals, { onSuccess: () => setCreating(false) });
  };

  const handleUpdate = (id: string, vals: SongRequest) => {
    updateMut.mutate({ id, body: vals }, { onSuccess: () => setEditing(null) });
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    setSearchParams(params);
  };

  const tags = useMemo(() => {
    const set = new Set<string>();
    (data?.content || []).forEach((s) => s.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [data]);

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
        {canManageSongs && (
          <button
            onClick={() => setCreating(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {t('actions.new')}
          </button>
        )}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                if (tagParam === t) params.delete('tag');
                else params.set('tag', t);
                params.set('page', '0');
                setSearchParams(params);
              }}
              className={`px-2 py-1 text-sm border rounded ${
                tagParam === t ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}
      {isLoading && <div>{tCommon('status.loading')}</div>}
      {isError && <div>{tCommon('status.loadFailed')}</div>}
      {!isLoading && data ? (
        <div className="mt-4">
          {data.content && data.content.length > 0 ? (
            <>
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2">{t('fields.title')}</th>
                    <th className="text-left p-2">{t('fields.defaultKey')}</th>
                    <th className="text-left p-2">{t('fields.tags')}</th>
                    {canManageSongs && (
                      <th className="p-2 text-right">
                        {tCommon('table.actions')}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="p-2">
                        <Link
                          to={s.id ?? ''}
                          className="text-blue-600 hover:underline"
                        >
                          {s.title}
                        </Link>
                      </td>
                      <td className="p-2">{s.defaultKey}</td>
                      <td className="p-2">{s.tags?.join(', ')}</td>
                      {canManageSongs && (
                        <td className="p-2 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              className="px-2 py-1 text-sm bg-gray-200 rounded"
                              onClick={() => setEditing(s)}
                            >
                              {tCommon('actions.edit')}
                            </button>
                            <button
                              className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                              onClick={() => s.id && deleteMut.mutate(s.id)}
                            >
                              {tCommon('actions.delete')}
                            </button>
                          </div>
                        </td>
                      )}
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
            </>
          ) : (
            <div>{t('list.empty')}</div>
          )}
        </div>
      ) : null}
      {canManageSongs && (
        <>
          <Modal open={creating} onClose={() => setCreating(false)}>
            <h2 className="text-lg font-semibold mb-2">
              {t('modals.createTitle')}
            </h2>
            <SongForm
              onSubmit={handleCreate}
              onCancel={() => setCreating(false)}
            />
          </Modal>
          <Modal open={!!editing} onClose={() => setEditing(null)}>
            <h2 className="text-lg font-semibold mb-2">
              {t('modals.editTitle')}
            </h2>
            {editing && (
              <SongForm
                defaultValues={{
                  title: editing.title || '',
                  ccli: editing.ccli || '',
                  author: editing.author || '',
                  defaultKey: editing.defaultKey || '',
                  tags: editing.tags?.join(', ') || '',
                }}
                onSubmit={(vals) => handleUpdate(editing.id!, vals)}
                onCancel={() => setEditing(null)}
              />
            )}
          </Modal>
        </>
      )}
    </div>
  );
}
