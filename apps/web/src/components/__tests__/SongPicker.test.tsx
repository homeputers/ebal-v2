import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import type { ComponentProps } from 'react';

import { SongPicker } from '../pickers/SongPicker';
import i18n from '@/i18n';
import { listSongs } from '@/api/songs';

vi.mock('@/api/songs', () => ({
  listSongs: vi.fn(),
}));

const mockedListSongs = vi.mocked(listSongs);
type ListSongsResult = Awaited<ReturnType<typeof listSongs>>;

describe('SongPicker', () => {
  const createQueryClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
      },
    });

  const renderSongPicker = (props: ComponentProps<typeof SongPicker>) => {
    const client = createQueryClient();

    const result = render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={client}>
          <SongPicker {...props} />
        </QueryClientProvider>
      </I18nextProvider>,
    );

    return { ...result, client };
  };

  beforeEach(() => {
    mockedListSongs.mockResolvedValue({
      content: [
        {
          id: 'song-1',
          title: 'Alpha',
          defaultKey: 'C',
          tags: ['Upbeat'],
        },
        {
          id: 'song-2',
          title: 'Bravo',
          defaultKey: 'G',
          tags: [],
        },
      ],
    } as ListSongsResult);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('supports keyboard navigation and selection', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderSongPicker({ value: undefined, onChange, placeholder: 'Search songs' });

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    await waitFor(() => expect(listSongs).toHaveBeenCalled());

    const listbox = await screen.findByRole('listbox');
    const alphaOption = screen.getByRole('option', { name: /Alpha/ });
    const bravoOption = screen.getByRole('option', { name: /Bravo/ });

    expect(listbox).toHaveAttribute('aria-activedescendant', alphaOption.id);

    await user.keyboard('{ArrowDown}');
    expect(listbox).toHaveAttribute('aria-activedescendant', bravoOption.id);

    await user.keyboard('{Enter}');

    await waitFor(() =>
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument(),
    );

    expect(onChange).toHaveBeenCalledWith('song-2');
    expect(combobox).toHaveValue('Bravo');
  });

  it('closes when pressing Escape without selecting', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderSongPicker({ value: undefined, onChange });

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    await waitFor(() => expect(listSongs).toHaveBeenCalled());
    await screen.findByRole('listbox');

    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument(),
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
  });
});
