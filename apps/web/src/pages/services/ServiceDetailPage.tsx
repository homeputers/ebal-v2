import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import type { components } from '../../api/types';
import {
  useService,
  useUpdateService,
  usePlanItems,
  useAddPlanItem,
  useUpdatePlanItem,
  useRemovePlanItem,
} from '../../features/services/hooks';
import { getSong, listArrangements } from '@/api/songs';
import SongPicker from '@/components/pickers/SongPicker';
import ArrangementPicker from '@/components/pickers/ArrangementPicker';
import ServiceForm from '../../features/services/ServiceForm';
import { usePlanArrangementInfo } from '@/features/services/usePlanArrangementInfo';
import { formatArrangementLine, formatKeyTransform } from '@/lib/arrangement-labels';
import { computeKeys } from '@/lib/keys';
import { withLangKey } from '@/lib/queryClient';
import { formatDate } from '@/i18n/intl';

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

type ServiceRequest = components['schemas']['ServiceRequest'];

const addSchema = z
  .object({
    type: z.enum(['song', 'reading', 'note']),
    arrangementId: z.string().uuid().optional(),
    notes: z.string().max(1000).optional(),
  })
  .refine((d) => d.type !== 'song' || !!d.arrangementId, {
    message: 'validation.arrangementRequired',
    path: ['arrangementId'],
  });

type AddItemForm = z.infer<typeof addSchema>;

export default function ServiceDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation('services');
  const { t: tCommon } = useTranslation('common');
  const { t: tSongs } = useTranslation('songs');
  const { t: tArrangements } = useTranslation('arrangements');
  const { data: service, isLoading, isError } = useService(id);
  const { data: planItems, isLoading: planLoading } = usePlanItems(id);
  const { data: arrangementLabels } = usePlanArrangementInfo(planItems);

  const updateServiceMut = useUpdateService();
  const addItemMut = useAddPlanItem(id!);
  const updateItemMut = useUpdatePlanItem(id!);
  const removeItemMut = useRemovePlanItem(id!);

  const [editingService, setEditingService] = useState(false);
  const [songId, setSongId] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddItemForm>({
    resolver: zodResolver(addSchema),
    defaultValues: { type: 'note' },
  });

  const type = watch('type');
  const arrangementId = watch('arrangementId');

  const { data: song } = useQuery({
    queryKey: withLangKey(['song', songId]),
    queryFn: () => getSong(songId!),
    enabled: !!songId,
  });
  const { data: arrangements } = useQuery({
    queryKey: withLangKey(['arrangements', songId]),
    queryFn: () => listArrangements(songId!),
    enabled: !!songId,
  });
  const selectedArrangement = arrangements?.find((a) => a.id === arrangementId);
  const arrangementLabelMap = arrangementLabels ?? {};
  const selectedLabel = arrangementId ? arrangementLabelMap[arrangementId] : undefined;
  const previewKeySource = selectedLabel?.key ?? selectedArrangement?.key ?? null;
  const previewKeyInfo = previewKeySource ? computeKeys(previewKeySource, 0, 0, false) : undefined;
  const previewLine = arrangementId
    ? formatArrangementLine(tArrangements, {
        songTitle:
          selectedLabel?.songTitle ??
          song?.title ??
          tArrangements('labels.fallback', { id: arrangementId }),
        key: previewKeyInfo?.originalKey ?? previewKeySource ?? null,
        bpm: selectedLabel?.bpm ?? selectedArrangement?.bpm ?? null,
        meter: selectedLabel?.meter ?? selectedArrangement?.meter ?? null,
      })
    : null;
  const previewKeySummary = arrangementId
    ? formatKeyTransform(tArrangements, {
        originalKey:
          previewKeyInfo?.originalKey ?? previewKeySource ?? tCommon('labels.notAvailable'),
        soundingKey:
          previewKeyInfo?.soundingKey ?? previewKeySource ?? tCommon('labels.notAvailable'),
        shapeKey: previewKeyInfo?.shapeKey,
        transpose: 0,
        capo: 0,
      })
    : null;

  if (isLoading) return <div className="p-4">{tCommon('status.loading')}</div>;
  if (isError || !service) return <div className="p-4">{tCommon('status.loadFailed')}</div>;

  const handleServiceUpdate = (vals: ServiceRequest) => {
    updateServiceMut.mutate({ id: id!, body: vals }, { onSuccess: () => setEditingService(false) });
  };

  const handleAddItem = handleSubmit((vals) => {
    addItemMut.mutate(
      {
        type: vals.type,
        refId: vals.arrangementId,
        notes: vals.notes,
        sortOrder: planItems ? planItems.length : 0,
      },
      {
        onSuccess: () => {
          toast(t('plan.notifications.itemAdded'));
          reset({ type: 'note' });
          setSongId(undefined);
        },
        onError: () => toast(t('plan.notifications.addFailed')),
      },
    );
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {service.startsAt
              ? formatDate(service.startsAt, i18n.language)
              : t('fallback.title')}
          </h1>
          {service.location && <div>{service.location}</div>}
        </div>
        <div className="flex gap-2">
          <Link
            to={`plan?share=preview`}
            className="px-2 py-1 text-sm bg-indigo-500 text-white rounded"
          >
            {t('actions.planView')}
          </Link>
          <button
            className="px-2 py-1 text-sm bg-gray-200 rounded"
            onClick={() => setEditingService(true)}
          >
            {tCommon('actions.edit')}
          </button>
          <Link
            to="print"
            className="px-2 py-1 text-sm bg-blue-500 text-white rounded"
          >
            {tCommon('actions.print')}
          </Link>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <h2 className="font-semibold mb-2">{t('plan.addItemTitle')}</h2>
          <form onSubmit={handleAddItem} className="space-y-2">
            <select {...register('type')} className="border p-2 rounded w-full">
              <option value="song">{t('plan.itemTypes.song')}</option>
              <option value="reading">{t('plan.itemTypes.reading')}</option>
              <option value="note">{t('plan.itemTypes.note')}</option>
            </select>
            {type === 'song' && (
              <div className="space-y-2">
                <SongPicker
                  value={songId}
                  onChange={(id) => {
                    setSongId(id);
                    setValue('arrangementId', undefined);
                  }}
                  placeholder={tSongs('pickers.searchPlaceholder')}
                />
                <ArrangementPicker
                  songId={songId}
                  value={arrangementId}
                  onChange={(id) => setValue('arrangementId', id)}
                />
                {arrangementId && previewLine && previewKeySummary && (
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>{previewLine}</div>
                    <div>{previewKeySummary}</div>
                  </div>
                )}
                {errors.arrangementId && (
                  <p className="text-red-500 text-sm">
                    {t(errors.arrangementId.message ?? '', {
                      defaultValue: errors.arrangementId.message ?? '',
                    })}
                  </p>
                )}
              </div>
            )}
            <textarea
              placeholder={t('plan.notesPlaceholder')}
              className="border p-2 rounded w-full"
              {...register('notes')}
            />
            {errors.notes && (
              <p className="text-red-500 text-sm">
                {t(errors.notes.message ?? '', {
                  defaultValue: errors.notes.message ?? '',
                })}
              </p>
            )}
            <button
              type="submit"
              disabled={addItemMut.isPending || (type === 'song' && !arrangementId)}
              className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
            >
              {tCommon('actions.add')}
            </button>
          </form>
        </div>
        <div className="flex-1">
          <h2 className="font-semibold mb-2">{t('plan.title')}</h2>
          {planLoading && <div>{tCommon('status.loading')}</div>}
          {!planLoading && planItems && planItems.length > 0 ? (
            <ul className="space-y-2">
              {planItems.map((item) => {
                let line: string | null = null;
                let keySummary: string | null = null;

                if (item.type === 'song' && item.refId) {
                  const label = arrangementLabelMap[item.refId];
                  const fallbackTitle = tArrangements('labels.fallback', { id: item.refId });
                  const extras = item as Record<string, unknown>;
                  const transpose =
                    typeof extras['transpose'] === 'number' ? (extras['transpose'] as number) : 0;
                  const capo = typeof extras['capo'] === 'number' ? (extras['capo'] as number) : 0;
                  const keyInfo = label?.key
                    ? computeKeys(label.key, transpose, capo, false)
                    : undefined;

                  line = formatArrangementLine(tArrangements, {
                    songTitle: label?.songTitle ?? fallbackTitle,
                    key: keyInfo?.originalKey ?? label?.key ?? null,
                    bpm: label?.bpm ?? null,
                    meter: label?.meter ?? null,
                  });
                  keySummary = formatKeyTransform(tArrangements, {
                    originalKey:
                      keyInfo?.originalKey ?? label?.key ?? tCommon('labels.notAvailable'),
                    soundingKey:
                      keyInfo?.soundingKey ?? label?.key ?? tCommon('labels.notAvailable'),
                    shapeKey: keyInfo?.shapeKey,
                    transpose,
                    capo,
                  });
                }

                return (
                  <li key={item.id} className="border p-2 rounded">
                    <div className="flex justify-between mb-2">
                      <div className="space-y-1">
                        <div className="font-semibold capitalize">
                          {t('plan.itemTypes.' + item.type, {
                            defaultValue: item.type,
                          })}
                        </div>
                        {line ? (
                          <div className="space-y-0.5">
                            <div>{line}</div>
                            {keySummary ? (
                              <div className="text-sm text-muted-foreground">{keySummary}</div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                      <button
                        className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                        onClick={() => item.id && removeItemMut.mutate(item.id)}
                      >
                        {tCommon('actions.remove')}
                      </button>
                    </div>
                    <textarea
                      defaultValue={item.notes || ''}
                      className="w-full border p-1 rounded"
                      onBlur={(e) =>
                        item.id &&
                        updateItemMut.mutate({ id: item.id, body: { notes: e.target.value } })
                      }
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            !planLoading && <div>{t('plan.empty')}</div>
          )}
        </div>
      </div>
      <Modal open={editingService} onClose={() => setEditingService(false)}>
        <h2 className="text-lg font-semibold mb-2">{t('modals.editTitle')}</h2>
        <ServiceForm
          defaultValues={{
            startsAt: service.startsAt ? service.startsAt.slice(0, 16) : '',
            location: service.location || '',
          }}
          onSubmit={handleServiceUpdate}
          onCancel={() => setEditingService(false)}
        />
      </Modal>
    </div>
  );
}
