import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  setAppLanguage,
} from '@/i18n';

type LanguageSwitcherProps = {
  currentLanguage: string;
  className?: string;
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Español',
};

const getLanguageLabel = (language: string) =>
  LANGUAGE_LABELS[language] ?? language.toUpperCase();

const isBrowser = typeof window !== 'undefined';

export function LanguageSwitcher({
  className,
  currentLanguage,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const languages = useMemo(
    () => Array.from(new Set(SUPPORTED_LANGUAGES)),
    [],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

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
      setIsOpen(false);

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
    ],
  );

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className ?? ''}`.trim()}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Change language"
        className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-3 py-1 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        onClick={() => setIsOpen((value) => !value)}
      >
        <span className="uppercase tracking-wide">
          {getLanguageLabel(currentLanguage)}
        </span>
        <span aria-hidden="true" className="text-xs">
          ▼
        </span>
      </button>
      {isOpen ? (
        <ul
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg focus:outline-none"
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
                    ? 'bg-gray-100 font-semibold text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{getLanguageLabel(language)}</span>
                {language === currentLanguage ? (
                  <span aria-hidden="true">✓</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
