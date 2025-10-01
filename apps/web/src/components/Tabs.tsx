import {
  KeyboardEvent,
  ReactNode,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

export type TabDefinition = {
  id: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
};

type TabState = {
  isSelected: boolean;
  isFocused: boolean;
  isDisabled: boolean;
};

type TabsProps = {
  tabs: TabDefinition[];
  currentTabId: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  tabListClassName?: string;
  tabClassName?:
    | string
    | ((tab: TabDefinition, state: TabState) => string);
  tabPanelClassName?:
    | string
    | ((tab: TabDefinition, isSelected: boolean) => string);
  ariaLabel?: string;
  ariaLabelledBy?: string;
};

const defaultTabBaseClass =
  'inline-flex items-center gap-2 rounded-t border border-b-0 border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const defaultTabSelectedClass = 'bg-white text-gray-900';
const defaultTabUnselectedClass = 'hover:text-gray-800';
const defaultTabDisabledClass = 'cursor-not-allowed opacity-50';

const defaultTabPanelClass = 'rounded-b border border-gray-200 bg-white p-4';

export function Tabs({
  tabs,
  currentTabId,
  onTabChange,
  className,
  tabListClassName,
  tabClassName,
  tabPanelClassName,
  ariaLabel,
  ariaLabelledBy,
}: TabsProps) {
  const generatedId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const enabledIndexes = useMemo(() => {
    return tabs
      .map((tab, index) => (tab.disabled ? null : index))
      .filter((value): value is number => value !== null);
  }, [tabs]);

  const firstEnabledIndex = enabledIndexes[0] ?? -1;
  const lastEnabledIndex =
    enabledIndexes.length > 0
      ? enabledIndexes[enabledIndexes.length - 1]
      : -1;

  const selectedIndex = useMemo(() => {
    const index = tabs.findIndex(
      (tab) => tab.id === currentTabId && !tab.disabled,
    );

    if (index !== -1) {
      return index;
    }

    return firstEnabledIndex;
  }, [currentTabId, firstEnabledIndex, tabs]);

  const [focusedTabId, setFocusedTabId] = useState<string | null>(() => {
    const selectedTab = tabs[selectedIndex];

    if (selectedTab && !selectedTab.disabled) {
      return selectedTab.id;
    }

    const fallback = tabs.find((tab) => !tab.disabled);

    return fallback?.id ?? null;
  });

  const resolvedFocusedTabId = useMemo(() => {
    if (
      focusedTabId &&
      tabs.some((tab) => tab.id === focusedTabId && !tab.disabled)
    ) {
      return focusedTabId;
    }

    const selectedTab = tabs[selectedIndex];

    if (selectedTab && !selectedTab.disabled) {
      return selectedTab.id;
    }

    const fallback = tabs.find((tab) => !tab.disabled);

    return fallback?.id ?? null;
  }, [focusedTabId, selectedIndex, tabs]);

  const focusedIndex = useMemo(() => {
    if (!resolvedFocusedTabId) {
      return -1;
    }

    return tabs.findIndex((tab) => tab.id === resolvedFocusedTabId);
  }, [resolvedFocusedTabId, tabs]);

  const focusTab = useCallback(
    (index: number) => {
      const nextTab = tabs[index];

      if (!nextTab || nextTab.disabled) {
        return;
      }

      setFocusedTabId(nextTab.id);

      const node = tabRefs.current[index];

      if (node) {
        node.focus();
      }
    },
    [tabs],
  );

  const moveFocus = useCallback(
    (currentIndex: number, direction: 1 | -1) => {
      if (enabledIndexes.length === 0) {
        return null;
      }

      let nextIndex = currentIndex;

      for (let i = 0; i < tabs.length; i += 1) {
        nextIndex = (nextIndex + direction + tabs.length) % tabs.length;
        const nextTab = tabs[nextIndex];

        if (!nextTab?.disabled) {
          return nextIndex;
        }
      }

      return null;
    },
    [enabledIndexes.length, tabs],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      let nextIndex: number | null = null;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextIndex = moveFocus(index, 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          nextIndex = moveFocus(index, -1);
          break;
        case 'Home':
          nextIndex = firstEnabledIndex !== -1 ? firstEnabledIndex : null;
          break;
        case 'End':
          nextIndex = lastEnabledIndex !== -1 ? lastEnabledIndex : null;
          break;
        case 'Enter':
        case ' ': {
          const tab = tabs[index];

          if (!tab?.disabled && tab.id !== currentTabId) {
            event.preventDefault();
            onTabChange(tab.id);
          }

          return;
        }
        default:
          return;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        focusTab(nextIndex);
        const nextTab = tabs[nextIndex];

        if (nextTab && !nextTab.disabled && nextTab.id !== currentTabId) {
          onTabChange(nextTab.id);
        }
      }
    },
    [
      currentTabId,
      firstEnabledIndex,
      focusTab,
      lastEnabledIndex,
      moveFocus,
      onTabChange,
      tabs,
    ],
  );

  const getTabClassName = useCallback(
    (tab: TabDefinition, state: TabState) => {
      if (typeof tabClassName === 'function') {
        return tabClassName(tab, state);
      }

      const pieces = [defaultTabBaseClass];

      if (state.isSelected) {
        pieces.push(defaultTabSelectedClass);
      } else {
        pieces.push(defaultTabUnselectedClass);
      }

      if (state.isDisabled) {
        pieces.push(defaultTabDisabledClass);
      }

      if (typeof tabClassName === 'string' && tabClassName.trim()) {
        pieces.push(tabClassName);
      }

      return pieces.join(' ');
    },
    [tabClassName],
  );

  const getPanelClassName = useCallback(
    (tab: TabDefinition, isSelected: boolean) => {
      if (typeof tabPanelClassName === 'function') {
        return tabPanelClassName(tab, isSelected);
      }

      const pieces = [defaultTabPanelClass];

      if (typeof tabPanelClassName === 'string' && tabPanelClassName.trim()) {
        pieces.push(tabPanelClassName);
      }

      return pieces.join(' ');
    },
    [tabPanelClassName],
  );

  const wrapperClassName = `space-y-0 ${className ?? ''}`.trim();
  const tablistClassName = `flex flex-wrap gap-1 border-b border-gray-200 ${
    tabListClassName ?? ''
  }`.trim();

  return (
    <div className={wrapperClassName}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={tablistClassName}
      >
        {tabs.map((tab, index) => {
          const tabId = `${generatedId}-tab-${tab.id}`;
          const panelId = `${generatedId}-panel-${tab.id}`;
          const isSelected = tab.id === currentTabId;
          const isDisabled = Boolean(tab.disabled);
          const isFocused = tab.id === resolvedFocusedTabId;

          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              id={tabId}
              role="tab"
              type="button"
              aria-selected={isSelected}
              aria-controls={panelId}
              aria-disabled={isDisabled || undefined}
              data-state={isSelected ? 'active' : 'inactive'}
              data-disabled={isDisabled ? '' : undefined}
              tabIndex={isDisabled ? -1 : isFocused ? 0 : -1}
              className={getTabClassName(tab, {
                isSelected,
                isFocused,
                isDisabled,
              })}
              onClick={() => {
                if (isDisabled || tab.id === currentTabId) {
                  return;
                }

                setFocusedTabId(tab.id);
                onTabChange(tab.id);
              }}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div>
        {tabs.map((tab) => {
          const tabId = `${generatedId}-tab-${tab.id}`;
          const panelId = `${generatedId}-panel-${tab.id}`;
          const isSelected = tab.id === currentTabId;

          return (
            <div
              key={tab.id}
              id={panelId}
              role="tabpanel"
              aria-labelledby={tabId}
              hidden={!isSelected}
              className={getPanelClassName(tab, isSelected)}
              tabIndex={0}
            >
              {isSelected ? tab.content : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
