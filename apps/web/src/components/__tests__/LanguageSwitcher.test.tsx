import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { mockNavigate, mockSetAppLanguage } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockSetAppLanguage: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/i18n', () => ({
  SUPPORTED_LANGUAGES: ['en', 'es'],
  LANGUAGE_STORAGE_KEY: 'i18nextLng',
  setAppLanguage: mockSetAppLanguage,
}));

import { MemoryRouter } from 'react-router-dom';
import { LanguageSwitcher } from '../LanguageSwitcher';

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSetAppLanguage.mockReset();
    window.localStorage.clear();
  });

  it('updates i18next and persists the chosen language', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/en/services']}>
        <LanguageSwitcher currentLanguage="en" />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /change language/i }));
    await user.click(screen.getByRole('option', { name: 'Español' }));

    expect(mockSetAppLanguage).toHaveBeenCalledWith('es');
    expect(window.localStorage.getItem('i18nextLng')).toBe('es');
  });

  it('rewrites the current route with the selected language', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/en/song-sets/42?foo=bar#details']}>
        <LanguageSwitcher currentLanguage="en" />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /change language/i }));
    await user.click(screen.getByRole('option', { name: 'Español' }));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      '/es/song-sets/42?foo=bar#details',
      { replace: true },
    );
  });
});
