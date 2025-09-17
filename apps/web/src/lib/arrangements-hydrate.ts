import { getArrangementLabel, setArrangementLabel, type ArrangementLabel } from './arrangements-cache';
import { getArrangementById, getSongById } from '@/api/arrangements';

/**
 * Ensure the cache has labels for the given arrangementIds.
 * - Loads only missing ids.
 * - Optionally enriches with songTitle.
 */
export async function ensureArrangementLabels(ids: Array<string | null | undefined>) {
  const unique = Array.from(new Set(ids.filter((id): id is string => typeof id === 'string' && id.length > 0)));
  const missing = unique.filter((id) => !getArrangementLabel(id));

  for (const id of missing) {
    try {
      const arr = await getArrangementById(id);
      if (!arr) continue;

      let songTitle: string | undefined = undefined;

      const arrWithTitle = arr as typeof arr & { songTitle?: string | null };
      if (arrWithTitle.songTitle) {
        songTitle = arrWithTitle.songTitle;
      } else if (arr.songId) {
        try {
          const song = await getSongById(arr.songId);
          songTitle = song?.title;
        } catch {
          // ignore song fetch errors; fallback handled below
        }
      }

      const label: ArrangementLabel = {
        id,
        songId: arr.songId,
        songTitle,
        key: arr.key ?? undefined,
        bpm: arr.bpm ?? null,
        meter: arr.meter ?? null,
      };

      setArrangementLabel(id, label);
    } catch {
      // leave missing; UI can show fallback "Arrangement {id}"
    }
  }
}

/** Convenience getter for rendering */
export function getArrangementDisplay(id: string) {
  const a = getArrangementLabel(id);
  if (!a) return `Arrangement ${id}`;
  const pieces = [
    a.songTitle,
    a.key ? `Key ${a.key}` : undefined,
    a.bpm != null ? `${a.bpm} BPM` : undefined,
    a.meter ?? undefined,
  ].filter(Boolean);
  return pieces.join(' • ') || `Arrangement ${id}`;
}
