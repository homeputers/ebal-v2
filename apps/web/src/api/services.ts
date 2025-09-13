import apiClient from './client';
import type { QueryOf, ResponseOf } from './type-helpers';

type ListServicesResponse = ResponseOf<'/services', 'get', 200>;
type ListServicesParams = QueryOf<'/services', 'get'>;
type GetServiceResponse = ResponseOf<'/services/{id}', 'get', 200>;

export async function listServices(params?: ListServicesParams) {
  const { data } = await apiClient.get<ListServicesResponse>('/services', { params });
  return data;
}

export async function getService(id: string) {
  const { data } = await apiClient.get<GetServiceResponse>(`/services/${id}`);
  return data;
}
