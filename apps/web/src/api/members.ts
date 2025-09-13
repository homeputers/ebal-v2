import apiClient from './client';
import type { QueryOf, ResponseOf } from './type-helpers';

type ListMembersResponse = ResponseOf<'/members', 'get', 200>;
type ListMembersParams = QueryOf<'/members', 'get'>;
type GetMemberResponse = ResponseOf<'/members/{id}', 'get', 200>;

export async function listMembers(params?: ListMembersParams) {
  const { data } = await apiClient.get<ListMembersResponse>('/members', { params });
  return data;
}

export async function getMember(id: string) {
  const { data } = await apiClient.get<GetMemberResponse>(`/members/${id}`);
  return data;
}
