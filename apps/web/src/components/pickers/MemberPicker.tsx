import { useEffect, useMemo, useState, useId } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { listMembers } from '@/api/members';
import type { components } from '@/api/types';
import { withLangKey } from '@/lib/queryClient';

type Member = components['schemas']['MemberResponse'];

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
  excludeIds?: string[];
}

export function MemberPicker({ value, onChange, placeholder, excludeIds }: Props) {
  const { t } = useTranslation('members');
  const { t: tCommon } = useTranslation('common');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listboxId = useId();
  const debounced = useDebounce(search, 300);

  const queryParams = useMemo(
    () => ({ q: debounced || undefined, page: 0, size: 20 }),
    [debounced],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: withLangKey(['members', queryParams]),
    queryFn: () => listMembers(queryParams),
    enabled: open,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const allOptions = data?.content ?? [];
  const options = useMemo(() => {
    if (!excludeIds || excludeIds.length === 0) {
      return allOptions;
    }

    const excluded = new Set(excludeIds);
    return allOptions.filter((member) => (member.id ? !excluded.has(member.id) : true));
  }, [allOptions, excludeIds]);

  const selected = useMemo(
    () => allOptions.find((member) => member.id === value),
    [allOptions, value],
  );

  useEffect(() => {
    if (!value) {
      setSearch('');
    } else if (selected) {
      setSearch(selected.displayName ?? '');
    }
  }, [value, selected]);

  useEffect(() => {
    setActive(0);
  }, [options]);

  const handleSelect = (member: Member) => {
    if (!member.id) return;
    onChange(member.id);
    setOpen(false);
    setSearch(member.displayName ?? '');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((prev) => Math.min(prev + 1, Math.max(options.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && open && options[active]) {
      e.preventDefault();
      handleSelect(options[active]);
    }
  };

  const closeLater = () => setTimeout(() => setOpen(false), 100);

  return (
    <div className="relative flex-1">
      <input
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
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
          {isLoading && <div className="p-2 text-sm">{tCommon('status.loading')}</div>}
          {isError && (
            <div className="p-2 text-sm text-red-500">{tCommon('status.loadFailed')}</div>
          )}
          {!isLoading && !isError && options.length === 0 && (
            <div className="p-2 text-sm">{t('list.empty')}</div>
          )}
          {options.map((member, idx) => (
            <div key={member.id}>
              <button
                type="button"
                role="option"
                aria-selected={value === member.id}
                className={`flex w-full cursor-pointer flex-col items-start rounded px-2 py-2 text-left ${
                  idx === active ? 'bg-blue-500 text-white' : ''
                }`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(member);
                }}
                onClick={() => handleSelect(member)}
              >
                <span>{member.displayName}</span>
                {member.instruments && member.instruments.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {member.instruments.join(', ')}
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

export default MemberPicker;
