import { act, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

import i18n from '@/i18n';
import ProfilePage from '@/pages/me/ProfilePage';

const profileFixture = {
  id: 'user-id',
  displayName: 'Jane Doe',
  email: 'jane@example.com',
  roles: ['ADMIN', 'MUSICIAN'] as const,
  isActive: true,
  avatarUrl: 'https://example.com/avatar.png',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const useMyProfileMock = vi.fn();
const useUpdateMyProfileMock = vi.fn();
const useDeleteAvatarMock = vi.fn();

vi.mock('@/features/me/hooks', () => ({
  useMyProfile: () => useMyProfileMock(),
  useUpdateMyProfile: () => useUpdateMyProfileMock(),
  useDeleteAvatar: () => useDeleteAvatarMock(),
}));

vi.mock('@/features/me/components/AvatarUploader', () => ({
  AvatarUploader: ({ avatarUrl }: { avatarUrl?: string | null }) => (
    <div data-testid="avatar-uploader">{avatarUrl ?? 'none'}</div>
  ),
}));

describe('ProfilePage', () => {
  beforeEach(async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });

    useMyProfileMock.mockReturnValue({
      data: profileFixture,
      isLoading: false,
      isError: false,
    });

    useUpdateMyProfileMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    useDeleteAvatarMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the current user profile information', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={[`/en/me`]}> 
          <ProfilePage />
        </MemoryRouter>
      </I18nextProvider>,
    );

    expect(await screen.findByDisplayValue('Jane Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Administrator')).toBeInTheDocument();
    expect(screen.getByText('Musician')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-uploader')).toHaveTextContent(
      profileFixture.avatarUrl,
    );
  });
});
