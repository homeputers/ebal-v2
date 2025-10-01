import { useState, useEffect, useId, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useQuery } from '@tanstack/react-query';
import { listArrangements } from '@/api/songs';
import type { components } from '@/api/types';
import { withLangKey } from '@/lib/queryClient';
import {
  useListNavigation,
  type ListNavigationItem,
} from '@/hooks/useListNavigation';

interface Props {
  songId: string | undefined;
  value: string | undefined;
  onChange: (id: string | undefined) => void;
}

function formatLabel(
  tArrangements: TFunction<'arrangements'>,
  a: components['schemas']['ArrangementResponse'],
) {
  const separator = tArrangements('labels.meta.separator', { defaultValue: ' • ' });
  const parts = [
    a.key
      ? tArrangements('labels.meta.key', {
          key: a.key,
          defaultValue: `Key ${a.key}`,
        })
      : undefined,
    typeof a.bpm === 'number'
      ? tArrangements('labels.meta.bpm', {
          bpm: a.bpm,
          defaultValue: `${a.bpm} BPM`,
        })
      : undefined,
    a.meter
      ? tArrangements('labels.meta.meter', {
          meter: a.meter,
          defaultValue: a.meter,
        })
      : undefined,
  ].filter(Boolean) as string[];

  if (parts.length === 0) {
    return tArrangements('labels.generic', { defaultValue: 'Arrangement' });
  }

  return parts.join(separator);
}

export function ArrangementPicker({ songId, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const { t: tArrangements } = useTranslation('arrangements');
  const { t: tCommon } = useTranslation('common');
  const { data, isLoading, isError } = useQuery({
    queryKey: withLangKey(['arrangements', songId]),
    queryFn: () => listArrangements(songId!),
    enabled: !!songId,
  });
  const listboxId = useId();

  const options = data ?? [];
  const selected = options.find((a) => a.id === value);

  useEffect(() => {
    if (!songId) {
      onChange(undefined);
    }
  }, [songId, onChange]);

  const handleSelect = (a: components['schemas']['ArrangementResponse']) => {
    onChange(a.id);
    setOpen(false);
  };

  const navigationItems = useMemo<
    Array<ListNavigationItem<components['schemas']['ArrangementResponse']>>
  >(
    () =>
      options.map((arrangement, index) => ({
        id: `${listboxId}-${arrangement.id ?? index}`,
        text: formatLabel(tArrangements, arrangement),
        value: arrangement,
      })),
    [listboxId, options, tArrangements],
  );

  const selectedItemId = useMemo(() => {
    if (!value) {
      return null;
    }

    return (
      navigationItems.find((item) => item.value.id === value)?.id ?? null
    );
  }, [navigationItems, value]);

  const {
    listProps,
    getOptionProps,
    activeId,
    move,
    setActiveId,
    selectActive,
  } = useListNavigation({
    items: navigationItems,
    selectedId: selectedItemId,
    loop: true,
    onSelect: (item) => handleSelect(item.value),
    onCancel: () => setOpen(false),
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (selectedItemId) {
      setActiveId(selectedItemId);
      return;
    }

    const firstId = navigationItems[0]?.id ?? null;

    if (firstId) {
      setActiveId(firstId);
    }
  }, [navigationItems, open, selectedItemId, setActiveId]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      move('next');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      move('prev');
    } else if (event.key === 'Enter' && open) {
      event.preventDefault();
      selectActive(event);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
    }
  };

  const closeLater = () => setTimeout(() => setOpen(false), 100);

  if (!songId) {
    return (
      <input
        disabled
        placeholder="Select a song first"
        className="border p-2 rounded w-full bg-gray-100"
      />
    );
  }

  return (
    <div className="relative">
      <input
        value={selected ? formatLabel(tArrangements, selected) : ''}
        readOnly
        placeholder="Select arrangement"
        onFocus={() => setOpen(true)}
        onBlur={closeLater}
        onKeyDown={handleKeyDown}
        className="border p-2 rounded w-full"
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={open ? activeId ?? undefined : undefined}
        aria-haspopup="listbox"
      />
      {open && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded border bg-white">
          {isLoading && <div className="p-2 text-sm">{tCommon('status.loading')}</div>}
          {isError && (
            <div className="p-2 text-sm text-red-500">{tCommon('status.loadFailed')}</div>
          )}
          {!isLoading && !isError && options.length === 0 && (
            <div className="p-2 text-sm">{tArrangements('list.empty')}</div>
          )}
          <ul
            {...listProps}
            id={listboxId}
            role="listbox"
            className="py-1 outline-none"
          >
            {navigationItems.map((item) => {
              const optionProps = getOptionProps(item);
              const isActive = item.id === activeId;
              const isSelected = value === item.value.id;

              return (
                <li key={item.id} role="option" {...optionProps} className="px-1">
                  <div
                    className={`w-full cursor-pointer rounded px-2 py-2 text-left ${
                      isActive ? 'bg-blue-500 text-white' : 'text-gray-900'
                    } ${isSelected && !isActive ? 'font-medium' : ''}`.trim()}
                  >
                    {formatLabel(tArrangements, item.value)}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ArrangementPicker;

