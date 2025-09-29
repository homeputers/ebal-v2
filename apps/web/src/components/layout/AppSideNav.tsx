import { Fragment, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import type { AppNavigationLink } from '@/components/navigation/links';
import { buildLanguagePath } from '@/components/navigation/links';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAuth } from '@/features/auth/useAuth';

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

const focusableSelectors = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const getFocusableElements = (container: HTMLElement | null) => {
  if (!container) {
    return [];
  }

  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelectors),
  );

  return elements.filter((element) =>
    Boolean(
      element.offsetParent !== null ||
        element instanceof HTMLAnchorElement ||
        element instanceof HTMLButtonElement,
    ),
  );
};

export function AppSideNav({
  currentLanguage,
  navigationLinks,
  isOpen,
  onClose,
}: AppSideNavProps) {
  const { t } = useTranslation('common');
  const { logout, me, isAuthenticated } = useAuth();
  const brandHref = buildLanguagePath(currentLanguage, 'services');
  const profileHref = buildLanguagePath(currentLanguage, 'me');
  const changePasswordHref = buildLanguagePath(
    currentLanguage,
    'change-password',
  );
  const accountName = me?.displayName?.trim() ?? me?.email ?? '';
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    if (!isOpen) {
      const previous = previouslyFocusedElementRef.current;

      if (previous) {
        previous.focus();
      }

      previouslyFocusedElementRef.current = null;

      return;
    }

    previouslyFocusedElementRef.current =
      (document.activeElement as HTMLElement | null) ?? null;

    const drawer = drawerRef.current;

    if (!drawer) {
      return;
    }

    const focusFirstElement = () => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
        return;
      }

      const focusable = getFocusableElements(drawer);

      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        drawer.focus();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      const focusable = getFocusableElements(drawer);

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!active || !drawer.contains(active) || active === first) {
          event.preventDefault();
          last.focus();
        }

        return;
      }

      if (!active || !drawer.contains(active) || active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target || drawer.contains(target)) {
        return;
      }

      const focusable = getFocusableElements(drawer);

      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        drawer.focus();
      }
    };

    requestAnimationFrame(focusFirstElement);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [isOpen]);

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
            ref={drawerRef}
            className="fixed inset-y-0 left-0 z-50 w-full max-w-xs overflow-y-auto border-r border-border bg-card px-4 py-6 text-foreground shadow-xl"
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between gap-3">
                <Link
                  to={brandHref}
                  className="text-base font-semibold tracking-tight text-foreground transition-colors hover:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  onClick={onClose}
                >
                  {t('app.title')}
                </Link>
                <button
                  ref={closeButtonRef}
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
              <div className="mt-6 flex flex-1 flex-col">
                <div className="flex-1 overflow-y-auto">{navContent}</div>
                <div className="mt-8 space-y-6 border-t border-border pt-6">
                  <section aria-label={t('nav.organizationSectionLabel')}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t('nav.organizationSectionLabel')}
                    </p>
                    <Link
                      to={brandHref}
                      className="mt-3 inline-flex w-full items-center justify-between rounded-md border border-border/60 bg-muted px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      onClick={onClose}
                    >
                      <span>{t('app.title')}</span>
                      <span aria-hidden="true" className="text-xs">
                        {t('nav.menuIndicator')}
                      </span>
                    </Link>
                  </section>
                  <section aria-label={t('nav.languageSectionLabel')}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t('nav.languageSectionLabel')}
                    </p>
                    <LanguageSwitcher
                      currentLanguage={currentLanguage}
                      className="mt-3 w-full"
                    />
                  </section>
                  {isAuthenticated ? (
                    <section aria-label={t('nav.accountSectionLabel')}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t('nav.accountSectionLabel')}
                      </p>
                      {accountName ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {accountName}
                        </p>
                      ) : null}
                      <ul className="mt-3 space-y-2">
                        <li>
                          <Link
                            to={profileHref}
                            className="flex w-full items-center justify-between rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            onClick={onClose}
                          >
                            {t('nav.profile')}
                          </Link>
                        </li>
                        <li>
                          <Link
                            to={changePasswordHref}
                            className="flex w-full items-center justify-between rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            onClick={onClose}
                          >
                            {t('nav.changePassword')}
                          </Link>
                        </li>
                        <li>
                          <button
                            type="button"
                            className="flex w-full items-center justify-between rounded-md border border-transparent px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            onClick={() => {
                              onClose();
                              logout();
                            }}
                          >
                            {t('nav.logout')}
                          </button>
                        </li>
                      </ul>
                    </section>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Fragment>
  );
}
