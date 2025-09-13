import type { paths } from './types';
import apiClient from './client';

type ListMembersResponse = paths['/members']['get']['responses']['200']['content']['application/json'];
type ListMembersParams = paths['/members']['get']['parameters']['query'];
type GetMemberResponse = paths['/members/{id}']['get']['responses']['200']['content']['application/json'];

export async function listMembers(params?: ListMembersParams) {
  const { data } = await apiClient.get<ListMembersResponse>('/members', { params });
  return data;
}

export async function getMember(id: string) {
  const { data } = await apiClient.get<GetMemberResponse>(`/members/${id}`);
  return data;
}
