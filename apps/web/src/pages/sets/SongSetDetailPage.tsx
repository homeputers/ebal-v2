import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import SongPicker from '@/components/pickers/SongPicker';
import ArrangementPicker from '@/components/pickers/ArrangementPicker';
import SetForm, { type SetFormValues } from '@/features/sets/SetForm';
import {
  useSongSet,
  useSetItems,
  useAddSetItem,
  useUpdateSetItem,
  useRemoveSetItem,
  useUpdateSet,
  useReorderSetItems,
} from '@/features/sets/hooks';
import type { ListSetItemsResponse } from '@/api/sets';
import { useArrangementLabels } from '@/hooks/useArrangementLabels';
import type { ArrangementLabel } from '@/lib/arrangements-cache';
import { formatArrangementLine, formatKeyTransform } from '@/lib/arrangement-labels';
import { computeKeys } from '@/lib/keys';

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
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

type SongSetItem = ListSetItemsResponse extends Array<infer Item> ? Item : never;
type SongSetItemWithId = SongSetItem & { id: string };

type SortableSetItemProps = {
  item: SongSetItemWithId;
  arrangement?: ArrangementLabel;
  onTransposeChange: (itemId: string, next: number) => void;
  onCapoChange: (itemId: string, next: number) => void;
  onRemove: (itemId: string) => void;
  useFlats: boolean;
};

function SortableSetItem({
  item,
  arrangement,
  onTransposeChange,
  onCapoChange,
  onRemove,
  useFlats,
}: SortableSetItemProps) {
  const { t } = useTranslation('songSets');
  const { t: tCommon } = useTranslation('common');
  const { t: tArrangements } = useTranslation('arrangements');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : undefined,
  };

  const transpose = item.transpose ?? 0;
  const capo = item.capo ?? 0;

  const handleTranspose = (delta: number) => {
    const next = Math.max(-6, Math.min(6, transpose + delta));
    onTransposeChange(item.id, next);
  };

  const handleCapo = (value: number) => {
    const next = Math.max(0, Math.min(7, value));
    onCapoChange(item.id, next);
  };

  const keyInfo = arrangement?.key
    ? computeKeys(arrangement.key, transpose, capo, useFlats)
    : undefined;

  const line = formatArrangementLine(tArrangements, {
    songTitle:
      arrangement?.songTitle ??
      (item.arrangementId
        ? tArrangements('labels.fallback', { id: item.arrangementId })
        : undefined),
    key: keyInfo?.originalKey ?? arrangement?.key ?? null,
    bpm: arrangement?.bpm ?? null,
    meter: arrangement?.meter ?? null,
  });

  const keySummary = formatKeyTransform(tArrangements, {
    originalKey: keyInfo?.originalKey ?? arrangement?.key ?? tCommon('labels.notAvailable'),
    soundingKey: keyInfo?.soundingKey ?? arrangement?.key ?? tCommon('labels.notAvailable'),
    shapeKey: keyInfo?.shapeKey,
    transpose,
    capo,
  });

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="border rounded p-3 bg-white shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{line}</div>
          <div className="text-sm text-muted-foreground">{keySummary}</div>
        </div>
        <button
          type="button"
          aria-label={t('items.dragHandle')}
          className="cursor-grab text-gray-500 hover:text-gray-700 px-2"
          {...attributes}
          {...listeners}
        >
          <span aria-hidden="true">{t('items.dragHandleIcon')}</span>
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{t('items.transpose')}</span>
          <div className="flex items-center border rounded">
            <button
              type="button"
              onClick={() => handleTranspose(-1)}
              className="px-2 py-1 text-sm"
              disabled={transpose <= -6}
            >
              −
            </button>
            <span className="px-3 w-12 text-center text-sm">
              {transpose > 0 ? `+${transpose}` : transpose}
            </span>
            <button
              type="button"
              onClick={() => handleTranspose(1)}
              className="px-2 py-1 text-sm"
              disabled={transpose >= 6}
            >
              +
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          {t('items.capo')}
          <input
            type="number"
            min={0}
            max={7}
            value={capo}
            onChange={(e) => {
              const numeric = Number(e.target.value);
              if (!Number.isNaN(numeric)) {
                handleCapo(numeric);
              }
            }}
            className="w-16 border rounded px-2 py-1 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="ml-auto px-3 py-1 text-sm bg-red-500 text-white rounded"
        >
          {tCommon('actions.delete')}
        </button>
      </div>
    </li>
  );
}

function clampTranspose(value: number) {
  return Math.max(-6, Math.min(6, value));
}

function clampCapo(value: number) {
  return Math.max(0, Math.min(7, value));
}

export default function SongSetDetailPage() {
  const { id } = useParams();
  const setId = id ?? '';
  const { t } = useTranslation('songSets');
  const { t: tCommon } = useTranslation('common');
  const { t: tArrangements } = useTranslation('arrangements');
  const { t: tSongs } = useTranslation('songs');

  const { data: songSet, isLoading, isError } = useSongSet(id);
  const { data: itemsData, isLoading: itemsLoading, isError: itemsError } = useSetItems(id ?? undefined);

  const [orderedItems, setOrderedItems] = useState<SongSetItemWithId[]>([]);
  const arrangementLabelsQuery = useArrangementLabels(orderedItems.map((item) => item.arrangementId));
  const arrangementLabels = arrangementLabelsQuery.data ?? {};

  const [editingSet, setEditingSet] = useState(false);
  const [songId, setSongId] = useState<string | undefined>();
  const [arrangementId, setArrangementId] = useState<string | undefined>();
  const [transpose, setTranspose] = useState(0);
  const [capo, setCapo] = useState(0);
  const [useFlats, setUseFlats] = useState(false);

  const addItemMut = useAddSetItem(setId);
  const updateItemMut = useUpdateSetItem();
  const removeItemMut = useRemoveSetItem();
  const updateSetMut = useUpdateSet();
  const reorderMut = useReorderSetItems(setId);

  useEffect(() => {
    if (!itemsData) return;
    const withIds = itemsData.filter((item): item is SongSetItemWithId => !!item?.id);
    const sorted = [...withIds].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    setOrderedItems(sorted);
  }, [itemsData]);

  const addArrangementLabelsQuery = useArrangementLabels(arrangementId ? [arrangementId] : []);
  const selectedArrangementInfo = arrangementId
    ? addArrangementLabelsQuery.data?.[arrangementId]
    : undefined;

  const previewKeySource = selectedArrangementInfo?.key;
  const previewKeyInfo = previewKeySource
    ? computeKeys(previewKeySource, transpose, capo, useFlats)
    : undefined;
  const previewLine = arrangementId
    ? formatArrangementLine(tArrangements, {
        songTitle:
          selectedArrangementInfo?.songTitle ??
          tArrangements('labels.fallback', { id: arrangementId }),
        key: previewKeyInfo?.originalKey ?? previewKeySource ?? null,
        bpm: selectedArrangementInfo?.bpm ?? null,
        meter: selectedArrangementInfo?.meter ?? null,
      })
    : null;
  const previewKeySummary = arrangementId
    ? formatKeyTransform(tArrangements, {
        originalKey:
          previewKeyInfo?.originalKey ?? previewKeySource ?? tCommon('labels.notAvailable'),
        soundingKey:
          previewKeyInfo?.soundingKey ?? previewKeySource ?? tCommon('labels.notAvailable'),
        shapeKey: previewKeyInfo?.shapeKey,
        transpose,
        capo,
      })
    : null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const sortableIds = useMemo(() => orderedItems.map((item) => item.id), [orderedItems]);

  if (!id) {
    return <div className="p-4">{t('status.noneSelected')}</div>;
  }

  if (isLoading) return <div className="p-4">{tCommon('status.loading')}</div>;
  if (isError || !songSet) return <div className="p-4">{t('status.loadFailed')}</div>;

  const handleAddItem = (e: FormEvent) => {
    e.preventDefault();
    if (!arrangementId) return;

    const nextTranspose = clampTranspose(transpose);
    const nextCapo = clampCapo(capo);

    addItemMut.mutate(
      {
        arrangementId,
        transpose: nextTranspose,
        capo: nextCapo,
        sortOrder: orderedItems.length,
      },
      {
        onSuccess: () => {
          toast(t('notifications.itemAdded'));
          setSongId(undefined);
          setArrangementId(undefined);
          setTranspose(0);
          setCapo(0);
        },
        onError: () => toast(t('notifications.addFailed')),
      },
    );
  };

  const handleTransposeChange = (itemId: string, next: number) => {
    const clamped = clampTranspose(next);
    const previous = orderedItems;
    const idx = previous.findIndex((item) => item.id === itemId);
    if (idx === -1) return;
    const updated = [...previous];
    updated[idx] = { ...updated[idx], transpose: clamped };
    setOrderedItems(updated);
    updateItemMut.mutate(
      { setId, itemId, body: { transpose: clamped } },
      {
        onError: () => setOrderedItems(previous),
      },
    );
  };

  const handleCapoChange = (itemId: string, next: number) => {
    const clamped = clampCapo(next);
    const previous = orderedItems;
    const idx = previous.findIndex((item) => item.id === itemId);
    if (idx === -1) return;
    const updated = [...previous];
    updated[idx] = { ...updated[idx], capo: clamped };
    setOrderedItems(updated);
    updateItemMut.mutate(
      { setId, itemId, body: { capo: clamped } },
      {
        onError: () => setOrderedItems(previous),
      },
    );
  };

  const handleRemove = (itemId: string) => {
    const previous = orderedItems;
    setOrderedItems(previous.filter((item) => item.id !== itemId));
    removeItemMut.mutate(
      { setId, itemId },
      {
        onError: () => setOrderedItems(previous),
      },
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedItems.findIndex((item) => item.id === active.id);
    const newIndex = orderedItems.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previous = orderedItems;
    const newItems = arrayMove(orderedItems, oldIndex, newIndex);
    setOrderedItems(newItems);
    reorderMut.mutate(newItems.map((item) => item.id), {
      onError: () => setOrderedItems(previous),
    });
  };

  const handleSetUpdate = (values: SetFormValues) => {
    updateSetMut.mutate(
      { id: setId, body: values },
      {
        onSuccess: () => setEditingSet(false),
      },
    );
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{songSet.name ?? t('fallback.title')}</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={`px-2 py-1 text-sm rounded border transition-colors ${
              useFlats
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-gray-200 text-gray-700 border-transparent'
            }`}
            onClick={() => setUseFlats((prev) => !prev)}
            aria-pressed={useFlats}
            title={useFlats ? t('controls.showSharps') : t('controls.showFlats')}
          >
            {t('controls.toggleAccidentals')}
          </button>
          <button
            type="button"
            className="px-2 py-1 text-sm bg-gray-200 rounded"
            onClick={() => setEditingSet(true)}
          >
            {tCommon('actions.edit')}
          </button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3 space-y-3">
          <h2 className="font-semibold">{t('items.addTitle')}</h2>
          <form onSubmit={handleAddItem} className="space-y-3">
            <SongPicker
              value={songId}
              onChange={(value) => {
                setSongId(value);
                setArrangementId(undefined);
              }}
              placeholder={tSongs('pickers.searchPlaceholder')}
            />
            <ArrangementPicker
              songId={songId}
              value={arrangementId}
              onChange={(value) => setArrangementId(value)}
            />
            {arrangementId && (
              <div className="text-xs text-muted-foreground space-y-0.5">
                <div>{previewLine}</div>
                <div>{previewKeySummary}</div>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-between text-sm text-gray-600">
                {t('items.transpose')}
                <input
                  type="number"
                  min={-6}
                  max={6}
                  value={transpose}
                  onChange={(e) => {
                    const numeric = Number(e.target.value);
                    if (!Number.isNaN(numeric)) {
                      setTranspose(clampTranspose(numeric));
                    }
                  }}
                  className="w-20 border rounded px-2 py-1 text-sm"
                />
              </label>
              <label className="flex items-center justify-between text-sm text-gray-600">
                {t('items.capo')}
                <input
                  type="number"
                  min={0}
                  max={7}
                  value={capo}
                  onChange={(e) => {
                    const numeric = Number(e.target.value);
                    if (!Number.isNaN(numeric)) {
                      setCapo(clampCapo(numeric));
                    }
                  }}
                  className="w-20 border rounded px-2 py-1 text-sm"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={addItemMut.isPending || !arrangementId}
              className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
            >
              {t('items.addButton')}
            </button>
          </form>
        </div>
        <div className="flex-1 space-y-3">
          <h2 className="font-semibold">{t('items.title')}</h2>
          {itemsLoading && <div>{tCommon('status.loading')}</div>}
          {itemsError && !itemsLoading && <div>{t('items.loadFailed')}</div>}
          {!itemsLoading && orderedItems.length === 0 && !itemsError && (
            <div>{t('items.empty')}</div>
          )}
          {!itemsLoading && orderedItems.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                <ul className="space-y-2">
                  {orderedItems.map((item) => (
                    <SortableSetItem
                      key={item.id}
                      item={item}
                      arrangement={item.arrangementId ? arrangementLabels[item.arrangementId] : undefined}
                      onTransposeChange={handleTransposeChange}
                      onCapoChange={handleCapoChange}
                      onRemove={handleRemove}
                      useFlats={useFlats}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
          {reorderMut.isPending && (
            <div className="text-sm text-gray-500">{t('status.savingOrder')}</div>
          )}
        </div>
      </div>
      <Modal open={editingSet} onClose={() => setEditingSet(false)}>
        <h2 className="text-lg font-semibold mb-2">{t('modals.editTitle')}</h2>
        <SetForm
          defaultValues={{ name: songSet.name ?? '' }}
          onSubmit={handleSetUpdate}
          onCancel={() => setEditingSet(false)}
        />
      </Modal>
    </div>
  );
}
