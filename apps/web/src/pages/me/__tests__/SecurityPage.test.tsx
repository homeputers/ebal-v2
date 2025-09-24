import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { AxiosError } from 'axios';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

import i18n from '@/i18n';
import SecurityPage from '@/pages/me/SecurityPage';

const changePasswordMock = vi.fn();
const changeEmailMock = vi.fn();
const logoutMock = vi.fn();

vi.mock('@/features/me/hooks', () => ({
  useChangePassword: () => ({
    mutateAsync: changePasswordMock,
    isPending: false,
  }),
  useChangeEmail: () => ({
    mutateAsync: changeEmailMock,
    isPending: false,
  }),
}));

vi.mock('@/features/auth/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn(),
    logout: logoutMock,
    me: null,
    isAuthenticated: true,
    roles: [],
    hasRole: () => false,
  }),
}));

describe('SecurityPage', () => {
  beforeEach(async () => {
    changePasswordMock.mockResolvedValue(undefined);
    changeEmailMock.mockResolvedValue(undefined);
    logoutMock.mockClear();

    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () =>
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={[`/en/me/security`]}> 
          <SecurityPage />
        </MemoryRouter>
      </I18nextProvider>,
    );

  it('logs out after changing the password successfully', async () => {
    renderPage();

    const passwordForm = screen
      .getByRole('heading', { name: 'Change password' })
      .closest('form');
    expect(passwordForm).not.toBeNull();

    const currentPassword = within(passwordForm!).getByLabelText('Current password', {
      selector: 'input',
    });
    const newPassword = within(passwordForm!).getByLabelText('New password', {
      selector: 'input',
    });
    const submitButton = within(passwordForm!).getByRole('button', {
      name: 'Update password',
    });

    fireEvent.change(currentPassword, { target: { value: 'OldPassword123!' } });
    fireEvent.change(newPassword, { target: { value: 'NewPassword123!' } });

    await act(async () => {
      submitButton.click();
    });

    expect(changePasswordMock).toHaveBeenCalledWith({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
    });
    expect(logoutMock).toHaveBeenCalled();
  });

  it('shows confirmation notice after requesting email change', async () => {
    renderPage();

    const emailForm = screen
      .getByRole('heading', { name: 'Change email' })
      .closest('form');
    expect(emailForm).not.toBeNull();

    const currentPassword = within(emailForm!).getByLabelText('Current password', {
      selector: 'input',
    });
    const newEmail = within(emailForm!).getByLabelText('New email', { selector: 'input' });
    const submitButton = within(emailForm!).getByRole('button', { name: 'Request change' });

    fireEvent.change(currentPassword, { target: { value: 'SecurePass1!' } });
    fireEvent.change(newEmail, { target: { value: 'new@example.com' } });

    await act(async () => {
      submitButton.click();
    });

    expect(changeEmailMock).toHaveBeenCalledWith({
      currentPassword: 'SecurePass1!',
      newEmail: 'new@example.com',
    });

    expect(
      await screen.findByText('We sent a confirmation link to new@example.com.'),
    ).toBeInTheDocument();
  });

  it('surfaces invalid credentials when email change fails with 401', async () => {
    changeEmailMock.mockRejectedValueOnce(
      new AxiosError(
        'Unauthorized',
        '401',
        { headers: {} } as never,
        undefined,
        {
          data: { detail: 'Invalid email or password.' },
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config: { headers: {} } as never,
        },
      ),
    );

    renderPage();

    const emailForm = screen
      .getByRole('heading', { name: 'Change email' })
      .closest('form');
    expect(emailForm).not.toBeNull();

    const currentPassword = within(emailForm!).getByLabelText('Current password', {
      selector: 'input',
    });
    const newEmail = within(emailForm!).getByLabelText('New email', { selector: 'input' });
    const submitButton = within(emailForm!).getByRole('button', { name: 'Request change' });

    fireEvent.change(currentPassword, { target: { value: 'wrong-pass' } });
    fireEvent.change(newEmail, { target: { value: 'new@example.com' } });

    await act(async () => {
      submitButton.click();
    });

    expect(changeEmailMock).toHaveBeenCalledWith({
      currentPassword: 'wrong-pass',
      newEmail: 'new@example.com',
    });

    expect(
      await within(emailForm!).findByText('Invalid email or password.'),
    ).toBeInTheDocument();
    expect(logoutMock).not.toHaveBeenCalled();
  });
});
