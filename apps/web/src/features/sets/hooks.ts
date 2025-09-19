import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listSets,
  getSet,
  createSet,
  updateSet,
  deleteSet,
  listSetItems,
  addSetItem,
  updateSetItem,
  removeSetItem,
  reorderSetItems,
  type ListSetsParams,
  type AddSetItemBody,
  type UpdateSetItemBody,
  type ReorderSetItemsBody,
} from '../../api/sets';
import { withLangKey } from '../../lib/queryClient';

export function useSongSetsList(params?: ListSetsParams) {
  return useQuery({
    queryKey: withLangKey(['songSets', params]),
    queryFn: () => listSets(params),
    placeholderData: (prev) => prev,
  });
}

export function useSongSet(id: string | undefined) {
  return useQuery({
    queryKey: withLangKey(['songSet', id]),
    queryFn: () => getSet(id!),
    enabled: !!id,
  });
}

export function useCreateSet() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createSet,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['songSets'] });
      if (data?.id) {
        qc.invalidateQueries({ queryKey: ['songSet', data.id] });
        qc.invalidateQueries({ queryKey: ['songSetItems', data.id] });
      }
    },
  });
}

export function useUpdateSet() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateSet>[1] }) =>
      updateSet(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['songSets'] });
      qc.invalidateQueries({ queryKey: ['songSet', id] });
      qc.invalidateQueries({ queryKey: ['songSetItems', id] });
    },
  });
}

export function useDeleteSet() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteSet,
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['songSets'] });
      qc.invalidateQueries({ queryKey: ['songSet', id] });
      qc.invalidateQueries({ queryKey: ['songSetItems', id] });
    },
  });
}

export function useSetItems(setId: string | undefined) {
  return useQuery({
    queryKey: withLangKey(['songSetItems', setId]),
    queryFn: () => listSetItems(setId!),
    enabled: !!setId,
  });
}

export function useAddSetItem(setId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: AddSetItemBody) => addSetItem(setId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['songSetItems', setId] });
      qc.invalidateQueries({ queryKey: ['songSet', setId] });
      qc.invalidateQueries({ queryKey: ['songSets'] });
    },
  });
}

type UpdateSetItemVariables = {
  setId: string;
  itemId: string;
  body: UpdateSetItemBody;
};

export function useUpdateSetItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, body }: UpdateSetItemVariables) => updateSetItem(itemId, body),
    onSuccess: (_, { setId }) => {
      qc.invalidateQueries({ queryKey: ['songSetItems', setId] });
      qc.invalidateQueries({ queryKey: ['songSet', setId] });
      qc.invalidateQueries({ queryKey: ['songSets'] });
    },
  });
}

type RemoveSetItemVariables = {
  setId: string;
  itemId: string;
};

export function useRemoveSetItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId }: RemoveSetItemVariables) => removeSetItem(itemId),
    onSuccess: (_, { setId }) => {
      qc.invalidateQueries({ queryKey: ['songSetItems', setId] });
      qc.invalidateQueries({ queryKey: ['songSet', setId] });
      qc.invalidateQueries({ queryKey: ['songSets'] });
    },
  });
}

export function useReorderSetItems(setId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: ReorderSetItemsBody) => reorderSetItems(setId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['songSetItems', setId] });
      qc.invalidateQueries({ queryKey: ['songSet', setId] });
      qc.invalidateQueries({ queryKey: ['songSets'] });
    },
  });
}
