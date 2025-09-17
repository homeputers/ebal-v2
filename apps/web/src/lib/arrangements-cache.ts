/**
 * In-memory arrangement label cache. Not a global store; just a simple map.
 */
export type ArrangementLabel = {
  id: string;
  songId?: string;
  songTitle?: string;
  key?: string;
  bpm?: number | null;
  meter?: string | null;
};

const map = new Map<string, ArrangementLabel>();

export function getArrangementLabel(id: string) {
  return map.get(id);
}

export function setArrangementLabel(id: string, value: ArrangementLabel) {
  map.set(id, { ...value, id });
}

/** Optional: read-only snapshot for debug */
export function _dumpArrangementCache() {
  return Array.from(map.values());
}
