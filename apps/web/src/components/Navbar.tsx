import { Link } from 'react-router-dom';

const links = [
  { to: '/members', label: 'Members' },
  { to: '/groups', label: 'Groups' },
  { to: '/songs', label: 'Songs' },
  { to: '/song-sets', label: 'Song Sets' },
  { to: '/services', label: 'Services' },
];

export function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex gap-4">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="hover:underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
