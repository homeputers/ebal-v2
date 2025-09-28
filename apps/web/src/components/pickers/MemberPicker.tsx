import { useEffect, useMemo, useState } from 'react';
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
            <li className="p-2 text-sm">{t('list.empty')}</li>
          )}
          {options.map((member, idx) => (
            <li
              key={member.id}
              role="option"
              aria-selected={value === member.id}
              className={`p-2 cursor-pointer ${idx === active ? 'bg-blue-500 text-white' : ''}`}
              onMouseDown={() => handleSelect(member)}
            >
              <div>{member.displayName}</div>
              {member.instruments && member.instruments.length > 0 && (
                <div className="text-xs text-gray-500">{member.instruments.join(', ')}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MemberPicker;
