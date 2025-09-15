import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
  listPlanItems,
  addPlanItem,
  updatePlanItem,
  removePlanItem,
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

export function useService(id: string | undefined) {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => getService(id!),
    enabled: !!id,
  });
}

export function usePlanItems(serviceId: string | undefined) {
  return useQuery({
    queryKey: ['servicePlan', serviceId],
    queryFn: () => listPlanItems(serviceId!),
    enabled: !!serviceId,
  });
}

export function useAddPlanItem(serviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof addPlanItem>[1]) => addPlanItem(serviceId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['servicePlan', serviceId] }),
  });
}

export function useUpdatePlanItem(serviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updatePlanItem>[1] }) =>
      updatePlanItem(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['servicePlan', serviceId] }),
  });
}

export function useRemovePlanItem(serviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removePlanItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['servicePlan', serviceId] }),
  });
}
