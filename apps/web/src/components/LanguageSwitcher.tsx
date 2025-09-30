import { useCallback, useMemo, useId } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  setAppLanguage,
} from '@/i18n';
import { useHeaderPopover } from '@/hooks/useHeaderPopover';

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

  const wrapperClassName = `relative inline-block text-left ${
    className ?? ''
  }`.trim();

  const triggerClassName =
    variant === 'compact'
      ? 'inline-flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-muted text-base text-foreground transition-colors hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
      : 'inline-flex items-center gap-2 rounded-md border border-border/60 bg-muted px-3 py-1 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

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
        aria-haspopup="listbox"
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
            <span className="sr-only">
              {t('language.triggerFlagAlt', {
                language: getLanguageLabel(currentLanguage),
                defaultValue: getLanguageLabel(currentLanguage),
              })}
            </span>
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
          role="listbox"
          aria-label={t('language.select')}
          aria-activedescendant={`${switcherName}-${currentLanguage}`}
          className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-md border border-border bg-card py-1 shadow-lg focus:outline-none"
          tabIndex={-1}
        >
          {languages.map((language) => {
            const isSelected = language === currentLanguage;
            const optionId = `${switcherName}-${language}`;

            return (
              <div key={language} role="none" className="px-1">
                <button
                  type="button"
                  id={optionId}
                  role="option"
                  aria-selected={isSelected}
                  className={`flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    isSelected
                      ? 'bg-muted font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  onClick={() => handleSelect(language)}
                >
                  <span>{getLanguageLabel(language)}</span>
                  {isSelected ? (
                    <span aria-hidden="true">{t('language.selectedIndicator')}</span>
                  ) : null}
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
