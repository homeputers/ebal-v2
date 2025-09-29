import { Fragment } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import type { AppNavigationLink } from '@/components/navigation/links';
import { buildLanguagePath } from '@/components/navigation/links';

type AppSideNavProps = {
  currentLanguage: string;
  navigationLinks: AppNavigationLink[];
  isOpen: boolean;
  onClose: () => void;
};

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
    isActive ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white',
  ].join(' ');

export function AppSideNav({
  currentLanguage,
  navigationLinks,
  isOpen,
  onClose,
}: AppSideNavProps) {
  const { t } = useTranslation('common');
  const brandHref = buildLanguagePath(currentLanguage, 'services');

  const navContent = (
    <nav
      id="app-navigation"
      aria-label={t('nav.primaryLabel')}
      className="space-y-2"
    >
      <ul className="space-y-1">
        {navigationLinks.map((link) => (
          <li key={link.path}>
            <NavLink
              to={buildLanguagePath(currentLanguage, link.path)}
              className={navLinkClassName}
              onClick={onClose}
            >
              {t(link.labelKey)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <Fragment>
      <aside className="hidden w-64 shrink-0 bg-gray-950 px-4 py-6 text-white shadow-lg lg:flex lg:flex-col">
        <Link
          to={brandHref}
          className="mb-6 text-base font-semibold tracking-tight text-white hover:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <span aria-hidden="true">EBaL</span>
          <span className="sr-only">{t('app.title')}</span>
        </Link>
        {navContent}
      </aside>
      {isOpen ? (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/50"
            role="presentation"
            onClick={onClose}
          />
          <div
            className="fixed inset-y-0 left-0 z-50 w-full max-w-xs overflow-y-auto bg-gray-950 px-4 py-6 text-white shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between">
              <Link
                to={brandHref}
                className="text-base font-semibold tracking-tight text-white hover:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                onClick={onClose}
              >
                {t('app.title')}
              </Link>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label={t('nav.closeMenu')}
                onClick={onClose}
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
            <div className="mt-6">{navContent}</div>
          </div>
        </div>
      ) : null}
    </Fragment>
  );
}
