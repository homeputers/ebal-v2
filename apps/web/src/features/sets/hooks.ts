import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listSets,
  createSet,
  updateSet,
  deleteSet,
  type ListSetsParams,
} from '../../api/sets';

export function useSetsList(params: ListSetsParams | undefined) {
  return useQuery({
    queryKey: ['sets', params],
    queryFn: () => listSets(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSet,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sets'] }),
  });
}

export function useUpdateSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateSet>[1] }) =>
      updateSet(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sets'] }),
  });
}

export function useDeleteSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSet,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sets'] }),
  });
}
