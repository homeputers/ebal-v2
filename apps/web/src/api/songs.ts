import apiClient from './client';
import type { paths } from './types';
import {
  QueryOf,
  ResponseOf,
  PathParamsOf,
  RequestBodyOf,
} from './type-helpers';

// Path literals for clarity (must match your OpenAPI spec)
type SongsPath = keyof paths & '/songs';
type SongPath = keyof paths & '/songs/{id}';

// Types
export type ListSongsParams = QueryOf<SongsPath, 'get'>;
export type ListSongsResponse = ResponseOf<SongsPath, 'get', 200>;

export type GetSongParams = PathParamsOf<SongPath, 'get'>;
export type GetSongResponse = ResponseOf<SongPath, 'get', 200>;

export type CreateSongBody = RequestBodyOf<SongsPath, 'post'>;
export type CreateSongResponse = ResponseOf<SongsPath, 'post', 201>;

export type UpdateSongParams = PathParamsOf<SongPath, 'put'>;
export type UpdateSongBody = RequestBodyOf<SongPath, 'put'>;
export type UpdateSongResponse = ResponseOf<SongPath, 'put', 200>;

export type DeleteSongParams = PathParamsOf<SongPath, 'delete'>;

export async function listSongs(params?: ListSongsParams) {
  const { data } = await apiClient.get<ListSongsResponse>('/songs', { params });
  return data;
}

export async function getSong(id: string) {
  const { data } = await apiClient.get<GetSongResponse>(`/songs/${id}`);
  return data;
}

export async function createSong(body: CreateSongBody) {
  const { data } = await apiClient.post<CreateSongResponse>('/songs', body);
  return data;
}

export async function updateSong(id: string, body: UpdateSongBody) {
  const { data } = await apiClient.put<UpdateSongResponse>(`/songs/${id}`, body);
  return data;
}

export async function deleteSong(id: string) {
  await apiClient.delete<void>(`/songs/${id}`);
}
