import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listMembers, createMember, updateMember, deleteMember,
  type ListMembersParams
} from '../../api/members';

export function useMembersList(params: ListMembersParams | undefined) {
  return useQuery({
    queryKey: ['members', params],
    queryFn: () => listMembers(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMember,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateMember>[1] }) =>
      updateMember(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  });
}

export function useDeleteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMember,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  });
}
