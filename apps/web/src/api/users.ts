import apiClient from './client';
import type { paths } from './types';
import {
  QueryOf,
  ResponseOf,
  PathParamsOf,
  RequestBodyOf,
} from './type-helpers';

export type AdminUsersPath = keyof paths & '/admin/users';
export type AdminUserPath = keyof paths & '/admin/users/{id}';
export type AdminUserResetPasswordPath =
  keyof paths & '/admin/users/{id}/reset-password';

export type ListUsersParams = QueryOf<AdminUsersPath, 'get'>;
export type ListUsersResponse = ResponseOf<AdminUsersPath, 'get', 200>;

export type CreateUserBody = RequestBodyOf<AdminUsersPath, 'post'>;
export type CreateUserResponse = ResponseOf<AdminUsersPath, 'post', 201>;

export type GetUserParams = PathParamsOf<AdminUserPath, 'get'>;
export type GetUserResponse = ResponseOf<AdminUserPath, 'get', 200>;

export type UpdateUserParams = PathParamsOf<AdminUserPath, 'patch'>;
export type UpdateUserBody = RequestBodyOf<AdminUserPath, 'patch'>;
export type UpdateUserResponse = ResponseOf<AdminUserPath, 'patch', 200>;

export type DeleteUserParams = PathParamsOf<AdminUserPath, 'delete'>;
export type ResetUserPasswordParams = PathParamsOf<
  AdminUserResetPasswordPath,
  'post'
>;

export async function listUsers(params?: ListUsersParams) {
  const { data } = await apiClient.get<ListUsersResponse>('/admin/users', {
    params,
  });
  return data;
}

export async function createUser(body: CreateUserBody) {
  const { data } = await apiClient.post<CreateUserResponse>(
    '/admin/users',
    body,
  );
  return data;
}

export async function getUser(id: string) {
  const { data } = await apiClient.get<GetUserResponse>(`/admin/users/${id}`);
  return data;
}

export async function updateUser(id: string, body: UpdateUserBody) {
  const { data } = await apiClient.patch<UpdateUserResponse>(
    `/admin/users/${id}`,
    body,
  );
  return data;
}

export async function deleteUser(id: string) {
  await apiClient.delete<void>(`/admin/users/${id}`);
}

export async function resetUserPassword(id: string) {
  await apiClient.post<void>(`/admin/users/${id}/reset-password`);
}
