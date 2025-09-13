import type { paths } from './types';
import apiClient from './client';

type ListGroupsResponse = paths['/groups']['get']['responses']['200']['content']['application/json'];
type ListGroupsParams = paths['/groups']['get']['parameters']['query'];
type GetGroupResponse = paths['/groups/{id}']['get']['responses']['200']['content']['application/json'];

export async function listGroups(params?: ListGroupsParams) {
  const { data } = await apiClient.get<ListGroupsResponse>('/groups', { params });
  return data;
}

export async function getGroup(id: string) {
  const { data } = await apiClient.get<GetGroupResponse>(`/groups/${id}`);
  return data;
}
