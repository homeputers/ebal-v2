import type { paths } from './types';
import apiClient from './client';

type ListSongsResponse = paths['/songs']['get']['responses']['200']['content']['application/json'];
type ListSongsParams = paths['/songs']['get']['parameters']['query'];
type GetSongResponse = paths['/songs/{id}']['get']['responses']['200']['content']['application/json'];

export async function listSongs(params?: ListSongsParams) {
  const { data } = await apiClient.get<ListSongsResponse>('/songs', { params });
  return data;
}

export async function getSong(id: string) {
  const { data } = await apiClient.get<GetSongResponse>(`/songs/${id}`);
  return data;
}
