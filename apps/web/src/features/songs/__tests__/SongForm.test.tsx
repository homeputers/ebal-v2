import { act, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';

import i18n from '@/i18n';

import { SongForm } from '../SongForm';

describe('SongForm', () => {
  beforeEach(async () => {
    window.localStorage.removeItem('i18nextLng');

    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  it('updates label text when the language changes', async () => {
    const onSubmit = vi.fn();

    const { rerender } = render(
      <I18nextProvider i18n={i18n}>
        <SongForm onSubmit={onSubmit} />
      </I18nextProvider>,
    );

    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByText('Title', { selector: 'label' })).toBeInTheDocument();

    await act(async () => {
      await i18n.changeLanguage('es');
    });

    rerender(
      <I18nextProvider i18n={i18n}>
        <SongForm onSubmit={onSubmit} />
      </I18nextProvider>,
    );

    await screen.findByLabelText('Título');

    expect(screen.getByLabelText('Título')).toBeInTheDocument();
    expect(screen.getByText('Título', { selector: 'label' })).toBeInTheDocument();
    expect(screen.queryByText('Title', { selector: 'label' })).not.toBeInTheDocument();
  });
});
