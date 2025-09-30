import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { buildLanguagePath, type AppNavigationLink } from '@/components/navigation/links';
import { MOBILE_NAVIGATION_ID } from '@/components/layout/constants';

type AppHeaderProps = {
  currentLanguage: string;
  navigationLinks: AppNavigationLink[];
  onToggleNavigation: () => void;
  isNavigationOpen: boolean;
};

export function AppHeader({
  currentLanguage,
  navigationLinks,
  onToggleNavigation,
  isNavigationOpen,
}: AppHeaderProps) {
  const { t } = useTranslation('common');

  const brandHref = useMemo(
    () => buildLanguagePath(currentLanguage, 'services'),
    [currentLanguage],
  );

  const hasNavigation = navigationLinks.length > 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 text-foreground shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80 print:hidden">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
        <div className="flex flex-1 items-center gap-3">
          {hasNavigation ? (
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-muted text-foreground transition hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
              aria-controls={MOBILE_NAVIGATION_ID}
              aria-expanded={isNavigationOpen}
              aria-label={
                isNavigationOpen ? t('nav.closeMenu') : t('nav.openMenu')
              }
              onClick={onToggleNavigation}
            >
              <span aria-hidden="true" className="block h-4 w-4">
                <svg
                  className="h-full w-full"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {isNavigationOpen ? (
                    <path
                      d="M4 5.5L14.5 16M15.5 5.5L5 16"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  ) : (
                    <path
                      d="M3 5h14M3 10h14M3 15h14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  )}
                </svg>
              </span>
            </button>
          ) : null}
          <Link
            to={brandHref}
            className="text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span aria-hidden="true">EBaL</span>
            <span className="sr-only">{t('app.title')}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
