import apiClient from './client';
import type { paths } from './types';
import { PathParamsOf, ResponseOf } from './type-helpers';

// API path literals derived from the generated OpenAPI types
// TODO: replace with dedicated /arrangements/{id} endpoint when backend adds it.
type ArrangementByIdPath = keyof paths & '/songs/arrangements/{arrangementId}';
type SongByIdPath = keyof paths & '/songs/{id}';
type SongArrangementsPath = keyof paths & '/songs/{id}/arrangements';

export type ArrangementResponse = ResponseOf<ArrangementByIdPath, 'get', 200>;
export type ArrangementSummary = Pick<ArrangementResponse, 'id' | 'songId' | 'key' | 'bpm' | 'meter'>;

export type SongResponse = ResponseOf<SongByIdPath, 'get', 200>;
export type SongSummary = Pick<SongResponse, 'id' | 'title'>;

export type ListSongArrangementsResponse = ResponseOf<SongArrangementsPath, 'get', 200>;
export type ListSongArrangementsParams = PathParamsOf<SongArrangementsPath, 'get'>;

export async function getArrangementById(id: string): Promise<ArrangementSummary | undefined> {
  const { data } = await apiClient.get<ArrangementResponse>(`/songs/arrangements/${id}`);
  if (!data) return undefined;

  return {
    id: data.id ?? id,
    songId: data.songId,
    key: data.key,
    bpm: data.bpm,
    meter: data.meter,
  };
}

export async function listSongArrangements(params: ListSongArrangementsParams) {
  const { id } = params;
  const { data } = await apiClient.get<ListSongArrangementsResponse>(`/songs/${id}/arrangements`);
  return data;
}

export async function getSongById(id: string): Promise<SongSummary | undefined> {
  const { data } = await apiClient.get<SongResponse>(`/songs/${id}`);
  if (!data) return undefined;

  return {
    id: data.id ?? id,
    title: data.title,
  };
}
