import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';

import type { CurrentUser, Role } from '@/api/auth';
import i18n from '@/i18n';
import { Navbar } from '../Navbar';

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: ({ currentLanguage }: { currentLanguage: string }) => (
    <div data-testid="language-switcher">{currentLanguage}</div>
  ),
}));

let activeRoles: Set<Role> = new Set<Role>([
  'ADMIN',
  'PLANNER',
  'MUSICIAN',
  'VIEWER',
]);

let isAuthenticated = true;

const logoutMock = vi.fn();

const buildUser = (): CurrentUser => ({
  id: 'user-id',
  displayName: 'Test User',
  email: 'test@example.com',
  roles: Array.from(activeRoles),
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const mockUseAuth = vi.fn(() => ({
  login: vi.fn(),
  logout: logoutMock,
  me: isAuthenticated ? buildUser() : null,
  isAuthenticated,
  roles: Array.from(activeRoles),
  hasRole: (role: Role) => activeRoles.has(role),
}));

const setActiveRoles = (roles: Role[]) => {
  activeRoles = new Set<Role>(roles);
};

const setIsAuthenticated = (value: boolean) => {
  isAuthenticated = value;
};

vi.mock('@/features/auth/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const changeLanguage = async (language: string) => {
  await act(async () => {
    await i18n.changeLanguage(language);
  });
};

const renderNavbar = async (language: string) => {
  await changeLanguage(language);

  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[`/${language}`]}>
        <Navbar currentLanguage={language} />
      </MemoryRouter>
    </I18nextProvider>,
  );
};

describe('Navbar', () => {
  afterEach(async () => {
    await changeLanguage('en');
    setIsAuthenticated(true);
    setActiveRoles(['ADMIN', 'PLANNER', 'MUSICIAN', 'VIEWER']);
    logoutMock.mockClear();
  });

  it.each([
    {
      language: 'en',
      labels: [
        'Members',
        'Groups',
        'Songs',
        'Song Sets',
        'Services',
        'User Management',
      ],
    },
    {
      language: 'es',
      labels: [
        'Miembros',
        'Grupos',
        'Canciones',
        'Listas de canciones',
        'Servicios',
        'Gestión de usuarios',
      ],
    },
  ])('renders translated navigation labels for $language', async ({
    language,
    labels,
  }) => {
    setActiveRoles(['ADMIN', 'PLANNER', 'MUSICIAN', 'VIEWER']);
    mockUseAuth.mockClear();
    await renderNavbar(language);

    for (const label of labels) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('hides planner-only navigation links when role missing', async () => {
    setActiveRoles(['MUSICIAN']);
    mockUseAuth.mockClear();

    await renderNavbar('en');

    expect(screen.getByRole('link', { name: 'Services' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Members' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Groups' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Songs' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Song Sets' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'User Management' }),
    ).not.toBeInTheDocument();
  });

  it('shows admin-only links only for admin role', async () => {
    setActiveRoles(['ADMIN']);
    mockUseAuth.mockClear();

    await renderNavbar('en');

    expect(
      screen.getByRole('link', { name: 'User Management' }),
    ).toBeInTheDocument();

    setActiveRoles(['PLANNER']);
    mockUseAuth.mockClear();

    await renderNavbar('en');

    expect(
      screen.queryByRole('link', { name: 'User Management' }),
    ).not.toBeInTheDocument();
  });

  it('renders logout control when authenticated', async () => {
    setIsAuthenticated(true);
    mockUseAuth.mockClear();

    await renderNavbar('en');

    const summary = screen.getByText('Test User').closest('summary');
    expect(summary).not.toBeNull();
    await act(async () => {
      summary?.click();
    });

    expect(
      screen.getByRole('link', { name: 'Change password' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });

  it('hides logout control when unauthenticated', async () => {
    setIsAuthenticated(false);
    mockUseAuth.mockClear();

    await renderNavbar('en');

    const logoutButton = screen.queryByRole('button', { name: 'Log out' });
    expect(logoutButton).not.toBeInTheDocument();
  });

  it('calls logout handler when logout button clicked', async () => {
    setIsAuthenticated(true);
    mockUseAuth.mockClear();
    logoutMock.mockClear();

    await renderNavbar('en');

    const summary = screen.getByText('Test User').closest('summary');
    await act(async () => {
      summary?.click();
    });

    const button = screen.getByRole('button', { name: 'Log out' });
    await act(async () => {
      button.click();
    });

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it('renders profile link in the user menu', async () => {
    setIsAuthenticated(true);
    mockUseAuth.mockClear();

    await renderNavbar('en');

    const summary = screen.getByText('Test User').closest('summary');
    await act(async () => {
      summary?.click();
    });

    expect(screen.getByRole('link', { name: 'Profile' })).toBeInTheDocument();
  });
});
