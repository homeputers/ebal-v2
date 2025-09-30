import { useId, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAuth } from '@/features/auth/useAuth';
import { buildLanguagePath, type AppNavigationLink } from '@/components/navigation/links';
import { useHeaderPopover } from '@/hooks/useHeaderPopover';
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
  const { logout, me, isAuthenticated } = useAuth();
  const accountMenu = useHeaderPopover<HTMLDivElement>();
  const accountMenuButtonId = useId();

  const brandHref = useMemo(
    () => buildLanguagePath(currentLanguage, 'services'),
    [currentLanguage],
  );

  const profileHref = useMemo(
    () => buildLanguagePath(currentLanguage, 'me'),
    [currentLanguage],
  );

  const changePasswordHref = useMemo(
    () => buildLanguagePath(currentLanguage, 'change-password'),
    [currentLanguage],
  );

  const hasNavigation = navigationLinks.length > 0;
  const accountName = me?.displayName?.trim() ?? me?.email ?? '';
  const accountLabelValue = accountName || t('nav.profile');

  const handleLogout = () => {
    logout();
    accountMenu.close({ focusTrigger: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 text-foreground shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80 print:hidden">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
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
        <div className="flex items-center gap-2">
          <LanguageSwitcher currentLanguage={currentLanguage} variant="compact" />
          {isAuthenticated ? (
            <div className="relative">
              <button
                ref={accountMenu.triggerRef}
                id={accountMenuButtonId}
                type="button"
                aria-haspopup="menu"
                aria-expanded={accountMenu.isOpen}
                aria-controls={`${accountMenuButtonId}-menu`}
                aria-label={t('nav.accountMenuLabel', {
                  value: accountLabelValue,
                  defaultValue: accountLabelValue,
                })}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-muted text-foreground transition hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={accountMenu.toggle}
              >
                <span className="sr-only">{accountLabelValue}</span>
                <span aria-hidden="true" className="block h-5 w-5">
                  <svg
                    className="h-full w-full"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 12c2.485 0 4.5-2.015 4.5-4.5S14.485 3 12 3 7.5 5.015 7.5 7.5 9.515 12 12 12Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 19.25a7 7 0 0 1 14 0"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
              {accountMenu.isOpen ? (
                <div
                  ref={accountMenu.popoverRef}
                  role="menu"
                  id={`${accountMenuButtonId}-menu`}
                  aria-labelledby={accountMenuButtonId}
                  className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-md border border-border bg-card text-sm text-foreground shadow-lg"
                >
                  <Link
                    to={profileHref}
                    role="menuitem"
                    className="block px-4 py-2 transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
                    onClick={() => accountMenu.close()}
                  >
                    {t('nav.profile')}
                  </Link>
                  <Link
                    to={changePasswordHref}
                    role="menuitem"
                    className="block px-4 py-2 transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
                    onClick={() => accountMenu.close()}
                  >
                    {t('nav.changePassword')}
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-destructive transition-colors hover:bg-destructive/10 focus:bg-destructive/10 focus:outline-none"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
