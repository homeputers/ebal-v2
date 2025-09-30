import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

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

  return (
    <div className="min-h-screen bg-background">
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
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
