import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroup,
  getGroupMembers,
  addMemberToGroup,
  removeMemberFromGroup,
  type ListGroupsParams,
} from '../../api/groups';
import type { components } from '../../api/types';

type Member = components['schemas']['MemberResponse'];

export function useGroupsList(params: ListGroupsParams | undefined) {
  return useQuery({
    queryKey: ['groups', params],
    queryFn: () => listGroups(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useUpdateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateGroup>[1] }) =>
      updateGroup(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: ['group', id],
    queryFn: () => getGroup(id),
    enabled: !!id,
  });
}

export function useGroupMembers(id: string) {
  return useQuery({
    queryKey: ['group-members', id],
    queryFn: () => getGroupMembers(id),
    enabled: !!id,
  });
}

export function useAddMemberToGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, member }: { groupId: string; member: Member }) =>
      addMemberToGroup(groupId, member.id as string),
    onMutate: async ({ groupId, member }) => {
      await qc.cancelQueries({ queryKey: ['group-members', groupId] });
      const prev = qc.getQueryData<Member[]>(['group-members', groupId]) || [];
      qc.setQueryData<Member[]>(['group-members', groupId], [...prev, member]);
      return { prev };
    },
    onError: (_err, vars, ctx) => {
      qc.setQueryData(['group-members', vars.groupId], ctx?.prev);
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: ['group-members', vars.groupId] });
    },
  });
}

export function useRemoveMemberFromGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) =>
      removeMemberFromGroup(groupId, memberId),
    onMutate: async ({ groupId, memberId }) => {
      await qc.cancelQueries({ queryKey: ['group-members', groupId] });
      const prev = qc.getQueryData<Member[]>(['group-members', groupId]) || [];
      qc.setQueryData<Member[]>(
        ['group-members', groupId],
        prev.filter((m) => m.id !== memberId),
      );
      return { prev };
    },
    onError: (_err, vars, ctx) => {
      qc.setQueryData(['group-members', vars.groupId], ctx?.prev);
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: ['group-members', vars.groupId] });
    },
  });
}
