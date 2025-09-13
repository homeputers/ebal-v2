import apiClient from './client';
import type { paths } from './types';
import {
  QueryOf,
  ResponseOf,
  PathParamsOf,
  RequestBodyOf,
} from './type-helpers';

// Path literals for clarity (must match your OpenAPI spec)
type ServicesPath = keyof paths & '/services';
type ServicePath = keyof paths & '/services/{id}';

// Types
export type ListServicesParams = QueryOf<ServicesPath, 'get'>;
export type ListServicesResponse = ResponseOf<ServicesPath, 'get', 200>;

export type GetServiceParams = PathParamsOf<ServicePath, 'get'>;
export type GetServiceResponse = ResponseOf<ServicePath, 'get', 200>;

export type CreateServiceBody = RequestBodyOf<ServicesPath, 'post'>;
export type CreateServiceResponse = ResponseOf<ServicesPath, 'post', 201>;

export type UpdateServiceParams = PathParamsOf<ServicePath, 'put'>;
export type UpdateServiceBody = RequestBodyOf<ServicePath, 'put'>;
export type UpdateServiceResponse = ResponseOf<ServicePath, 'put', 200>;

export type DeleteServiceParams = PathParamsOf<ServicePath, 'delete'>;

export async function listServices(params?: ListServicesParams) {
  const { data } = await apiClient.get<ListServicesResponse>('/services', { params });
  return data;
}

export async function getService(id: string) {
  const { data } = await apiClient.get<GetServiceResponse>(`/services/${id}`);
  return data;
}

export async function createService(body: CreateServiceBody) {
  const { data } = await apiClient.post<CreateServiceResponse>('/services', body);
  return data;
}

export async function updateService(id: string, body: UpdateServiceBody) {
  const { data } = await apiClient.put<UpdateServiceResponse>(`/services/${id}`, body);
  return data;
}

export async function deleteService(id: string) {
  await apiClient.delete<void>(`/services/${id}`);
}
