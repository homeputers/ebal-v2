import { act, fireEvent, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';

import i18n from '@/i18n';
import { AvatarUploader } from '../AvatarUploader';

const mutateAsyncMock = vi.fn();
const originalURL = window.URL;

vi.mock('@/features/me/hooks', () => ({
  useUploadAvatar: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
  }),
}));

describe('AvatarUploader', () => {
  beforeEach(async () => {
    mutateAsyncMock.mockResolvedValue({ avatarUrl: 'https://example.com/new.png' });
    Object.defineProperty(window, 'URL', {
      value: {
        createObjectURL: vi.fn(() => 'blob:preview'),
        revokeObjectURL: vi.fn(),
      },
      writable: true,
    });

    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  afterEach(() => {
    window.URL = originalURL;
    vi.clearAllMocks();
  });

  it('rejects files larger than 2MB before uploading', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <AvatarUploader avatarUrl={null} />
      </I18nextProvider>,
    );

    const fileInput = screen.getByLabelText('Avatar');

    const largeFile = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'large.png', {
      type: 'image/png',
    });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [largeFile] } });
    });

    expect(mutateAsyncMock).not.toHaveBeenCalled();
    expect(
      screen.getByText('File is too large. Maximum size is 2MB.'),
    ).toBeInTheDocument();
  });
});
