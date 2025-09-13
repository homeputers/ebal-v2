import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listServices,
  createService,
  updateService,
  deleteService,
  type ListServicesParams,
} from '../../api/services';

export function useServicesList(params: ListServicesParams | undefined) {
  return useQuery({
    queryKey: ['services', params],
    queryFn: () => listServices(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createService,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateService>[1] }) =>
      updateService(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  });
}
