import apiClient from './client';
import type { paths } from './types';
import { QueryOf, ResponseOf, PathParamsOf, RequestBodyOf } from './type-helpers';

// Path literals for clarity (must match your OpenAPI spec)
type MembersPath = keyof paths & '/members';
type MemberPath = keyof paths & '/members/{id}';

// Types
export type ListMembersParams = QueryOf<MembersPath, 'get'>;
export type ListMembersResponse = ResponseOf<MembersPath, 'get', 200>;

export type GetMemberParams = PathParamsOf<MemberPath, 'get'>;
export type GetMemberResponse = ResponseOf<MemberPath, 'get', 200>;

export type CreateMemberBody = RequestBodyOf<MembersPath, 'post'>;
export type CreateMemberResponse = ResponseOf<MembersPath, 'post', 201>;

export type UpdateMemberParams = PathParamsOf<MemberPath, 'put'>;
export type UpdateMemberBody = RequestBodyOf<MemberPath, 'put'>;
export type UpdateMemberResponse = ResponseOf<MemberPath, 'put', 200>;

export type DeleteMemberParams = PathParamsOf<MemberPath, 'delete'>;

export async function listMembers(params?: ListMembersParams) {
  const { data } = await apiClient.get<ListMembersResponse>('/members', { params });
  return data;
}

export async function getMember(id: string) {
  const { data } = await apiClient.get<GetMemberResponse>(`/members/${id}`);
  return data;
}

export async function createMember(body: CreateMemberBody) {
  const { data } = await apiClient.post<CreateMemberResponse>('/members', body);
  return data;
}

export async function updateMember(id: string, body: UpdateMemberBody) {
  const { data } = await apiClient.put<UpdateMemberResponse>(`/members/${id}`, body);
  return data;
}

export async function deleteMember(id: string) {
  await apiClient.delete<void>(`/members/${id}`);
}
