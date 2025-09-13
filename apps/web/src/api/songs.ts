import apiClient from './client';
import type { QueryOf, ResponseOf } from './type-helpers';

type ListSongsResponse = ResponseOf<'/songs', 'get', 200>;
type ListSongsParams = QueryOf<'/songs', 'get'>;
type GetSongResponse = ResponseOf<'/songs/{id}', 'get', 200>;

export async function listSongs(params?: ListSongsParams) {
  const { data } = await apiClient.get<ListSongsResponse>('/songs', { params });
  return data;
}

export async function getSong(id: string) {
  const { data } = await apiClient.get<GetSongResponse>(`/songs/${id}`);
  return data;
}
