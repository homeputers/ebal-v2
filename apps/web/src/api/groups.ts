import apiClient from './client';
import type { QueryOf, ResponseOf } from './type-helpers';

type ListGroupsResponse = ResponseOf<'/groups', 'get', 200>;
type ListGroupsParams = QueryOf<'/groups', 'get'>;
type GetGroupResponse = ResponseOf<'/groups/{id}', 'get', 200>;

export async function listGroups(params?: ListGroupsParams) {
  const { data } = await apiClient.get<ListGroupsResponse>('/groups', { params });
  return data;
}

export async function getGroup(id: string) {
  const { data } = await apiClient.get<GetGroupResponse>(`/groups/${id}`);
  return data;
}
