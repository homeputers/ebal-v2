import { Link } from 'react-router-dom';

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
      <ul className="flex gap-4">
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
    </nav>
  );
}
