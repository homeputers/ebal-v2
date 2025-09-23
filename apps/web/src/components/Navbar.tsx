import { Link } from 'react-router-dom';
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
  { path: 'songs', labelKey: 'nav.songs', roles: ['ADMIN', 'PLANNER'] },
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
  const { hasRole, isAuthenticated, logout } = useAuth();

  const visibleLinks = links.filter((link) => {
    if (!link.roles || link.roles.length === 0) {
      return true;
    }

    return link.roles.some((role) => hasRole(role));
  });

  return (
    <nav className="bg-gray-800 text-white p-4 print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <ul className="flex flex-wrap items-center gap-4">
          {visibleLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={makeHref(currentLanguage, link.path)}
                className="hover:underline"
              >
                {t(link.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-white/30 bg-white/10 px-3 py-1 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              {t('nav.logout')}
            </button>
          ) : null}
          <LanguageSwitcher currentLanguage={currentLanguage} />
        </div>
      </div>
    </nav>
  );
}
