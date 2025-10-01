import { Suspense, useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppShell } from '@/components/layout/AppShell';
import { SessionExpirationHandler } from '@/features/auth/components/SessionExpirationHandler';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  setAppLanguage,
} from '@/i18n';

const isPotentialLanguageSegment = (segment: string | undefined) =>
  typeof segment === 'string' && /^[a-z]{2}(?:-[a-z]{2})?$/i.test(segment);

const normalizeLanguage = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const base = value.toLowerCase().split('-')[0];

  return SUPPORTED_LANGUAGES.includes(base) ? base : null;
};

const detectPreferredLanguage = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  try {
    const stored = window.localStorage?.getItem(LANGUAGE_STORAGE_KEY);
    const normalizedStored = normalizeLanguage(stored);

    if (normalizedStored) {
      return normalizedStored;
    }
  } catch {
    // Ignore storage access issues and fall back to navigator detection.
  }

  const navigatorLanguages = Array.isArray(window.navigator?.languages)
    ? window.navigator.languages
    : [];

  for (const candidate of navigatorLanguages) {
    const normalized = normalizeLanguage(candidate);
    if (normalized) {
      return normalized;
    }
  }

  const singleNavigatorLanguage = window.navigator?.language;
  const normalizedNavigator = normalizeLanguage(singleNavigatorLanguage);

  return normalizedNavigator ?? DEFAULT_LANGUAGE;
};

export function LanguageGuard() {
  const location = useLocation();
  const navigate = useNavigate();

  const segments = useMemo(
    () => location.pathname.split('/').filter(Boolean),
    [location.pathname],
  );
  const [firstSegment, ...restSegments] = segments;
  const normalizedLang = normalizeLanguage(firstSegment);
  const hasValidLanguage = Boolean(
    normalizedLang && firstSegment === normalizedLang,
  );

  useEffect(() => {
    if (hasValidLanguage || typeof window === 'undefined') {
      return;
    }

    const fallbackLang = detectPreferredLanguage();
    const remainder = isPotentialLanguageSegment(firstSegment)
      ? restSegments
      : segments;
    const nextSegments = [fallbackLang, ...remainder];
    const nextPath = `/${nextSegments.join('/')}`;
    const nextLocation = `${nextPath}${location.search}${location.hash}`;
    const currentLocation = `${location.pathname}${location.search}${location.hash}`;

    if (nextLocation !== currentLocation) {
      navigate(nextLocation, { replace: true });
    }
  }, [
    firstSegment,
    hasValidLanguage,
    location.hash,
    location.pathname,
    location.search,
    navigate,
    restSegments,
    segments,
  ]);

  useEffect(() => {
    if (hasValidLanguage && normalizedLang) {
      setAppLanguage(normalizedLang);
    }
  }, [hasValidLanguage, normalizedLang]);

  const translationLanguage = normalizedLang ?? DEFAULT_LANGUAGE;
  const { t } = useTranslation('common', { lng: translationLanguage });

  if (!hasValidLanguage || !normalizedLang) {
    return null;
  }

  return (
    <AppShell currentLanguage={normalizedLang}>
      <SessionExpirationHandler currentLanguage={normalizedLang} />
      <ErrorBoundary>
        <Suspense fallback={<div>{t('status.loading')}</div>}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </AppShell>
  );
}

