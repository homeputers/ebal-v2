import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
    message: 'Arrangement required',
    path: ['arrangementId'],
  });

type AddItemForm = z.infer<typeof addSchema>;

export default function ServiceDetailPage() {
  const { id } = useParams();
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
    queryKey: ['song', songId],
    queryFn: () => getSong(songId!),
    enabled: !!songId,
  });
  const { data: arrangements } = useQuery({
    queryKey: ['arrangements', songId],
    queryFn: () => listArrangements(songId!),
    enabled: !!songId,
  });
  const selectedArrangement = arrangements?.find((a) => a.id === arrangementId);
  const arrangementLabelMap = arrangementLabels ?? {};
  const selectedLabel = arrangementId ? arrangementLabelMap[arrangementId] : undefined;
  const previewKeySource = selectedLabel?.key ?? selectedArrangement?.key ?? null;
  const previewKeyInfo = previewKeySource ? computeKeys(previewKeySource, 0, 0, false) : undefined;
  const previewLine = arrangementId
    ? formatArrangementLine({
        songTitle: selectedLabel?.songTitle ?? song?.title ?? `Arrangement ${arrangementId}`,
        key: previewKeyInfo?.originalKey ?? previewKeySource ?? null,
        bpm: selectedLabel?.bpm ?? selectedArrangement?.bpm ?? null,
        meter: selectedLabel?.meter ?? selectedArrangement?.meter ?? null,
      })
    : null;
  const previewKeySummary = arrangementId
    ? formatKeyTransform({
        originalKey: previewKeyInfo?.originalKey ?? previewKeySource ?? 'N/A',
        soundingKey: previewKeyInfo?.soundingKey ?? previewKeySource ?? 'N/A',
        shapeKey: previewKeyInfo?.shapeKey,
        transpose: 0,
        capo: 0,
      })
    : null;

  if (isLoading) return <div className="p-4">Loading…</div>;
  if (isError || !service) return <div className="p-4">Failed to load</div>;

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
          toast('Item added');
          reset({ type: 'note' });
          setSongId(undefined);
        },
        onError: () => toast('Failed to add item'),
      },
    );
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {service.startsAt ? new Date(service.startsAt).toLocaleString() : 'Service'}
          </h1>
          {service.location && <div>{service.location}</div>}
        </div>
        <div className="flex gap-2">
          <Link
            to={`plan?share=preview`}
            className="px-2 py-1 text-sm bg-indigo-500 text-white rounded"
          >
            Plan View
          </Link>
          <button
            className="px-2 py-1 text-sm bg-gray-200 rounded"
            onClick={() => setEditingService(true)}
          >
            Edit
          </button>
          <Link
            to="print"
            className="px-2 py-1 text-sm bg-blue-500 text-white rounded"
          >
            Print
          </Link>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <h2 className="font-semibold mb-2">Add Item</h2>
          <form onSubmit={handleAddItem} className="space-y-2">
            <select {...register('type')} className="border p-2 rounded w-full">
              <option value="song">Song</option>
              <option value="reading">Reading</option>
              <option value="note">Note</option>
            </select>
            {type === 'song' && (
              <div className="space-y-2">
                <SongPicker
                  value={songId}
                  onChange={(id) => {
                    setSongId(id);
                    setValue('arrangementId', undefined);
                  }}
                  placeholder="Search songs..."
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
                  <p className="text-red-500 text-sm">{errors.arrangementId.message}</p>
                )}
              </div>
            )}
            <textarea
              placeholder="Notes"
              className="border p-2 rounded w-full"
              {...register('notes')}
            />
            {errors.notes && (
              <p className="text-red-500 text-sm">{errors.notes.message}</p>
            )}
            <button
              type="submit"
              disabled={addItemMut.isPending || (type === 'song' && !arrangementId)}
              className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
            >
              Add
            </button>
          </form>
        </div>
        <div className="flex-1">
          <h2 className="font-semibold mb-2">Plan</h2>
          {planLoading && <div>Loading…</div>}
          {!planLoading && planItems && planItems.length > 0 ? (
            <ul className="space-y-2">
              {planItems.map((item) => {
                let line: string | null = null;
                let keySummary: string | null = null;

                if (item.type === 'song' && item.refId) {
                  const label = arrangementLabelMap[item.refId];
                  const fallbackTitle = `Arrangement ${item.refId}`;
                  const extras = item as Record<string, unknown>;
                  const transpose =
                    typeof extras['transpose'] === 'number' ? (extras['transpose'] as number) : 0;
                  const capo = typeof extras['capo'] === 'number' ? (extras['capo'] as number) : 0;
                  const keyInfo = label?.key
                    ? computeKeys(label.key, transpose, capo, false)
                    : undefined;

                  line = formatArrangementLine({
                    songTitle: label?.songTitle ?? fallbackTitle,
                    key: keyInfo?.originalKey ?? label?.key ?? null,
                    bpm: label?.bpm ?? null,
                    meter: label?.meter ?? null,
                  });
                  keySummary = formatKeyTransform({
                    originalKey: keyInfo?.originalKey ?? label?.key ?? 'N/A',
                    soundingKey: keyInfo?.soundingKey ?? label?.key ?? 'N/A',
                    shapeKey: keyInfo?.shapeKey,
                    transpose,
                    capo,
                  });
                }

                return (
                  <li key={item.id} className="border p-2 rounded">
                    <div className="flex justify-between mb-2">
                      <div className="space-y-1">
                        <div className="font-semibold capitalize">{item.type}</div>
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
                        Remove
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
            !planLoading && <div>No plan items</div>
          )}
        </div>
      </div>
      <Modal open={editingService} onClose={() => setEditingService(false)}>
        <h2 className="text-lg font-semibold mb-2">Edit Service</h2>
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
