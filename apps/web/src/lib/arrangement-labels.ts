import type { TFunction } from 'i18next';

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
export function formatArrangementLine(t: TFunction<'arrangements'>, p: LabelPieces): string {
  const separator = t('labels.meta.separator', { defaultValue: ' • ' });
  const meta = compact<string>([
    p.key
      ? t('labels.meta.key', {
          key: p.key,
          defaultValue: `Key ${p.key}`,
        })
      : undefined,
    typeof p.bpm === 'number'
      ? t('labels.meta.bpm', {
          bpm: p.bpm,
          defaultValue: `${p.bpm} BPM`,
        })
      : undefined,
    p.meter
      ? t('labels.meta.meter', {
          meter: p.meter,
          defaultValue: p.meter,
        })
      : undefined,
  ]).join(separator);

  if (p.songTitle && meta)
    return t('labels.line.titleWithMeta', {
      title: p.songTitle,
      meta,
      defaultValue: `${p.songTitle} — ${meta}`,
    });
  if (p.songTitle)
    return t('labels.line.titleOnly', {
      title: p.songTitle,
      defaultValue: p.songTitle,
    });
  if (meta)
    return t('labels.line.metaOnly', {
      meta,
      defaultValue: meta,
    });
  return t('labels.generic', { defaultValue: 'Arrangement' });
}

/**
 * Renders a key transformation summary:
 *  - No transpose/capo: "Key G"
 *  - Transpose only:    "Key G → Ab (+1)"
 *  - Capo only:         "Key G, Capo 2 (shapes in F)"
 *  - Both:              "Key G → Ab (+1), Capo 4 (shapes in F)"
 */
export function formatKeyTransform(
  t: TFunction<'arrangements'>,
  opts: {
    originalKey: string;
    soundingKey: string; // after transpose
    shapeKey?: string;   // if capo > 0
    transpose?: number;  // semitones, may be 0
    capo?: number;       // fret number, 0 if none
  },
) {
  const { originalKey, soundingKey, shapeKey, transpose = 0, capo = 0 } = opts;

  const parts: string[] = [];
  if (transpose && originalKey !== soundingKey) {
    const sign = transpose > 0 ? `+${transpose}` : `${transpose}`;
    parts.push(
      t('labels.keyTransform.transpose', {
        original: originalKey,
        sounding: soundingKey,
        change: sign,
        defaultValue: `Key ${originalKey} → ${soundingKey} (${sign})`,
      }),
    );
  } else {
    parts.push(
      t('labels.keyTransform.base', {
        key: originalKey,
        defaultValue: `Key ${originalKey}`,
      }),
    );
  }

  if (capo > 0 && shapeKey) {
    parts.push(
      t('labels.keyTransform.capo', {
        capo,
        shape: shapeKey,
        defaultValue: `Capo ${capo} (shapes in ${shapeKey})`,
      }),
    );
  }

  const separator = t('labels.keyTransform.separator', { defaultValue: ', ' });
  return parts.join(separator);
}
