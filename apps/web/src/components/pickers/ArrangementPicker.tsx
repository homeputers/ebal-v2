import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useQuery } from '@tanstack/react-query';
import { listArrangements } from '@/api/songs';
import type { components } from '@/api/types';
import { withLangKey } from '@/lib/queryClient';

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
  const [active, setActive] = useState(0);
  const { t: tArrangements } = useTranslation('arrangements');
  const { t: tCommon } = useTranslation('common');
  const { data, isLoading, isError } = useQuery({
    queryKey: withLangKey(['arrangements', songId]),
    queryFn: () => listArrangements(songId!),
    enabled: !!songId,
  });

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
      />
      {open && (
        <ul
          className="absolute z-10 mt-1 bg-white border rounded max-h-60 overflow-auto w-full"
          role="listbox"
        >
          {isLoading && <li className="p-2 text-sm">{tCommon('status.loading')}</li>}
          {isError && (
            <li className="p-2 text-sm text-red-500">{tCommon('status.loadFailed')}</li>
          )}
          {!isLoading && !isError && options.length === 0 && (
            <li className="p-2 text-sm">{tArrangements('list.empty')}</li>
          )}
          {options.map((a, idx) => (
            <li
              key={a.id}
              role="option"
              aria-selected={value === a.id}
              className={`p-2 cursor-pointer ${
                idx === active ? 'bg-blue-500 text-white' : ''
              }`}
              onMouseDown={() => handleSelect(a)}
            >
              {formatLabel(tArrangements, a)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ArrangementPicker;

