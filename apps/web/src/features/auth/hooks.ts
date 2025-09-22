import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  changePassword,
  login,
  requestPasswordReset,
  resetPassword,
  type ChangePasswordRequest,
  type ForgotPasswordRequest,
  type LoginRequest,
  type LoginResponse,
  type ResetPasswordRequest,
} from '@/api/auth';

const authRootKey = ['auth'] as const;

export const authQueryKeys = {
  all: authRootKey,
  me: () => [...authRootKey, 'me'] as const,
} as const;

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, unknown, LoginRequest>({
    mutationFn: (payload) => login(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.me() });
    },
  });
}

export function useForgotPassword() {
  return useMutation<void, unknown, ForgotPasswordRequest>({
    mutationFn: (payload) => requestPasswordReset(payload),
  });
}

export function useResetPassword() {
  return useMutation<void, unknown, ResetPasswordRequest>({
    mutationFn: (payload) => resetPassword(payload),
  });
}

export function useChangePassword() {
  return useMutation<void, unknown, ChangePasswordRequest>({
    mutationFn: (payload) => changePassword(payload),
  });
}
