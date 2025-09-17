import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ensureArrangementLabels } from '@/lib/arrangements-hydrate';
import { getArrangementLabel, type ArrangementLabel } from '@/lib/arrangements-cache';

type ArrangementLabelMap = Record<string, ArrangementLabel | undefined>;

type ArrangementIdInput = Array<string | null | undefined> | undefined;

/**
 * Ensure labels for the given arrangementIds.
 * Exposes a map of id -> label (undefined while loading).
 */
export function useArrangementLabels(ids: ArrangementIdInput) {
  const normalized = useMemo(() => {
    const list = (ids ?? []).filter((id): id is string => typeof id === 'string' && id.length > 0);
    const unique = Array.from(new Set(list));
    unique.sort();
    return unique;
  }, [ids]);

  const snapshot = useMemo(() => {
    return normalized.reduce((acc, id) => {
      acc[id] = getArrangementLabel(id);
      return acc;
    }, {} as ArrangementLabelMap);
  }, [normalized]);

  return useQuery({
    queryKey: ['arrangementLabels', ...normalized],
    queryFn: async () => {
      if (normalized.length === 0) {
        return {} as ArrangementLabelMap;
      }
      await ensureArrangementLabels(normalized);
      return normalized.reduce((acc, id) => {
        acc[id] = getArrangementLabel(id);
        return acc;
      }, {} as ArrangementLabelMap);
    },
    enabled: normalized.length > 0,
    staleTime: 5 * 60 * 1000,
    initialData: () => (normalized.length === 0 ? ({} as ArrangementLabelMap) : undefined),
    placeholderData: () => snapshot,
  });
}
