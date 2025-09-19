import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroup,
  listGroupMembers,
  addMemberToGroup,
  removeMemberFromGroup,
  type ListGroupsParams,
} from '../../api/groups';
import { withLangKey } from '../../lib/queryClient';

export function useGroupsList(params: ListGroupsParams | undefined) {
  return useQuery({
    queryKey: withLangKey(['groups', params]),
    queryFn: () => listGroups(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createGroup,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useUpdateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateGroup>[1] }) =>
      updateGroup(id, body),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: ['groups'] });
      await qc.invalidateQueries({ queryKey: ['group', vars.id] });
    },
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: async (_data, id) => {
      await qc.invalidateQueries({ queryKey: ['groups'] });
      await qc.invalidateQueries({ queryKey: ['group', id] });
    },
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: withLangKey(['group', id]),
    queryFn: () => getGroup(id),
    enabled: !!id,
  });
}

export function useGroupMembers(id: string) {
  return useQuery({
    queryKey: withLangKey(['groupMembers', id]),
    queryFn: () => listGroupMembers(id),
    enabled: !!id,
  });
}

export function useAddMemberToGroup(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => addMemberToGroup(groupId, memberId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['groupMembers', groupId] });
      await qc.invalidateQueries({ queryKey: ['group', groupId] });
    },
  });
}

export function useRemoveMemberFromGroup(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeMemberFromGroup(groupId, memberId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['groupMembers', groupId] });
      await qc.invalidateQueries({ queryKey: ['group', groupId] });
    },
  });
}
