import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';

import type { Role } from '@/api/auth';
import i18n from '@/i18n';
import { Navbar } from '../Navbar';

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: ({ currentLanguage }: { currentLanguage: string }) => (
    <div data-testid="language-switcher">{currentLanguage}</div>
  ),
}));

const mockUseAuth = vi.fn(() => ({
  login: vi.fn(),
  logout: vi.fn(),
  me: null,
  isAuthenticated: true,
  roles: [] as Role[],
  hasRole: (role: Role) => activeRoles.has(role),
}));

let activeRoles: Set<Role> = new Set<Role>([
  'ADMIN',
  'PLANNER',
  'MUSICIAN',
  'VIEWER',
]);

const setActiveRoles = (roles: Role[]) => {
  activeRoles = new Set<Role>(roles);
};

vi.mock('@/features/auth/useAuth', () => ({
  useAuth: () => ({
    ...mockUseAuth(),
    roles: Array.from(activeRoles),
  }),
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
  });

  it.each([
    {
      language: 'en',
      labels: ['Members', 'Groups', 'Songs', 'Song Sets', 'Services'],
    },
    {
      language: 'es',
      labels: ['Miembros', 'Grupos', 'Canciones', 'Listas de canciones', 'Servicios'],
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
  });
});
