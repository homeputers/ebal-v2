import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listSongs } from '@/api/songs';
import type { components } from '@/api/types';

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
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const debounced = useDebounce(search, 300);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['songs', debounced],
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
      />
      {open && (
        <ul
          className="absolute z-10 mt-1 bg-white border rounded max-h-60 overflow-auto w-full"
          role="listbox"
        >
          {isLoading && <li className="p-2 text-sm">Loading…</li>}
          {isError && <li className="p-2 text-sm text-red-500">Failed to load</li>}
          {!isLoading && !isError && options.length === 0 && (
            <li className="p-2 text-sm">No songs</li>
          )}
          {options.map((song, idx) => (
            <li
              key={song.id}
              role="option"
              aria-selected={value === song.id}
              className={`p-2 cursor-pointer ${
                idx === active ? 'bg-blue-500 text-white' : ''
              }`}
              onMouseDown={() => handleSelect(song)}
            >
              <div>
                <span>{song.title}</span>{' '}
                {song.defaultKey && (
                  <span className="text-gray-500">({song.defaultKey})</span>
                )}
              </div>
              {song.tags && song.tags.length > 0 && (
                <div className="text-xs text-gray-500">{song.tags.join(', ')}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SongPicker;

