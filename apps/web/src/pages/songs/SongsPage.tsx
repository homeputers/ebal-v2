import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { components } from '../../api/types';
import {
  useSongsList,
  useCreateSong,
  useUpdateSong,
  useDeleteSong,
} from '../../features/songs/hooks';
import SongForm from '../../features/songs/SongForm';

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
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-4 rounded shadow max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

type Song = components['schemas']['SongResponse'];
type SongRequest = components['schemas']['SongRequest'];

export default function SongsPage() {
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
      <h1 className="text-xl font-semibold mb-4">Songs</h1>
      <div className="flex items-center gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title..."
          className="border p-2 rounded w-full max-w-sm"
        />
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          New Song
        </button>
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
      {isLoading && <div>Loading…</div>}
      {isError && <div>Failed to load</div>}
      {!isLoading && data ? (
        <div className="mt-4">
          {data.content && data.content.length > 0 ? (
            <>
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">Default Key</th>
                    <th className="text-left p-2">Tags</th>
                    <th className="p-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="p-2">
                        <Link
                          to={`/songs/${s.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {s.title}
                        </Link>
                      </td>
                      <td className="p-2">{s.defaultKey}</td>
                      <td className="p-2">{s.tags?.join(', ')}</td>
                      <td className="p-2 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            className="px-2 py-1 text-sm bg-gray-200 rounded"
                            onClick={() => setEditing(s)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                            onClick={() => s.id && deleteMut.mutate(s.id)}
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
                  Page {(data.number ?? 0) + 1} of {data.totalPages ?? 1}
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
                  Next
                </button>
              </div>
            </>
          ) : (
            <div>No songs found</div>
          )}
        </div>
      ) : null}
      <Modal open={creating} onClose={() => setCreating(false)}>
        <h2 className="text-lg font-semibold mb-2">New Song</h2>
        <SongForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)}>
        <h2 className="text-lg font-semibold mb-2">Edit Song</h2>
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
    </div>
  );
}
