import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';

import type { CurrentUser, Role } from '@/api/auth';
import i18n from '@/i18n';
import { AppShell } from '@/components/layout/AppShell';

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

type RenderOptions = {
  initialEntry?: string;
};

const renderAppShell = async (language: string, options: RenderOptions = {}) => {
  await changeLanguage(language);

  const initialEntry = options.initialEntry ?? `/${language}/services`;

  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <AppShell currentLanguage={language}>
          <div>Content</div>
        </AppShell>
      </MemoryRouter>
    </I18nextProvider>,
  );
};

describe('AppShell', () => {
  afterEach(async () => {
    await changeLanguage('en');
    setIsAuthenticated(true);
    setActiveRoles(['ADMIN', 'PLANNER', 'MUSICIAN', 'VIEWER']);
    logoutMock.mockClear();
    mockUseAuth.mockClear();
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

    await renderAppShell(language);

    for (const label of labels) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('shows musician read-only navigation links when applicable', async () => {
    setActiveRoles(['MUSICIAN']);
    mockUseAuth.mockClear();

    await renderAppShell('en');

    expect(screen.getByRole('link', { name: 'Services' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Songs' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Members' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Groups' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Song Sets' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'User Management' }),
    ).not.toBeInTheDocument();
  });

  it('shows admin-only links for admin role', async () => {
    setActiveRoles(['ADMIN']);
    mockUseAuth.mockClear();

    await renderAppShell('en');

    expect(
      screen.getByRole('link', { name: 'User Management' }),
    ).toBeInTheDocument();
  });

  it('hides admin-only links for non-admin roles', async () => {
    setActiveRoles(['PLANNER']);
    mockUseAuth.mockClear();

    await renderAppShell('en');

    expect(
      screen.queryByRole('link', { name: 'User Management' }),
    ).not.toBeInTheDocument();
  });

  it('marks the active navigation link for the current route', async () => {
    await renderAppShell('en');

    const activeLink = screen.getByRole('link', { name: 'Services' });
    expect(activeLink).toHaveAttribute('aria-current', 'page');
  });

  it('renders account controls in the navigation when authenticated', async () => {
    setIsAuthenticated(true);
    mockUseAuth.mockClear();

    await renderAppShell('en');

    expect(screen.getByRole('link', { name: 'Profile' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Change password' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });

  it('hides logout control when unauthenticated', async () => {
    setIsAuthenticated(false);
    mockUseAuth.mockClear();

    await renderAppShell('en');

    const logoutButton = screen.queryByRole('button', { name: 'Log out' });
    expect(logoutButton).not.toBeInTheDocument();
  });

  it('calls logout handler when logout button clicked', async () => {
    setIsAuthenticated(true);
    mockUseAuth.mockClear();
    logoutMock.mockClear();

    await renderAppShell('en');

    const button = screen.getByRole('button', { name: 'Log out' });
    await act(async () => {
      button.click();
    });

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it('toggles the mobile navigation when requested', async () => {
    await renderAppShell('en');

    const toggleButton = screen.getByRole('button', {
      name: 'Open navigation menu',
    });

    await act(async () => {
      toggleButton.click();
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await act(async () => {
      toggleButton.click();
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the mobile navigation when pressing Escape', async () => {
    await renderAppShell('en');

    const toggleButton = screen.getByRole('button', {
      name: 'Open navigation menu',
    });

    await act(async () => {
      toggleButton.click();
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('navigates to the services page from the organization section', async () => {
    await renderAppShell('en', { initialEntry: '/en/song-sets' });

    const toggleButton = screen.getByRole('button', {
      name: 'Open navigation menu',
    });

    await act(async () => {
      toggleButton.click();
    });

    const drawer = screen.getByRole('dialog');
    const organizationSection = within(drawer).getByRole('region', {
      name: 'Organization',
    });
    const organizationLink = within(organizationSection).getByRole('link', {
      name: 'Every Breath and Life',
    });

    const user = userEvent.setup();
    await user.click(organizationLink);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Services' }),
      ).toHaveAttribute('aria-current', 'page');
    });
  });

  it('allows changing the language from the navigation controls', async () => {
    await renderAppShell('en');

    const languageButton = screen.getByRole('button', {
      name: 'Change language',
    });

    const user = userEvent.setup();
    await user.click(languageButton);

    const spanishOption = await screen.findByRole('option', {
      name: 'Spanish',
    });

    await user.click(spanishOption);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Servicios' })).toBeInTheDocument();
    });
  });
});
