import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';

import i18n from '@/i18n';
import { Navbar } from '../Navbar';

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: ({ currentLanguage }: { currentLanguage: string }) => (
    <div data-testid="language-switcher">{currentLanguage}</div>
  ),
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
    await renderNavbar(language);

    for (const label of labels) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });
});
