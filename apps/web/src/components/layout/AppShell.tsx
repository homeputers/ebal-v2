import {
  type MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/layout/AppHeader';
import { AppSideNav } from '@/components/layout/AppSideNav';
import {
  filterNavigationLinks,
  type AppNavigationLink,
} from '@/components/navigation/links';
import { useAuth } from '@/features/auth/useAuth';

type AppShellProps = {
  currentLanguage: string;
  children: ReactNode;
};

export function AppShell({ currentLanguage, children }: AppShellProps) {
  const { hasRole } = useAuth();
  const location = useLocation();
  const [isNavigationOpen, setNavigationOpen] = useState(false);
  const { t } = useTranslation('common');
  const mainRef = useRef<HTMLElement | null>(null);

  const navigationLinks: AppNavigationLink[] = useMemo(
    () => filterNavigationLinks(hasRole),
    [hasRole],
  );

  const handleCloseNavigation = useCallback(() => {
    setNavigationOpen(false);
  }, []);

  useEffect(() => {
    if (!isNavigationOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseNavigation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCloseNavigation, isNavigationOpen]);

  useEffect(() => {
    handleCloseNavigation();
  }, [
    handleCloseNavigation,
    location.hash,
    location.pathname,
    location.search,
  ]);

  const handleToggleNavigation = () => {
    setNavigationOpen((value) => !value);
  };

  const handleSkipToContent = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      mainRef.current?.focus();
    },
    [],
  );

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        onClick={handleSkipToContent}
        className="absolute left-4 top-4 z-50 -translate-y-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {t('layout.skipToMainContent')}
      </a>
      <div className="flex min-h-screen">
        <AppSideNav
          currentLanguage={currentLanguage}
          navigationLinks={navigationLinks}
          isOpen={isNavigationOpen}
          onClose={handleCloseNavigation}
        />
        <div className="flex min-h-screen flex-1 flex-col">
          <AppHeader
            currentLanguage={currentLanguage}
            navigationLinks={navigationLinks}
            onToggleNavigation={handleToggleNavigation}
            isNavigationOpen={isNavigationOpen}
          />
          <main
            ref={mainRef}
            id="main-content"
            tabIndex={-1}
            className="flex-1 focus:outline-none"
          >
            {children}
          </main>
          <footer className="border-t border-border/60 bg-card/40 px-6 py-4 text-xs text-muted-foreground">
            <p>{t('layout.footer.copyright', { year: currentYear, app: t('app.title') })}</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
