import type { paths } from './types';
import apiClient from './client';

type ListServicesResponse = paths['/services']['get']['responses']['200']['content']['application/json'];
type ListServicesParams = paths['/services']['get']['parameters']['query'];
type GetServiceResponse = paths['/services/{id}']['get']['responses']['200']['content']['application/json'];

export async function listServices(params?: ListServicesParams) {
  const { data } = await apiClient.get<ListServicesResponse>('/services', { params });
  return data;
}

export async function getService(id: string) {
  const { data } = await apiClient.get<GetServiceResponse>(`/services/${id}`);
  return data;
}
