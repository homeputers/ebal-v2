import type { paths } from './types';
import apiClient from './client';

type ListSetsResponse = paths['/song-sets']['get']['responses']['200']['content']['application/json'];
type ListSetsParams = paths['/song-sets']['get']['parameters']['query'];
type GetSetResponse = paths['/song-sets/{id}']['get']['responses']['200']['content']['application/json'];

export async function listSets(params?: ListSetsParams) {
  const { data } = await apiClient.get<ListSetsResponse>('/song-sets', { params });
  return data;
}

export async function getSet(id: string) {
  const { data } = await apiClient.get<GetSetResponse>(`/song-sets/${id}`);
  return data;
}
