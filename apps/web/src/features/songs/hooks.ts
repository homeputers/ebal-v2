import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listSongs,
  createSong,
  updateSong,
  deleteSong,
  type ListSongsParams,
} from '../../api/songs';

export function useSongsList(params: ListSongsParams | undefined) {
  return useQuery({
    queryKey: ['songs', params],
    queryFn: () => listSongs(params),
    placeholderData: (prev) => prev,
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['songs'] }),
  });
}

export function useDeleteSong() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSong,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['songs'] }),
  });
}
