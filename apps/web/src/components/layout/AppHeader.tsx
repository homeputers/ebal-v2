import { useId, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAuth } from '@/features/auth/useAuth';
import { buildLanguagePath, type AppNavigationLink } from '@/components/navigation/links';
import { useHeaderPopover } from '@/hooks/useHeaderPopover';

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

  const profileHref = useMemo(
    () => buildLanguagePath(currentLanguage, 'me'),
    [currentLanguage],
  );

  const changePasswordHref = useMemo(
    () => buildLanguagePath(currentLanguage, 'change-password'),
    [currentLanguage],
  );

  const brandHref = useMemo(
    () => buildLanguagePath(currentLanguage, 'services'),
    [currentLanguage],
  );

  const menuLabel = me?.displayName ?? me?.email ?? t('nav.profile');

  const handleLogout = () => {
    logout();
    accountMenu.close({ focusTrigger: true });
  };

  const hasNavigation = navigationLinks.length > 0;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-900 text-white shadow-sm print:hidden">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
        <div className="flex flex-1 items-center gap-3">
          {hasNavigation ? (
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 lg:hidden"
              aria-controls="app-navigation"
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
            className="text-lg font-semibold tracking-tight hover:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <span aria-hidden="true">EBaL</span>
            <span className="sr-only">{t('app.title')}</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end gap-3">
          <LanguageSwitcher currentLanguage={currentLanguage} />
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
                  value: menuLabel,
                  defaultValue: menuLabel,
                })}
                className="flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-3 py-1 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                onClick={accountMenu.toggle}
              >
                <span className="max-w-[10rem] truncate" title={menuLabel}>
                  {menuLabel}
                </span>
                <span aria-hidden="true" className="text-xs">
                  {t('nav.menuIndicator')}
                </span>
              </button>
              {accountMenu.isOpen ? (
                <div
                  ref={accountMenu.popoverRef}
                  role="menu"
                  id={`${accountMenuButtonId}-menu`}
                  aria-labelledby={accountMenuButtonId}
                  className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-md border border-gray-200 bg-white text-sm text-gray-700 shadow-lg"
                >
                  <Link
                    to={profileHref}
                    role="menuitem"
                    className="block px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    onClick={() => accountMenu.close()}
                  >
                    {t('nav.profile')}
                  </Link>
                  <Link
                    to={changePasswordHref}
                    role="menuitem"
                    className="block px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    onClick={() => accountMenu.close()}
                  >
                    {t('nav.changePassword')}
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none"
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
