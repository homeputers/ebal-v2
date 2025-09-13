import { NavLink } from 'react-router-dom';

const links = [
  { to: '/members', label: 'Members' },
  { to: '/groups', label: 'Groups' },
  { to: '/songs', label: 'Songs' },
  { to: '/song-sets', label: 'Song Sets' },
  { to: '/services', label: 'Services' },
];

export default function Navbar() {
  return (
    <nav className="p-4 bg-gray-100">
      <ul className="flex gap-4">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to}>{link.label}</NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
