import { useState, useEffect, useId, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { listSongs } from '@/api/songs';
import type { components } from '@/api/types';
import { withLangKey } from '@/lib/queryClient';
import {
  useListNavigation,
  type ListNavigationItem,
} from '@/hooks/useListNavigation';

function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

interface Props {
  value: string | undefined;
  onChange: (id: string | undefined) => void;
  placeholder?: string;
}

export function SongPicker({ value, onChange, placeholder }: Props) {
  const { t } = useTranslation('songs');
  const { t: tCommon } = useTranslation('common');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(search, 300);
  const listboxId = useId();

  const { data, isLoading, isError } = useQuery({
    queryKey: withLangKey(['songs', debounced]),
    queryFn: () => listSongs({ title: debounced, page: 0, size: 10 }),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const options = data?.content ?? [];
  const selected = options.find((s) => s.id === value);

  useEffect(() => {
    if (!value) {
      setSearch('');
    } else if (selected) {
      setSearch(selected.title ?? '');
    }
  }, [value, selected]);

  const handleSelect = (song: components['schemas']['SongResponse']) => {
    onChange(song.id);
    setOpen(false);
    setSearch(song.title ?? '');
  };

  const navigationItems = useMemo<Array<ListNavigationItem<components['schemas']['SongResponse']>>>(
    () =>
      options.map((song, index) => ({
        id: `${listboxId}-${song.id ?? index}`,
        text: [song.title ?? '', song.defaultKey ?? '']
          .join(' ')
          .trim(),
        value: song,
      })),
    [listboxId, options],
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

  return (
    <div className="relative">
      <input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onChange(undefined);
          if (!open) setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={closeLater}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="border p-2 rounded w-full"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={open ? activeId ?? undefined : undefined}
        aria-haspopup="listbox"
        role="combobox"
      />
      {open && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded border bg-white">
          {isLoading && (
            <div className="p-2 text-sm">{tCommon('status.loading')}</div>
          )}
          {isError && (
            <div className="p-2 text-sm text-red-500">{tCommon('status.loadFailed')}</div>
          )}
          {!isLoading && !isError && options.length === 0 && (
            <div className="p-2 text-sm">{t('pickers.empty')}</div>
          )}
          <div
            {...listProps}
            id={listboxId}
            role="listbox"
            className="flex flex-col gap-1 py-1 px-1 outline-none"
          >
            {navigationItems.map((item) => {
              const optionProps = getOptionProps(item);
              const isActive = item.id === activeId;
              const isSelected = value === item.value.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  {...optionProps}
                  aria-selected={isSelected}
                  className={`w-full rounded px-2 py-2 text-left ${
                    isActive ? 'bg-blue-500 text-white' : 'text-gray-900'
                  } ${isSelected && !isActive ? 'font-medium' : ''}`.trim()}
                >
                  <span>
                    {item.value.title}{' '}
                    {item.value.defaultKey && (
                      <span
                        className={isActive ? 'text-blue-100' : 'text-gray-500'}
                      >
                        ({item.value.defaultKey})
                      </span>
                    )}
                  </span>
                  {item.value.tags && item.value.tags.length > 0 && (
                    <span
                      className={`block text-xs ${
                        isActive ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {item.value.tags.join(', ')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default SongPicker;

