import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type ListNavigationOptionProps = React.HTMLAttributes<HTMLElement> & {
  'data-active'?: string;
};

export type ListNavigationItem<T = unknown> = {
  id: string;
  text: string;
  value: T;
  disabled?: boolean;
};

export type ListNavigationMoveIntent = 'next' | 'prev' | 'first' | 'last';

export interface UseListNavigationOptions<T> {
  items: Array<ListNavigationItem<T>>;
  selectedId?: string | null;
  defaultActiveId?: string | null;
  loop?: boolean;
  typeaheadDelay?: number;
  onSelect?: (
    item: ListNavigationItem<T>,
    event: React.KeyboardEvent | React.MouseEvent,
  ) => void;
  onCancel?: () => void;
}

export interface UseListNavigationResult<T> {
  activeId: string | null;
  activeItem: ListNavigationItem<T> | null;
  listProps: {
    tabIndex: number;
    'aria-activedescendant'?: string;
    onKeyDown: (event: React.KeyboardEvent) => void;
  };
  getOptionProps: (item: ListNavigationItem<T>) => ListNavigationOptionProps;
  move: (intent: ListNavigationMoveIntent) => void;
  setActiveId: (id: string | null) => void;
  selectActive: (event?: React.KeyboardEvent | React.MouseEvent) => void;
}

const TYPEAHEAD_DEFAULT_DELAY = 500;

const isPrintableCharacter = (event: React.KeyboardEvent) => {
  if (event.key.length !== 1) {
    return false;
  }

  if (event.ctrlKey || event.metaKey || event.altKey) {
    return false;
  }

  return !/\s/.test(event.key);
};

const findNextEnabledIndex = <T,>(
  items: Array<ListNavigationItem<T>>,
  start: number,
  direction: 1 | -1,
  loop: boolean,
) => {
  const total = items.length;

  if (total === 0) {
    return -1;
  }

  let index = start;

  for (let i = 0; i < total; i += 1) {
    if (index < 0) {
      index = loop ? total - 1 : 0;
    } else if (index >= total) {
      index = loop ? 0 : total - 1;
    }

    const item = items[index];

    if (!item?.disabled) {
      return index;
    }

    index += direction;
  }

  return -1;
};

export function useListNavigation<T>(
  options: UseListNavigationOptions<T>,
): UseListNavigationResult<T> {
  const {
    items,
    selectedId,
    defaultActiveId = null,
    loop = true,
    typeaheadDelay = TYPEAHEAD_DEFAULT_DELAY,
    onSelect,
    onCancel,
  } = options;

  const resolvedSelectedId = selectedId ?? null;

  const getIndexById = useCallback(
    (id: string | null | undefined) => {
      if (!id) {
        return -1;
      }

      return items.findIndex((item) => item.id === id);
    },
    [items],
  );

  const findInitialIndex = useCallback(() => {
    const preferredId = resolvedSelectedId ?? defaultActiveId;
    const preferredIndex = getIndexById(preferredId);

    if (preferredIndex !== -1 && !items[preferredIndex]?.disabled) {
      return preferredIndex;
    }

    return findNextEnabledIndex(items, 0, 1, false);
  }, [defaultActiveId, getIndexById, items, resolvedSelectedId]);

  const [activeIndex, setActiveIndex] = useState<number>(() => findInitialIndex());

  useEffect(() => {
    setActiveIndex(findInitialIndex());
  }, [findInitialIndex]);

  useEffect(() => {
    if (activeIndex >= items.length) {
      setActiveIndex(findInitialIndex());
    }
  }, [activeIndex, findInitialIndex, items.length]);

  const typeaheadStateRef = useRef({
    query: '',
    lastTime: 0,
  });
  const typeaheadTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (typeaheadTimeoutRef.current) {
        window.clearTimeout(typeaheadTimeoutRef.current);
      }
    };
  }, []);

  const clearTypeahead = useCallback(() => {
    if (typeaheadTimeoutRef.current) {
      window.clearTimeout(typeaheadTimeoutRef.current);
    }
    typeaheadTimeoutRef.current = null;
    typeaheadStateRef.current = { query: '', lastTime: 0 };
  }, []);

  const scheduleTypeaheadClear = useCallback(() => {
    if (typeaheadTimeoutRef.current) {
      window.clearTimeout(typeaheadTimeoutRef.current);
    }

    typeaheadTimeoutRef.current = window.setTimeout(
      () => {
        clearTypeahead();
      },
      typeaheadDelay,
    );
  }, [clearTypeahead, typeaheadDelay]);

  const activeItem = activeIndex >= 0 ? items[activeIndex] ?? null : null;
  const activeId = activeItem?.id ?? null;

  const move = useCallback(
    (intent: ListNavigationMoveIntent) => {
      if (items.length === 0) {
        return;
      }

      if (intent === 'first') {
        const nextIndex = findNextEnabledIndex(items, 0, 1, false);
        setActiveIndex(nextIndex);
        return;
      }

      if (intent === 'last') {
        const nextIndex = findNextEnabledIndex(items, items.length - 1, -1, false);
        setActiveIndex(nextIndex);
        return;
      }

      if (activeIndex === -1) {
        const nextIndex = findNextEnabledIndex(items, 0, 1, false);
        setActiveIndex(nextIndex);
        return;
      }

      const direction = intent === 'next' ? 1 : -1;
      const start = activeIndex + direction;
      const nextIndex = findNextEnabledIndex(items, start, direction, loop);
      if (nextIndex !== -1) {
        setActiveIndex(nextIndex);
      }
    },
    [activeIndex, items, loop],
  );

  const selectActive = useCallback(
    (event?: React.KeyboardEvent | React.MouseEvent) => {
      if (!activeItem || activeItem.disabled) {
        return;
      }

      if (onSelect) {
        const syntheticEvent =
          event ??
          ({
            preventDefault: () => {},
          } as React.KeyboardEvent);
        onSelect(activeItem, syntheticEvent);
      }
    },
    [activeItem, onSelect],
  );

  const handleTypeahead = useCallback(
    (event: React.KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const now = Date.now();
      const { lastTime, query } = typeaheadStateRef.current;
      const isStale = now - lastTime > typeaheadDelay;
      const nextQuery = isStale ? key : query + key;

      const search = (searchQuery: string, startIndex: number) => {
        const total = items.length;

        if (total === 0) {
          return -1;
        }

        for (let offset = 0; offset < total; offset += 1) {
          let index = startIndex + offset;

          if (index >= total) {
            index = loop ? index % total : total - 1;
          }

          const candidate = items[index];

          if (!candidate || candidate.disabled) {
            continue;
          }

          if (candidate.text.toLowerCase().startsWith(searchQuery)) {
            return index;
          }

          if (!loop && index === total - 1) {
            break;
          }
        }

        return -1;
      };

      const startIndex =
        activeIndex === -1 ? 0 : Math.min(activeIndex + 1, items.length - 1);
      let matchIndex = search(nextQuery, startIndex);

      if (matchIndex === -1 && nextQuery.length > 1) {
        matchIndex = search(key, startIndex);
      }

      if (matchIndex !== -1) {
        setActiveIndex(matchIndex);
      }

      typeaheadStateRef.current = {
        query: nextQuery,
        lastTime: now,
      };
      scheduleTypeaheadClear();
    },
    [activeIndex, items, loop, scheduleTypeaheadClear, typeaheadDelay],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
        case 'Down':
          event.preventDefault();
          move('next');
          return;
        case 'ArrowUp':
        case 'Up':
          event.preventDefault();
          move('prev');
          return;
        case 'Home':
          event.preventDefault();
          move('first');
          return;
        case 'End':
          event.preventDefault();
          move('last');
          return;
        case 'Enter':
          event.preventDefault();
          selectActive(event);
          return;
        case ' ': {
          event.preventDefault();
          selectActive(event);
          return;
        }
        case 'Escape':
          event.preventDefault();
          onCancel?.();
          return;
        default:
          break;
      }

      if (isPrintableCharacter(event)) {
        handleTypeahead(event);
      }
    },
    [handleTypeahead, move, onCancel, selectActive],
  );

  const getOptionProps = useCallback(
    (item: ListNavigationItem<T>): ListNavigationOptionProps => {
      const index = getIndexById(item.id);
      const isActive = item.id === activeId;
      const isSelected = item.id === resolvedSelectedId;
      const manageSelectionState = selectedId !== undefined;

      return {
        id: item.id,
        tabIndex: -1,
        'data-active': isActive ? 'true' : undefined,
        'aria-selected': manageSelectionState
          ? isSelected
            ? 'true'
            : 'false'
          : undefined,
        'aria-disabled': item.disabled ? 'true' : undefined,
        onMouseEnter: () => {
          if (index !== -1 && !item.disabled) {
            setActiveIndex(index);
          }
        },
        onMouseMove: () => {
          if (index !== -1 && !item.disabled) {
            setActiveIndex(index);
          }
        },
        onMouseDown: (event) => {
          if (!item.disabled) {
            event.preventDefault();
          }
        },
        onClick: (event) => {
          if (item.disabled) {
            event.preventDefault();
            return;
          }

          if (index !== -1) {
            setActiveIndex(index);
          }

          event.preventDefault();

          if (onSelect) {
            onSelect(item, event);
          } else {
            selectActive(event);
          }
        },
      };
    },
    [
      activeId,
      getIndexById,
      onSelect,
      selectActive,
      selectedId,
      resolvedSelectedId,
    ],
  );

  const setActiveId = useCallback(
    (id: string | null) => {
      if (!id) {
        setActiveIndex(-1);
        return;
      }

      const index = getIndexById(id);

      if (index !== -1) {
        setActiveIndex(index);
      }
    },
    [getIndexById],
  );

  const listProps = useMemo(
    () => ({
      tabIndex: 0,
      'aria-activedescendant': activeId ?? undefined,
      onKeyDown: handleKeyDown,
    }),
    [activeId, handleKeyDown],
  );

  return {
    activeId,
    activeItem,
    listProps,
    getOptionProps,
    move,
    setActiveId,
    selectActive,
  };
}
