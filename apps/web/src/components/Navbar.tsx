import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const links = [
  { path: 'members', labelKey: 'nav.members' },
  { path: 'groups', labelKey: 'nav.groups' },
  { path: 'songs', labelKey: 'nav.songs' },
  { path: 'song-sets', labelKey: 'nav.songSets' },
  { path: 'services', labelKey: 'nav.services' },
];

type NavbarProps = {
  currentLanguage: string;
};

const makeHref = (language: string, path: string) =>
  `/${language}${path.startsWith('/') ? path : `/${path}`}`;

export function Navbar({ currentLanguage }: NavbarProps) {
  const { t } = useTranslation('common');

  return (
    <nav className="bg-gray-800 text-white p-4 print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <ul className="flex flex-wrap items-center gap-4">
          {links.map((link) => (
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
        <LanguageSwitcher currentLanguage={currentLanguage} />
      </div>
    </nav>
  );
}
