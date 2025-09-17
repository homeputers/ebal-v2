import { useMemo } from 'react';
import type { components } from '@/api/types';
import { useArrangementLabels } from '@/hooks/useArrangementLabels';

type PlanItem = components['schemas']['ServicePlanItemResponse'];

export type { ArrangementLabel } from '@/lib/arrangements-cache';

export function usePlanArrangementInfo(planItems?: PlanItem[] | null) {
  const arrangementIds = useMemo(() => {
    if (!planItems) return [] as Array<string | null | undefined>;
    return planItems.map((item) => (item.type === 'song' ? item.refId ?? null : null));
  }, [planItems]);

  return useArrangementLabels(arrangementIds);
}
