import apiClient from './client';
import type { components, paths } from './types';
import {
  QueryOf,
  ResponseOf,
  PathParamsOf,
  RequestBodyOf,
} from './type-helpers';
import { getMember } from './members';

// Path literals for clarity (must match your OpenAPI spec)
type GroupsPath = keyof paths & '/groups';
type GroupPath = keyof paths & '/groups/{id}';
type GroupMemberPath = keyof paths & '/groups/{id}/members/{memberId}';

type MemberResponse = components['schemas']['MemberResponse'];

// Types
export type ListGroupsParams = QueryOf<GroupsPath, 'get'>;
export type ListGroupsResponse = ResponseOf<GroupsPath, 'get', 200>;

export type GetGroupParams = PathParamsOf<GroupPath, 'get'>;
export type GetGroupResponse = ResponseOf<GroupPath, 'get', 200>;

export type CreateGroupBody = RequestBodyOf<GroupsPath, 'post'>;
export type CreateGroupResponse = ResponseOf<GroupsPath, 'post', 201>;

export type UpdateGroupParams = PathParamsOf<GroupPath, 'put'>;
export type UpdateGroupBody = RequestBodyOf<GroupPath, 'put'>;
export type UpdateGroupResponse = ResponseOf<GroupPath, 'put', 200>;

export type DeleteGroupParams = PathParamsOf<GroupPath, 'delete'>;

export type AddMemberParams = PathParamsOf<GroupMemberPath, 'post'>;
export type RemoveMemberParams = PathParamsOf<GroupMemberPath, 'delete'>;

export type ListGroupMembersResponse = MemberResponse[];

export async function listGroups(params?: ListGroupsParams) {
  const { data } = await apiClient.get<ListGroupsResponse>('/groups', { params });
  return data;
}

export async function getGroup(id: string) {
  const { data } = await apiClient.get<GetGroupResponse>(`/groups/${id}`);
  return data;
}

export async function createGroup(body: CreateGroupBody) {
  const { data } = await apiClient.post<CreateGroupResponse>('/groups', body);
  return data;
}

export async function updateGroup(id: string, body: UpdateGroupBody) {
  const { data } = await apiClient.put<UpdateGroupResponse>(`/groups/${id}`, body);
  return data;
}

export async function deleteGroup(id: string) {
  await apiClient.delete<void>(`/groups/${id}`);
}

export async function listGroupMembers(id: string) {
  const group = await getGroup(id);
  const members = await Promise.all(
    (group.memberIds ?? []).map((mid) => getMember(mid)),
  );
  return members;
}

export async function addMemberToGroup(groupId: string, memberId: string) {
  await apiClient.post<void>(`/groups/${groupId}/members/${memberId}`);
}

export async function removeMemberFromGroup(groupId: string, memberId: string) {
  await apiClient.delete<void>(`/groups/${groupId}/members/${memberId}`);
}
