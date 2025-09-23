import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  resetUserPassword,
  updateUser,
  type CreateUserBody,
  type ListUsersParams,
  type UpdateUserBody,
} from '@/api/users';
import { withLangKey } from '@/lib/queryClient';

export const userQueryKeys = {
  all: () => withLangKey(['admin', 'users'] as const),
  list: (params: ListUsersParams | undefined) =>
    withLangKey(['admin', 'users', 'list', params] as const),
  detail: (id: string | null) =>
    withLangKey(['admin', 'users', 'detail', id] as const),
};

export function useUsersList(params: ListUsersParams | undefined) {
  return useQuery({
    queryKey: userQueryKeys.list(params),
    queryFn: () => listUsers(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: userQueryKeys.detail(id ?? null),
    queryFn: () => {
      if (!id) {
        throw new Error('User id is required');
      }

      return getUser(id);
    },
    enabled: Boolean(id),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateUserBody) => createUser(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateUserBody }) =>
      updateUser(id, body),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      await queryClient.invalidateQueries({
        queryKey: userQueryKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: (id: string) => resetUserPassword(id),
  });
}
