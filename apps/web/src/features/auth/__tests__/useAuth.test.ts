import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AxiosError } from 'axios';

import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CurrentUser, LoginRequest } from '@/api/auth';

const mocks = vi.hoisted(() => {
  const removeQueriesMock = vi.fn();
  const loginMutateAsync = vi.fn();

  return {
    getAuthTokensMock: vi.fn(),
    subscribeToAuthTokensMock: vi.fn(),
    getStoredCurrentUserMock: vi.fn(),
    logoutMock: vi.fn(),
    loginMutateAsync,
    useLoginMock: vi.fn(() => ({ mutateAsync: loginMutateAsync })),
    useQueryMock: vi.fn(),
    useQueryClientMock: vi.fn(() => ({ removeQueries: removeQueriesMock })),
    removeQueriesMock,
  };
});

const mockTokens = { accessToken: 'access-token', refreshToken: 'refresh-token', expiresIn: 900 };
const storedUser: CurrentUser = {
  id: '11111111-2222-3333-4444-555555555555',
  email: 'user@example.com',
  displayName: 'Test User',
  roles: ['PLANNER'],
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};
const currentUser: CurrentUser = {
  ...storedUser,
  roles: ['PLANNER', 'MUSICIAN'],
};

const tokenSubscribers = new Set<() => void>();

const getAuthTokensMock = mocks.getAuthTokensMock as ReturnType<typeof vi.fn>;
const subscribeToAuthTokensMock = mocks.subscribeToAuthTokensMock as ReturnType<typeof vi.fn>;
const getStoredCurrentUserMock = mocks.getStoredCurrentUserMock as ReturnType<typeof vi.fn>;
const logoutMock = mocks.logoutMock as ReturnType<typeof vi.fn>;
const loginMutateAsync = mocks.loginMutateAsync as ReturnType<typeof vi.fn>;
const useLoginMock = mocks.useLoginMock as ReturnType<typeof vi.fn>;
const useQueryMock = mocks.useQueryMock as ReturnType<typeof vi.fn>;
const useQueryClientMock = mocks.useQueryClientMock as ReturnType<typeof vi.fn>;
const removeQueriesMock = mocks.removeQueriesMock as ReturnType<typeof vi.fn>;

let lastQueryOptions: UseQueryOptions<CurrentUser | undefined, unknown> | undefined;

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>(
    '@tanstack/react-query',
  );

  return {
    ...actual,
    useQuery: mocks.useQueryMock,
    useQueryClient: mocks.useQueryClientMock,
  };
});

vi.mock('@/api/auth', async () => {
  const actual = await vi.importActual<typeof import('@/api/auth')>('@/api/auth');

  return {
    ...actual,
    getAuthTokens: mocks.getAuthTokensMock,
    subscribeToAuthTokens: mocks.subscribeToAuthTokensMock,
    getStoredCurrentUser: mocks.getStoredCurrentUserMock,
    logout: mocks.logoutMock,
  };
});

vi.mock('@/features/auth/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/features/auth/hooks')>(
    '@/features/auth/hooks',
  );

  return {
    ...actual,
    useLogin: mocks.useLoginMock,
  };
});

import { authQueryKeys } from '@/features/auth/hooks';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tokenSubscribers.clear();
    lastQueryOptions = undefined;

    removeQueriesMock.mockReset();
    loginMutateAsync.mockReset();
    useQueryMock.mockReset();
    useQueryClientMock.mockReset();
    useLoginMock.mockReset();
    getAuthTokensMock.mockReset();
    subscribeToAuthTokensMock.mockReset();
    getStoredCurrentUserMock.mockReset();
    logoutMock.mockReset();

    useQueryClientMock.mockReturnValue({ removeQueries: removeQueriesMock });
    useLoginMock.mockReturnValue({ mutateAsync: loginMutateAsync });

    (useQueryMock as Mock<
      [UseQueryOptions<CurrentUser | undefined, unknown>],
      UseQueryResult<CurrentUser | undefined, unknown>
    >).mockImplementation((options) => {
      lastQueryOptions = options;
      return { data: currentUser } as UseQueryResult<CurrentUser, unknown>;
    });

    getAuthTokensMock.mockImplementation(() => mockTokens);
    getStoredCurrentUserMock.mockImplementation(() => storedUser);
    subscribeToAuthTokensMock.mockImplementation((listener: () => void) => {
      tokenSubscribers.add(listener);
      return () => tokenSubscribers.delete(listener);
    });
  });

  it('returns current user data and proxies auth helpers', async () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.me).toEqual(currentUser);
    expect(result.current.roles).toEqual(currentUser.roles);
    expect(result.current.hasRole('PLANNER')).toBe(true);
    expect(result.current.hasRole('ADMIN')).toBe(false);

    await act(async () => {
      await result.current.login({ email: 'user@example.com', password: 'secret' } as LoginRequest);
    });
    expect(loginMutateAsync).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret' });

    act(() => {
      result.current.logout();
    });

    expect(logoutMock).toHaveBeenCalled();
    expect(removeQueriesMock).toHaveBeenCalledWith({ queryKey: authQueryKeys.all });
    expect(subscribeToAuthTokensMock).toHaveBeenCalled();
  });

  it('disables query retries when the API returns 401', () => {
    renderHook(() => useAuth());

    expect(lastQueryOptions?.retry).toBeDefined();
    expect(lastQueryOptions?.initialData?.()).toEqual(storedUser);

    const retry = lastQueryOptions?.retry;
    if (!retry) {
      throw new Error('retry handler not set');
    }

    const axios401 = new AxiosError('Unauthorized', '401', undefined, undefined, {
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config: {},
      data: null,
    });

    expect(retry(1, axios401)).toBe(false);
    expect(retry(0, new Error('other'))).toBe(true);
    expect(retry(2, new Error('other'))).toBe(false);
  });
});
