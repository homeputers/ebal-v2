export type LabelPieces = {
  songTitle?: string;
  key?: string | null;
  bpm?: number | null;
  meter?: string | null;
};

function compact<T>(xs: (T | undefined | null | false)[]) {
  return xs.filter(Boolean) as T[];
}

/**
 * Renders a one-line label like:
 *   "Song Title — Key G • 72 BPM • 4/4"
 * Falls back gracefully if pieces are missing.
 */
export function formatArrangementLine(p: LabelPieces): string {
  const meta = compact<string>([
    p.key ? `Key ${p.key}` : undefined,
    typeof p.bpm === 'number' ? `${p.bpm} BPM` : undefined,
    p.meter || undefined,
  ]).join(' • ');

  if (p.songTitle && meta) return `${p.songTitle} — ${meta}`;
  if (p.songTitle) return p.songTitle;
  if (meta) return meta;
  return 'Arrangement';
}

/**
 * Renders a key transformation summary:
 *  - No transpose/capo: "Key G"
 *  - Transpose only:    "Key G → Ab (+1)"
 *  - Capo only:         "Key G, Capo 2 (shapes in F)"
 *  - Both:              "Key G → Ab (+1), Capo 4 (shapes in F)"
 */
export function formatKeyTransform(opts: {
  originalKey: string;
  soundingKey: string; // after transpose
  shapeKey?: string;   // if capo > 0
  transpose?: number;  // semitones, may be 0
  capo?: number;       // fret number, 0 if none
}) {
  const { originalKey, soundingKey, shapeKey, transpose = 0, capo = 0 } = opts;

  const parts: string[] = [];
  if (transpose && originalKey !== soundingKey) {
    const sign = transpose > 0 ? `+${transpose}` : `${transpose}`;
    parts.push(`Key ${originalKey} → ${soundingKey} (${sign})`);
  } else {
    parts.push(`Key ${originalKey}`);
  }

  if (capo > 0 && shapeKey) {
    parts.push(`Capo ${capo} (shapes in ${shapeKey})`);
  }

  return parts.join(', ');
}
