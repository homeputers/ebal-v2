import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  type ListGroupsParams,
} from '../../api/groups';

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
