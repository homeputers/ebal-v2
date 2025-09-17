import { useMemo } from 'react';
import type { components } from '@/api/types';
import { useArrangementInfo } from '@/features/arrangements/useArrangementInfo';

type PlanItem = components['schemas']['ServicePlanItemResponse'];

export type { ArrangementInfo } from '@/features/arrangements/useArrangementInfo';

export function usePlanArrangementInfo(planItems?: PlanItem[] | null) {
  const arrangementIds = useMemo(() => {
    if (!planItems) return [] as string[];
    return planItems
      .filter((item) => item.type === 'song' && item.refId)
      .map((item) => item.refId!)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);
  }, [planItems]);

  return useArrangementInfo(arrangementIds);
}
