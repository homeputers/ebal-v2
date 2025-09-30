import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  setAppLanguage,
} from '@/i18n';
import { useHeaderPopover } from '@/hooks/useHeaderPopover';

type LanguageSwitcherProps = {
  currentLanguage: string;
  className?: string;
};

const FALLBACK_LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Español',
};

const isBrowser = typeof window !== 'undefined';

export function LanguageSwitcher({
  className,
  currentLanguage,
}: LanguageSwitcherProps) {
  const { t } = useTranslation('common');
  const location = useLocation();
  const navigate = useNavigate();
  const { close, isOpen, toggle, triggerRef, popoverRef } =
    useHeaderPopover<HTMLUListElement>();

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
      const nextLocation = `${nextPathname}${location.search}${location.hash}`;
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
      close,
    ],
  );

  return (
    <div className={`relative inline-block text-left ${className ?? ''}`.trim()}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t('language.change')}
        className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-muted px-3 py-1 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={toggle}
      >
        <span className="uppercase tracking-wide">
          {getLanguageLabel(currentLanguage)}
        </span>
        <span aria-hidden="true" className="text-xs">
          {t('language.dropdownIndicator')}
        </span>
      </button>
      {isOpen ? (
        <ul
          ref={popoverRef}
          role="listbox"
          aria-label={t('language.select')}
          className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-md border border-border bg-card py-1 shadow-lg focus:outline-none"
        >
          {languages.map((language) => (
            <li key={language} className="px-1">
              <button
                type="button"
                role="option"
                aria-selected={language === currentLanguage}
                onClick={() => handleSelect(language)}
                className={`flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm ${
                  language === currentLanguage
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span>{getLanguageLabel(language)}</span>
                {language === currentLanguage ? (
                  <span aria-hidden="true">{t('language.selectedIndicator')}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
