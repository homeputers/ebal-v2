import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import {
  getAuthTokens,
  subscribeToAuthTokens,
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  type CurrentUser,
  type LoginRequest,
  type LoginResponse,
  type Role,
} from '@/api/auth';

const AUTH_QUERY_KEY = ['auth', 'me'] as const;

type LoginFn = (payload: LoginRequest) => Promise<LoginResponse>;

type UseAuthResult = {
  login: LoginFn;
  logout: () => void;
  me: CurrentUser | null;
  isAuthenticated: boolean;
  roles: Role[];
  hasRole: (role: Role) => boolean;
};

export function useAuth(): UseAuthResult {
  const queryClient = useQueryClient();
  const tokens = useSyncExternalStore(
    subscribeToAuthTokens,
    getAuthTokens,
    getAuthTokens,
  );

  const hasAccessToken = Boolean(tokens?.accessToken);

  const meQuery = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getCurrentUser,
    enabled: hasAccessToken,
    retry: (failureCount, error) => {
      if (isAxiosError(error) && error.response?.status === 401) {
        return false;
      }

      return failureCount < 2;
    },
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginRequest) => loginRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });

  const logout = useCallback(() => {
    logoutRequest();
    queryClient.removeQueries({ queryKey: ['auth'] });
  }, [queryClient]);

  const roles = useMemo(() => meQuery.data?.roles ?? [], [meQuery.data]);

  const hasRole = useCallback(
    (role: Role) => roles.includes(role),
    [roles],
  );

  return useMemo(
    () => ({
      login: loginMutation.mutateAsync as LoginFn,
      logout,
      me: meQuery.data ?? null,
      isAuthenticated: Boolean(tokens?.accessToken),
      roles,
      hasRole,
    }),
    [hasRole, loginMutation.mutateAsync, logout, meQuery.data, roles, tokens?.accessToken],
  );
}
