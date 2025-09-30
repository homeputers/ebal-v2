import { useState, useEffect, useId } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { listSongs } from '@/api/songs';
import type { components } from '@/api/types';
import { withLangKey } from '@/lib/queryClient';

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
  const [active, setActive] = useState(0);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((p) => Math.min(p + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((p) => Math.max(p - 1, 0));
    } else if (e.key === 'Enter' && open && options[active]) {
      e.preventDefault();
      handleSelect(options[active]);
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
        role="combobox"
      />
      {open && (
        <div
          className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded border bg-white"
          role="listbox"
          id={listboxId}
          tabIndex={0}
        >
          {isLoading && (
            <div className="p-2 text-sm">{tCommon('status.loading')}</div>
          )}
          {isError && (
            <div className="p-2 text-sm text-red-500">{tCommon('status.loadFailed')}</div>
          )}
          {!isLoading && !isError && options.length === 0 && (
            <div className="p-2 text-sm">{t('pickers.empty')}</div>
          )}
          {options.map((song, idx) => (
            <div key={song.id}>
              <button
                type="button"
                role="option"
                aria-selected={value === song.id}
                className={`w-full cursor-pointer rounded px-2 py-2 text-left ${
                  idx === active ? 'bg-blue-500 text-white' : ''
                }`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(song);
                }}
                onClick={() => handleSelect(song)}
              >
                <span>
                  {song.title}{' '}
                  {song.defaultKey && (
                    <span className="text-gray-500">({song.defaultKey})</span>
                  )}
                </span>
                {song.tags && song.tags.length > 0 && (
                  <span className="block text-xs text-gray-500">
                    {song.tags.join(', ')}
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SongPicker;

