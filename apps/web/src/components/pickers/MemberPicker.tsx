import { useEffect, useMemo, useState, useId } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { listMembers } from '@/api/members';
import type { components } from '@/api/types';
import { withLangKey } from '@/lib/queryClient';
import {
  useListNavigation,
  type ListNavigationItem,
} from '@/hooks/useListNavigation';

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

  const handleSelect = (member: Member) => {
    if (!member.id) return;
    onChange(member.id);
    setOpen(false);
    setSearch(member.displayName ?? '');
  };

  const navigationItems = useMemo<Array<ListNavigationItem<Member>>>(
    () =>
      options.map((member, index) => ({
        id: `${listboxId}-${member.id ?? index}`,
        text: member.displayName ?? member.email ?? '',
        value: member,
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
        aria-activedescendant={open ? activeId ?? undefined : undefined}
        aria-haspopup="listbox"
        role="combobox"
      />
      {open && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded border bg-white">
          {isLoading && <div className="p-2 text-sm">{tCommon('status.loading')}</div>}
          {isError && (
            <div className="p-2 text-sm text-red-500">{tCommon('status.loadFailed')}</div>
          )}
          {!isLoading && !isError && options.length === 0 && (
            <div className="p-2 text-sm">{t('list.empty')}</div>
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
                    className={`flex w-full cursor-pointer flex-col items-start rounded px-2 py-2 text-left ${
                      isActive ? 'bg-blue-500 text-white' : 'text-gray-900'
                    } ${isSelected && !isActive ? 'font-medium' : ''}`.trim()}
                  >
                    <span>{item.value.displayName}</span>
                    {item.value.instruments && item.value.instruments.length > 0 && (
                      <span
                        className={`text-xs ${
                          isActive ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {item.value.instruments.join(', ')}
                      </span>
                    )}
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

export default MemberPicker;
