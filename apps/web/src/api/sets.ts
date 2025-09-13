import apiClient from './client';
import type { paths } from './types';
import {
  QueryOf,
  ResponseOf,
  PathParamsOf,
  RequestBodyOf,
} from './type-helpers';

// Path literals for clarity (must match your OpenAPI spec)
type SongSetsPath = keyof paths & '/song-sets';
type SongSetPath = keyof paths & '/song-sets/{id}';

// Types
export type ListSetsParams = QueryOf<SongSetsPath, 'get'>;
export type ListSetsResponse = ResponseOf<SongSetsPath, 'get', 200>;

export type GetSetParams = PathParamsOf<SongSetPath, 'get'>;
export type GetSetResponse = ResponseOf<SongSetPath, 'get', 200>;

export type CreateSetBody = RequestBodyOf<SongSetsPath, 'post'>;
export type CreateSetResponse = ResponseOf<SongSetsPath, 'post', 201>;

export type UpdateSetParams = PathParamsOf<SongSetPath, 'put'>;
export type UpdateSetBody = RequestBodyOf<SongSetPath, 'put'>;
export type UpdateSetResponse = ResponseOf<SongSetPath, 'put', 200>;

export type DeleteSetParams = PathParamsOf<SongSetPath, 'delete'>;

export async function listSets(params?: ListSetsParams) {
  const { data } = await apiClient.get<ListSetsResponse>('/song-sets', { params });
  return data;
}

export async function getSet(id: string) {
  const { data } = await apiClient.get<GetSetResponse>(`/song-sets/${id}`);
  return data;
}

export async function createSet(body: CreateSetBody) {
  const { data } = await apiClient.post<CreateSetResponse>('/song-sets', body);
  return data;
}

export async function updateSet(id: string, body: UpdateSetBody) {
  const { data } = await apiClient.put<UpdateSetResponse>(`/song-sets/${id}`, body);
  return data;
}

export async function deleteSet(id: string) {
  await apiClient.delete<void>(`/song-sets/${id}`);
}
