import apiClient from './client';
import type { QueryOf, ResponseOf } from './type-helpers';

type ListSetsResponse = ResponseOf<'/song-sets', 'get', 200>;
type ListSetsParams = QueryOf<'/song-sets', 'get'>;
type GetSetResponse = ResponseOf<'/song-sets/{id}', 'get', 200>;

export async function listSets(params?: ListSetsParams) {
  const { data } = await apiClient.get<ListSetsResponse>('/song-sets', { params });
  return data;
}

export async function getSet(id: string) {
  const { data } = await apiClient.get<GetSetResponse>(`/song-sets/${id}`);
  return data;
}
