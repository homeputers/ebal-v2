import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import type { Role } from '@/api/auth';
import { useAuth } from '@/features/auth/useAuth';

type NavbarProps = {
  currentLanguage: string;
};

type NavLink = {
  path: string;
  labelKey: string;
  roles?: Role[];
};

const links: NavLink[] = [
  { path: 'members', labelKey: 'nav.members', roles: ['ADMIN', 'PLANNER'] },
  { path: 'groups', labelKey: 'nav.groups', roles: ['ADMIN', 'PLANNER'] },
  {
    path: 'songs',
    labelKey: 'nav.songs',
    roles: ['ADMIN', 'PLANNER', 'MUSICIAN'],
  },
  {
    path: 'song-sets',
    labelKey: 'nav.songSets',
    roles: ['ADMIN', 'PLANNER'],
  },
  {
    path: 'services',
    labelKey: 'nav.services',
    roles: ['ADMIN', 'PLANNER', 'MUSICIAN', 'VIEWER'],
  },
  {
    path: 'admin/users',
    labelKey: 'nav.adminUsers',
    roles: ['ADMIN'],
  },
];

const makeHref = (language: string, path: string) =>
  `/${language}${path.startsWith('/') ? path : `/${path}`}`;

export function Navbar({ currentLanguage }: NavbarProps) {
  const { t } = useTranslation('common');
  const { hasRole, isAuthenticated, logout, me } = useAuth();
  const menuRef = useRef<HTMLDetailsElement | null>(null);
  const location = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuId = useId();

  const visibleLinks = links.filter((link) => {
    if (!link.roles || link.roles.length === 0) {
      return true;
    }

    return link.roles.some((role) => hasRole(role));
  });

  const profileHref = makeHref(currentLanguage, 'me');
  const changePasswordHref = makeHref(currentLanguage, 'change-password');
  const brandHref = makeHref(currentLanguage, 'services');

  const menuLabel = me?.displayName ?? me?.email ?? t('nav.profile');
  const accountDescriptor = me?.email
    ? t('nav.accountLabel', { value: me.email })
    : null;

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMobileMenu, isMobileMenuOpen]);

  useEffect(() => {
    closeMobileMenu();
  }, [closeMobileMenu, location.pathname]);

  const handleLogout = () => {
    logout();
    if (menuRef.current) {
      menuRef.current.open = false;
    }
    closeMobileMenu();
  };

  const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
    [
      'block rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
      isActive
        ? 'bg-white/20 text-white'
        : 'text-white/80 hover:bg-white/10 hover:text-white',
    ].join(' ');

  const renderNavLinks = (onNavigate?: () => void) => (
    <ul className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
      {visibleLinks.map((link) => (
        <li key={link.path}>
          <NavLink
            to={makeHref(currentLanguage, link.path)}
            className={navLinkClassName}
            onClick={onNavigate}
          >
            {t(link.labelKey)}
          </NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <header className="bg-gray-900 text-white shadow-sm print:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <div className="flex flex-1 items-center gap-3">
          {visibleLinks.length > 0 ? (
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 lg:hidden"
              aria-controls={mobileMenuId}
              aria-expanded={isMobileMenuOpen}
              aria-label={
                isMobileMenuOpen
                  ? t('nav.closeMenu')
                  : t('nav.openMenu')
              }
              onClick={() => {
                setMobileMenuOpen((value) => !value);
              }}
            >
              <span aria-hidden="true" className="block h-4 w-4">
                <svg
                  className="h-full w-full"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {isMobileMenuOpen ? (
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
            {t('app.title')}
          </Link>
        </div>
        <nav
          aria-label={t('nav.primaryLabel')}
          className="hidden flex-1 justify-center lg:flex"
        >
          {renderNavLinks()}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-3">
          {accountDescriptor ? (
            <p
              className="hidden max-w-[12rem] truncate text-xs font-medium text-white/80 sm:block"
              title={accountDescriptor}
            >
              {accountDescriptor}
            </p>
          ) : null}
          <LanguageSwitcher currentLanguage={currentLanguage} />
          {isAuthenticated ? (
            <details ref={menuRef} className="relative">
              <summary
                className="flex cursor-pointer list-none items-center gap-2 rounded-md border border-white/30 bg-white/10 px-3 py-1 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <span>{menuLabel}</span>
                <span aria-hidden="true" className="text-xs">
                  {t('nav.menuIndicator')}
                </span>
              </summary>
              <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-md border border-gray-200 bg-white text-sm text-gray-700 shadow-lg">
                <Link
                  to={profileHref}
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    if (menuRef.current) {
                      menuRef.current.open = false;
                    }
                  }}
                >
                  {t('nav.profile')}
                </Link>
                <Link
                  to={changePasswordHref}
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    if (menuRef.current) {
                      menuRef.current.open = false;
                    }
                  }}
                >
                  {t('nav.changePassword')}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                >
                  {t('nav.logout')}
                </button>
              </div>
            </details>
          ) : null}
        </div>
      </div>
      {isMobileMenuOpen ? (
        <div
          className="lg:hidden"
          role="presentation"
        >
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={closeMobileMenu}
          />
          <div
            id={mobileMenuId}
            role="dialog"
            aria-modal="true"
            className="fixed inset-y-0 left-0 z-50 w-full max-w-xs overflow-y-auto bg-gray-900 px-4 py-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <Link
                to={brandHref}
                className="text-base font-semibold tracking-tight hover:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                {t('app.title')}
              </Link>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label={t('nav.closeMenu')}
                onClick={closeMobileMenu}
              >
                <span aria-hidden="true" className="block h-4 w-4">
                  <svg
                    className="h-full w-full"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 5.5L14.5 16M15.5 5.5L5 16"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
            </div>
            <nav className="mt-6" aria-label={t('nav.primaryLabel')}>
              {renderNavLinks(closeMobileMenu)}
            </nav>
            <div className="mt-6 border-t border-white/10 pt-6">
              {accountDescriptor ? (
                <p className="text-sm text-white/80" title={accountDescriptor}>
                  {accountDescriptor}
                </p>
              ) : null}
              <div className="mt-4">
                <LanguageSwitcher currentLanguage={currentLanguage} />
              </div>
              {isAuthenticated ? (
                <div className="mt-4 space-y-2 text-sm">
                  <Link
                    to={profileHref}
                    className="block rounded-md bg-white/10 px-3 py-2 text-white hover:bg-white/20"
                    onClick={closeMobileMenu}
                  >
                    {t('nav.profile')}
                  </Link>
                  <Link
                    to={changePasswordHref}
                    className="block rounded-md bg-white/10 px-3 py-2 text-white hover:bg-white/20"
                    onClick={closeMobileMenu}
                  >
                    {t('nav.changePassword')}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-md bg-red-600 px-3 py-2 text-left font-medium text-white hover:bg-red-700"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
