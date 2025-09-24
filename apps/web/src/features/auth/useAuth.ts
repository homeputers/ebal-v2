import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import {
  getAuthTokens,
  subscribeToAuthTokens,
  getCurrentUser,
  getStoredCurrentUser,
  logout as logoutRequest,
  type CurrentUser,
  type LoginRequest,
  type LoginResponse,
  type Role,
} from '@/api/auth';
import { authQueryKeys, useLogin } from '@/features/auth/hooks';

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
    queryKey: authQueryKeys.me(),
    queryFn: getCurrentUser,
    enabled: hasAccessToken,
    initialData: () => {
      if (!hasAccessToken) {
        return undefined;
      }
      return getStoredCurrentUser() ?? undefined;
    },
    refetchOnWindowFocus: 'always',
    retry: (failureCount, error) => {
      if (isAxiosError(error) && error.response?.status === 401) {
        return false;
      }

      return failureCount < 2;
    },
  });

  const loginMutation = useLogin();

  const logout = useCallback(() => {
    logoutRequest();
    queryClient.removeQueries({ queryKey: authQueryKeys.all });
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
