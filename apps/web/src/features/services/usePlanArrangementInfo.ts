import { useEffect, useRef, useState } from 'react';
import type { components } from '@/api/types';
import { getArrangement, getSong } from '@/api/songs';

export type ArrangementInfo = {
  songTitle: string;
  key?: string | null;
  bpm?: number | null;
  meter?: string | null;
};

type PlanItem = components['schemas']['ServicePlanItemResponse'];

type ArrangementInfoMap = Record<string, ArrangementInfo>;

export function usePlanArrangementInfo(planItems?: PlanItem[] | null) {
  const [infoMap, setInfoMap] = useState<ArrangementInfoMap>({});
  const inFlightRef = useRef(new Set<string>());

  useEffect(() => {
    if (!planItems || planItems.length === 0) return;

    const candidateIds = Array.from(
      new Set(
        planItems
          .filter((item) => item.type === 'song' && item.refId)
          .map((item) => item.refId!)
          .filter(Boolean),
      ),
    );

    const missing = candidateIds.filter(
      (arrangementId) => !infoMap[arrangementId] && !inFlightRef.current.has(arrangementId),
    );

    if (missing.length === 0) return;

    let cancelled = false;

    (async () => {
      for (const arrangementId of missing) {
        inFlightRef.current.add(arrangementId);
        try {
          const arrangement = await getArrangement(arrangementId);
          const songTitle = arrangement.songId ? (await getSong(arrangement.songId))?.title : undefined;

          if (!cancelled) {
            setInfoMap((prev) => {
              if (prev[arrangementId]) return prev;
              return {
                ...prev,
                [arrangementId]: {
                  songTitle: songTitle || 'Song',
                  key: arrangement.key,
                  bpm: arrangement.bpm,
                  meter: arrangement.meter,
                },
              };
            });
          }
        } catch {
          if (!cancelled) {
            setInfoMap((prev) => {
              if (prev[arrangementId]) return prev;
              return {
                ...prev,
                [arrangementId]: {
                  songTitle: 'Song',
                },
              };
            });
          }
        } finally {
          inFlightRef.current.delete(arrangementId);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [planItems, infoMap]);

  return infoMap;
}
