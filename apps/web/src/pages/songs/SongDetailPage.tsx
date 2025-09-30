import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { components } from '../../api/types';
import {
  useSong,
  useUpdateSong,
  useArrangements,
  useCreateArrangement,
  useUpdateArrangement,
  useDeleteArrangement,
} from '../../features/songs/hooks';
import SongForm from '../../features/songs/SongForm';
import ArrangementForm from '../../features/songs/ArrangementForm';
import { formatBpm, formatDate } from '@/i18n/intl';
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
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white p-4 rounded shadow max-w-3xl w-full max-h-[calc(100vh-4rem)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

type SongRequest = components['schemas']['SongRequest'];
type Arrangement = components['schemas']['ArrangementResponse'];
type ArrangementRequest = components['schemas']['ArrangementRequest'];
type SongResponseWithTimestamps = components['schemas']['SongResponse'] & {
  updatedAt?: string | null;
};

export default function SongDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation('songs');
  const { t: tArrangements } = useTranslation('arrangements');
  const { t: tCommon } = useTranslation('common');
  const { hasRole } = useAuth();
  const { data: song, isLoading, isError } = useSong(id);
  const { data: arrangements } = useArrangements(id);

  const updateSongMut = useUpdateSong();
  const createArrMut = useCreateArrangement(id!);
  const updateArrMut = useUpdateArrangement();
  const deleteArrMut = useDeleteArrangement();

  const [editingSong, setEditingSong] = useState(false);
  const [creatingArr, setCreatingArr] = useState(false);
  const [editingArr, setEditingArr] = useState<Arrangement | null>(null);

  const canManageSongs = hasRole('ADMIN') || hasRole('PLANNER');

  if (isLoading) return <div className="p-4">{tCommon('status.loading')}</div>;
  if (isError || !song) return <div className="p-4">{tCommon('status.loadFailed')}</div>;

  const handleSongUpdate = (vals: SongRequest) => {
    updateSongMut.mutate({ id: id!, body: vals }, { onSuccess: () => setEditingSong(false) });
  };

  const handleCreateArr = (vals: ArrangementRequest) => {
    createArrMut.mutate(vals, { onSuccess: () => setCreatingArr(false) });
  };

  const handleUpdateArr = (arrId: string, vals: ArrangementRequest) => {
    updateArrMut.mutate(
      { arrangementId: arrId, body: vals },
      { onSuccess: () => setEditingArr(null) },
    );
  };

  const handleDeleteArr = (arrId: string) => {
    deleteArrMut.mutate(arrId);
  };

  const updatedAtRaw = (song as SongResponseWithTimestamps).updatedAt;
  const formattedUpdatedAt = updatedAtRaw
    ? formatDate(updatedAtRaw, i18n.language)
    : null;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{song.title}</h1>
        {canManageSongs && (
          <button
            className="px-2 py-1 text-sm bg-gray-200 rounded"
            onClick={() => setEditingSong(true)}
          >
            {tCommon('actions.edit')}
          </button>
        )}
      </div>
      <div className="mb-6 space-y-1">
        {song.author && (
          <div>
            {t('detail.author')}: {song.author}
          </div>
        )}
        {song.ccli && (
          <div>
            {t('detail.ccli')}: {song.ccli}
          </div>
        )}
        {song.defaultKey && (
          <div>
            {t('detail.defaultKey')}: {song.defaultKey}
          </div>
        )}
        {song.tags && song.tags.length > 0 && (
          <div>
            {t('detail.tags')}: {song.tags.join(', ')}
          </div>
        )}
        {formattedUpdatedAt && (
          <div className="text-sm text-gray-600">
            {t('lastUpdated', { date: formattedUpdatedAt })}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">{tArrangements('page.title')}</h2>
        {canManageSongs && (
          <button
            className="px-2 py-1 text-sm bg-blue-500 text-white rounded"
            onClick={() => setCreatingArr(true)}
          >
            {tArrangements('actions.new')}
          </button>
        )}
      </div>
      {arrangements && arrangements.length > 0 ? (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-2">{tArrangements('table.key')}</th>
              <th className="text-left p-2">{tArrangements('table.bpm')}</th>
              <th className="text-left p-2">{tArrangements('table.meter')}</th>
              {canManageSongs && (
                <th className="p-2 text-right">{tCommon('table.actions')}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {arrangements.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-2">{a.key}</td>
                <td className="p-2">{a.bpm != null ? formatBpm(a.bpm, i18n.language) : ''}</td>
                <td className="p-2">{a.meter}</td>
                {canManageSongs && (
                  <td className="p-2 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        className="px-2 py-1 text-sm bg-gray-200 rounded"
                        onClick={() => setEditingArr(a)}
                      >
                        {tCommon('actions.edit')}
                      </button>
                      <button
                        className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                        onClick={() => a.id && handleDeleteArr(a.id)}
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
      ) : (
        <div>{tArrangements('list.empty')}</div>
      )}
      {canManageSongs && (
        <>
          <Modal open={editingSong} onClose={() => setEditingSong(false)}>
            <h2 className="text-lg font-semibold mb-2">
              {t('modals.editTitle')}
            </h2>
            <SongForm
              defaultValues={{
                title: song.title || '',
                ccli: song.ccli || '',
                author: song.author || '',
                defaultKey: song.defaultKey || '',
                tags: song.tags?.join(', ') || '',
              }}
              onSubmit={handleSongUpdate}
              onCancel={() => setEditingSong(false)}
            />
          </Modal>
          <Modal open={creatingArr} onClose={() => setCreatingArr(false)}>
            <h2 className="text-lg font-semibold mb-2">
              {tArrangements('modals.createTitle')}
            </h2>
            <ArrangementForm
              onSubmit={handleCreateArr}
              onCancel={() => setCreatingArr(false)}
            />
          </Modal>
          <Modal open={!!editingArr} onClose={() => setEditingArr(null)}>
            <h2 className="text-lg font-semibold mb-2">
              {tArrangements('modals.editTitle')}
            </h2>
            {editingArr && (
              <ArrangementForm
                defaultValues={{
                  key: editingArr.key || '',
                  bpm: editingArr.bpm,
                  meter: editingArr.meter || '',
                  lyricsChordpro: editingArr.lyricsChordpro || '',
                }}
                onSubmit={(vals) => handleUpdateArr(editingArr.id!, vals)}
                onCancel={() => setEditingArr(null)}
              />
            )}
          </Modal>
        </>
      )}
    </div>
  );
}
