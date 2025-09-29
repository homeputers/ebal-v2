import type { Role } from '@/api/auth';

type AppNavigationLink = {
  path: string;
  labelKey: string;
  roles?: Role[];
};

export const APP_NAVIGATION_LINKS: AppNavigationLink[] = [
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

export const buildLanguagePath = (language: string, path: string) =>
  `/${language}${path.startsWith('/') ? path : `/${path}`}`;

export const filterNavigationLinks = (
  hasRole: (role: Role) => boolean,
): AppNavigationLink[] =>
  APP_NAVIGATION_LINKS.filter((link) => {
    if (!link.roles || link.roles.length === 0) {
      return true;
    }

    return link.roles.some((role) => hasRole(role));
  });

export type { AppNavigationLink };
