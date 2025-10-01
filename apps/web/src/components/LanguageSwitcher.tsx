import { useCallback, useEffect, useMemo, useId, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { VisuallyHidden } from '@/components/a11y/VisuallyHidden';

import {
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  setAppLanguage,
} from '@/i18n';
import { useHeaderPopover } from '@/hooks/useHeaderPopover';
import {
  useListNavigation,
  type ListNavigationItem,
} from '@/hooks/useListNavigation';

type LanguageSwitcherVariant = 'default' | 'compact';

type LanguageSwitcherProps = {
  currentLanguage: string;
  className?: string;
  variant?: LanguageSwitcherVariant;
};

const FALLBACK_LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
};

const LANGUAGE_FLAGS: Record<string, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
};

const isBrowser = typeof window !== 'undefined';

export function LanguageSwitcher({
  className,
  currentLanguage,
  variant = 'default',
}: LanguageSwitcherProps) {
  const { t } = useTranslation('common');
  const location = useLocation();
  const navigate = useNavigate();
  const { close, isOpen, toggle, triggerRef, popoverRef } =
    useHeaderPopover<HTMLDivElement>();
  const switcherName = useId();
  const dialogLabelId = `${switcherName}-dialog-label`;
  const listboxId = `${switcherName}-listbox`;
  const listRef = useRef<HTMLDivElement | null>(null);

  const languages = useMemo(
    () => Array.from(new Set(SUPPORTED_LANGUAGES)),
    [],
  );

  const getLanguageLabel = useCallback(
    (language: string) =>
      t(`language.labels.${language}`, {
        defaultValue:
          FALLBACK_LANGUAGE_LABELS[language] ?? language.toUpperCase(),
      }),
    [t],
  );

  const persistLanguage = useCallback((language: string) => {
    if (!isBrowser) {
      return;
    }

    try {
      window.localStorage?.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Ignore storage access issues (e.g., quota errors or disabled storage).
    }
  }, []);

  const sanitizedSearch = useMemo(() => {
    if (!location.search) {
      return '';
    }

    const params = new URLSearchParams(location.search);

    if (params.get('page') === '0') {
      params.delete('page');
    }

    const nextSearch = params.toString();

    return nextSearch ? `?${nextSearch}` : '';
  }, [location.search]);

  const buildNextPathname = useCallback(
    (nextLanguage: string) => {
      const segments = location.pathname.split('/').filter(Boolean);

      if (segments.length === 0) {
        return `/${nextLanguage}`;
      }

      const [, ...rest] = segments;
      const nextSegments = [nextLanguage, ...rest];

      return `/${nextSegments.join('/')}`;
    },
    [location.pathname],
  );

  const handleSelect = useCallback(
    (nextLanguage: string) => {
      close();

      if (nextLanguage === currentLanguage) {
        return;
      }

      setAppLanguage(nextLanguage);
      persistLanguage(nextLanguage);

      const nextPathname = buildNextPathname(nextLanguage);
      const nextLocation = `${nextPathname}${sanitizedSearch}${location.hash}`;
      const currentLocation = `${location.pathname}${location.search}${location.hash}`;

      if (nextLocation !== currentLocation) {
        navigate(nextLocation, { replace: true });
      }
    },
    [
      buildNextPathname,
      currentLanguage,
      location.hash,
      location.pathname,
      location.search,
      navigate,
      persistLanguage,
      sanitizedSearch,
      close,
    ],
  );

  const languageItems = useMemo<Array<ListNavigationItem<string>>>(
    () =>
      languages.map((language) => ({
        id: `${switcherName}-${language}`,
        text: getLanguageLabel(language),
        value: language,
      })),
    [getLanguageLabel, languages, switcherName],
  );

  const selectedItemId = useMemo(
    () =>
      languageItems.find((item) => item.value === currentLanguage)?.id ?? null,
    [currentLanguage, languageItems],
  );

  const { listProps, getOptionProps, activeId, setActiveId } = useListNavigation({
    items: languageItems,
    selectedId: selectedItemId,
    onSelect: (item) => handleSelect(item.value),
    onCancel: () => close({ focusTrigger: true }),
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const node = listRef.current;

    requestAnimationFrame(() => {
      node?.focus({ preventScroll: true });
    });

    if (selectedItemId) {
      setActiveId(selectedItemId);
    }
  }, [isOpen, selectedItemId, setActiveId]);

  const wrapperClassName = `relative inline-block text-left ${
    className ?? ''
  }`.trim();

  const triggerClassName =
    variant === 'compact'
      ? 'inline-flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-muted text-base text-foreground transition-colors transition-base hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
      : 'inline-flex items-center gap-2 rounded-md border border-border/60 bg-muted px-3 py-1 text-sm font-medium text-foreground transition-colors transition-base hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

  const getLanguageFlag = useCallback(
    (language: string) => LANGUAGE_FLAGS[language] ?? language.toUpperCase(),
    [],
  );

  const triggerLabel = t('language.changeLabel', {
    language: getLanguageLabel(currentLanguage),
    defaultValue: t('language.change'),
  });

  return (
    <div className={wrapperClassName}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={triggerLabel}
        className={triggerClassName}
        onClick={toggle}
      >
        {variant === 'compact' ? (
          <>
            <span aria-hidden="true" className="text-xl leading-none">
              {getLanguageFlag(currentLanguage)}
            </span>
            <VisuallyHidden>
              {t('language.triggerFlagAlt', {
                language: getLanguageLabel(currentLanguage),
                defaultValue: getLanguageLabel(currentLanguage),
              })}
            </VisuallyHidden>
          </>
        ) : (
          <>
            <span className="uppercase tracking-wide">
              {getLanguageLabel(currentLanguage)}
            </span>
            <span aria-hidden="true" className="text-xs">
              {t('language.dropdownIndicator')}
            </span>
          </>
        )}
      </button>
      {isOpen ? (
        <div
          ref={popoverRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogLabelId}
          className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-md border border-border bg-card py-2 shadow-lg focus:outline-none"
          tabIndex={-1}
        >
          <p id={dialogLabelId} className="sr-only">
            {t('language.select')}
          </p>
          <div
            {...listProps}
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={dialogLabelId}
            className="flex flex-col gap-1 px-1 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {languageItems.map((item) => {
              const isSelected = item.id === selectedItemId;
              const isActive = item.id === activeId;
              const optionProps = getOptionProps(item);

              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  {...optionProps}
                  aria-selected={isSelected}
                  className={`flex w-full cursor-pointer items-center justify-between rounded px-2 py-2 text-left text-sm transition-colors transition-base ${
                    isActive
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  } ${isSelected ? 'font-medium' : ''}`.trim()}
                >
                  <span>{item.text}</span>
                  {isSelected ? (
                    <span aria-hidden="true">{t('language.selectedIndicator')}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
