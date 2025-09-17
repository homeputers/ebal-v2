import apiClient from './client';
import type { paths } from './types';
import {
  PathParamsOf,
  QueryOf,
  RequestBodyOf,
  ResponseOf,
} from './type-helpers';

// Path literals for clarity (must match your OpenAPI spec)
type SongSetsPath = keyof paths & '/song-sets';
type SongSetPath = keyof paths & '/song-sets/{id}';
type SongSetItemsPath = keyof paths & '/song-sets/{id}/items';
type SongSetItemPath = keyof paths & '/song-set-items/{id}';

// Song set types
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

// Song set item types
export type ListSetItemsParams = PathParamsOf<SongSetItemsPath, 'get'>;
export type ListSetItemsResponse = ResponseOf<SongSetItemsPath, 'get', 200>;

export type AddSetItemParams = PathParamsOf<SongSetItemsPath, 'post'>;
export type AddSetItemBody = RequestBodyOf<SongSetItemsPath, 'post'>;
export type AddSetItemResponse = ResponseOf<SongSetItemsPath, 'post', 201>;

export type UpdateSetItemParams = PathParamsOf<SongSetItemPath, 'put'>;
export type UpdateSetItemBody = RequestBodyOf<SongSetItemPath, 'put'>;
export type UpdateSetItemResponse = ResponseOf<SongSetItemPath, 'put', 200>;

export type RemoveSetItemParams = PathParamsOf<SongSetItemPath, 'delete'>;

type SetId = GetSetParams['id'];
type SetItemId = UpdateSetItemParams['id'];

export async function listSets(params?: ListSetsParams) {
  const { data } = await apiClient.get<ListSetsResponse>('/song-sets', { params });
  return data;
}

export async function getSet(id: SetId) {
  const { data } = await apiClient.get<GetSetResponse>(`/song-sets/${id}`);
  return data;
}

export async function createSet(body: CreateSetBody) {
  const { data } = await apiClient.post<CreateSetResponse>('/song-sets', body);
  return data;
}

export async function updateSet(id: SetId, body: UpdateSetBody) {
  const { data } = await apiClient.put<UpdateSetResponse>(`/song-sets/${id}`, body);
  return data;
}

export async function deleteSet(id: SetId) {
  await apiClient.delete<void>(`/song-sets/${id}`);
}

export async function listSetItems(setId: SetId) {
  const { data } = await apiClient.get<ListSetItemsResponse>(
    `/song-sets/${setId}/items`,
  );
  return data;
}

export async function addSetItem(setId: SetId, body: AddSetItemBody) {
  const { data } = await apiClient.post<AddSetItemResponse>(
    `/song-sets/${setId}/items`,
    body,
  );
  return data;
}

export async function updateSetItem(itemId: SetItemId, body: UpdateSetItemBody) {
  const { data } = await apiClient.put<UpdateSetItemResponse>(
    `/song-set-items/${itemId}`,
    body,
  );
  return data;
}

export async function removeSetItem(itemId: SetItemId) {
  await apiClient.delete<void>(`/song-set-items/${itemId}`);
}
