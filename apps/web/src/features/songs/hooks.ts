import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listSongs,
  getSong,
  createSong,
  updateSong,
  deleteSong,
  listArrangements,
  createArrangement,
  updateArrangement,
  deleteArrangement,
  type ListSongsParams,
} from '../../api/songs';
import { withLangKey } from '../../lib/queryClient';

export function useSongsList(params: ListSongsParams | undefined) {
  return useQuery({
    queryKey: withLangKey(['songs', params]),
    queryFn: () => listSongs(params),
    placeholderData: (prev) => prev,
  });
}

export function useSong(id: string | undefined) {
  return useQuery({
    queryKey: withLangKey(['song', id]),
    queryFn: () => getSong(id!),
    enabled: !!id,
  });
}

export function useCreateSong() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSong,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['songs'] }),
  });
}

export function useUpdateSong() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateSong>[1] }) =>
      updateSong(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['songs'] });
      qc.invalidateQueries({ queryKey: ['song', id] });
    },
  });
}

export function useDeleteSong() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSong,
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['songs'] });
      qc.invalidateQueries({ queryKey: ['song', id] });
    },
  });
}

export function useArrangements(songId: string | undefined) {
  return useQuery({
    queryKey: withLangKey(['songs', songId, 'arrangements']),
    queryFn: () => listArrangements(songId!),
    enabled: !!songId,
  });
}

export function useCreateArrangement(songId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof createArrangement>[1]) =>
      createArrangement(songId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['songs'] }),
  });
}

export function useUpdateArrangement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      arrangementId,
      body,
    }: {
      arrangementId: string;
      body: Parameters<typeof updateArrangement>[1];
    }) => updateArrangement(arrangementId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['songs'] }),
  });
}

export function useDeleteArrangement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteArrangement,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['songs'] }),
  });
}
