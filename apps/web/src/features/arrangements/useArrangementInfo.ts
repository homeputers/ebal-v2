import { useEffect, useMemo, useRef, useState } from 'react';
import { getArrangement, getSong } from '@/api/songs';

export type ArrangementInfo = {
  songTitle: string;
  key?: string | null;
  bpm?: number | null;
  meter?: string | null;
};

type ArrangementInfoMap = Record<string, ArrangementInfo>;

type ArrangementIdInput = Array<string | null | undefined> | undefined;

export function useArrangementInfo(arrangementIds: ArrangementIdInput) {
  const [infoMap, setInfoMap] = useState<ArrangementInfoMap>({});
  const inFlightRef = useRef(new Set<string>());

  const normalizedIds = useMemo(() => {
    if (!arrangementIds) return [] as string[];
    return Array.from(
      new Set(
        arrangementIds.filter((id): id is string => typeof id === 'string' && id.length > 0),
      ),
    );
  }, [arrangementIds]);

  useEffect(() => {
    if (normalizedIds.length === 0) return;

    const missing = normalizedIds.filter(
      (id) => !infoMap[id] && !inFlightRef.current.has(id),
    );

    if (missing.length === 0) return;

    let cancelled = false;

    (async () => {
      for (const arrangementId of missing) {
        inFlightRef.current.add(arrangementId);
        try {
          const arrangement = await getArrangement(arrangementId);
          const songTitle =
            arrangement?.songId && arrangement.songId.length > 0
              ? (await getSong(arrangement.songId))?.title
              : undefined;

          if (!cancelled) {
            setInfoMap((prev) => {
              if (prev[arrangementId]) return prev;
              return {
                ...prev,
                [arrangementId]: {
                  songTitle: songTitle || 'Song',
                  key: arrangement?.key,
                  bpm: arrangement?.bpm,
                  meter: arrangement?.meter,
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
  }, [normalizedIds, infoMap]);

  return infoMap;
}
