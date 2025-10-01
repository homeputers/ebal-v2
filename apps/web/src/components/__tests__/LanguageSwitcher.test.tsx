import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { axe } from 'vitest-axe';

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { MemoryRouter } from 'react-router-dom';
import i18n, { LANGUAGE_STORAGE_KEY } from '@/i18n';
import { LanguageSwitcher } from '../LanguageSwitcher';

const renderLanguageSwitcher = (
  currentLanguage: string,
  initialPath = '/en/services',
) =>
  render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[initialPath]}>
        <LanguageSwitcher currentLanguage={currentLanguage} />
      </MemoryRouter>
    </I18nextProvider>,
  );

const changeLanguage = async (language: string) => {
  await act(async () => {
    await i18n.changeLanguage(language);
  });
};

describe('LanguageSwitcher', () => {
  beforeEach(async () => {
    mockNavigate.mockReset();
    window.localStorage.clear();
    await changeLanguage('en');
  });

  afterEach(async () => {
    await changeLanguage('en');
  });

  it('changes the active i18n language and persists the choice', async () => {
    const user = userEvent.setup();

    renderLanguageSwitcher('en');

    await user.click(
      screen.getByRole('button', { name: /Change language/i }),
    );
    await user.click(screen.getByRole('option', { name: 'Spanish' }));

    await waitFor(() => expect(i18n.language).toBe('es'));
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('es');
  });

  it('rewrites the current route with the selected language', async () => {
    const user = userEvent.setup();

    renderLanguageSwitcher('en', '/en/song-sets/42?foo=bar#details');

    await user.click(
      screen.getByRole('button', { name: /Change language/i }),
    );
    await user.click(screen.getByRole('option', { name: 'Spanish' }));

    await waitFor(() => expect(i18n.language).toBe('es'));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      '/es/song-sets/42?foo=bar#details',
      { replace: true },
    );
  });

  it.each([
    {
      language: 'en',
      label: 'English',
      ariaLabel: /Change language/i,
    },
    {
      language: 'es',
      label: 'Español',
      ariaLabel: /Cambiar idioma/i,
    },
  ])('shows translated labels for $language', async ({
    language,
    label,
    ariaLabel,
  }) => {
    await changeLanguage(language);

    renderLanguageSwitcher(language, `/${language}/services`);

    const button = screen.getByRole('button', { name: ariaLabel });

    expect(button).toHaveTextContent(label);
  });

  it('applies dialog semantics and traps focus while open', async () => {
    const user = userEvent.setup();

    renderLanguageSwitcher('en');

    const trigger = screen.getByRole('button', { name: /Change language/i });
    await user.click(trigger);

    const dialog = await screen.findByRole('dialog', {
      name: /Select language/i,
    });
    const englishOption = screen.getByRole('option', { name: 'English' });
    const spanishOption = screen.getByRole('option', { name: 'Spanish' });

    await waitFor(() => expect(englishOption).toHaveFocus());

    await user.tab();
    expect(spanishOption).toHaveFocus();

    await user.tab();
    expect(englishOption).toHaveFocus();

    const results = await axe(dialog);
    expect(results.violations).toHaveLength(0);

    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: /Select language/i })).not.toBeInTheDocument(),
    );

    expect(trigger).toHaveFocus();
  });
});
