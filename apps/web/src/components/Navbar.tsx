import { Link } from 'react-router-dom';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const links = [
  { path: 'members', label: 'Members' },
  { path: 'groups', label: 'Groups' },
  { path: 'songs', label: 'Songs' },
  { path: 'song-sets', label: 'Song Sets' },
  { path: 'services', label: 'Services' },
];

type NavbarProps = {
  currentLanguage: string;
};

const makeHref = (language: string, path: string) =>
  `/${language}${path.startsWith('/') ? path : `/${path}`}`;

export function Navbar({ currentLanguage }: NavbarProps) {
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
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <LanguageSwitcher currentLanguage={currentLanguage} />
      </div>
    </nav>
  );
}
