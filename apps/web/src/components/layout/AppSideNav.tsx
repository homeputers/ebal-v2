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
    'flex w-full items-center rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    isActive
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
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
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card px-4 py-6 text-foreground shadow-sm lg:flex lg:flex-col">
        {navContent}
      </aside>
      {isOpen ? (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-40 bg-foreground/30"
            role="presentation"
            onClick={onClose}
          />
          <div
            className="fixed inset-y-0 left-0 z-50 w-full max-w-xs overflow-y-auto border-r border-border bg-card px-4 py-6 text-foreground shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between">
              <Link
                to={brandHref}
                className="text-base font-semibold tracking-tight text-foreground transition-colors hover:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={onClose}
              >
                {t('app.title')}
              </Link>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-muted text-foreground transition hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
