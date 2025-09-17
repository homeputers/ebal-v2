const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const NOTE_TO_INDEX: Record<string, number> = {
  C: 0,
  'B#': 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  F: 5,
  'E#': 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
  Cb: 11,
};

const NOTE_REGEX = /^([A-Ga-g][#b]?)(.*)$/;

function normalizeNoteName(note: string): string {
  if (!note) {
    return note;
  }

  const letter = note.charAt(0).toUpperCase();
  const accidental = note.charAt(1);
  if (accidental === '#' || accidental === 'b' || accidental === 'B') {
    return `${letter}${accidental === 'B' ? 'b' : accidental}`;
  }
  return letter;
}

function resolveUseFlats(preference: boolean | undefined, note: string): boolean {
  if (typeof preference === 'boolean') {
    return preference;
  }
  return note.includes('b') || note.includes('B');
}

function transposeNote(note: string, semitones: number, useFlats?: boolean): string {
  const normalized = normalizeNoteName(note);
  const index = NOTE_TO_INDEX[normalized];

  if (typeof index !== 'number') {
    return note;
  }

  const newIndex = ((index + semitones) % 12 + 12) % 12;
  const scale = resolveUseFlats(useFlats, note) ? NOTES_FLAT : NOTES_SHARP;
  return scale[newIndex];
}

function transposeChordPart(part: string, semitones: number, useFlats?: boolean): string {
  const match = part.match(NOTE_REGEX);
  if (!match) {
    return part;
  }

  const [rawRoot, suffix] = match.slice(1, 3);
  const normalizedRoot = normalizeNoteName(rawRoot);
  const preferFlats = resolveUseFlats(useFlats, rawRoot);
  const transposed = transposeNote(normalizedRoot, semitones, preferFlats);
  return `${transposed}${suffix}`;
}

export function transposeChord(chord: string, semitones: number, useFlats?: boolean): string {
  if (!chord) {
    return chord;
  }

  return chord
    .split('/')
    .map((part) => transposeChordPart(part, semitones, useFlats))
    .join('/');
}

export function transposeKey(key: string, semitones: number, useFlats?: boolean): string {
  if (!key) {
    return key;
  }

  const match = key.match(NOTE_REGEX);
  if (!match) {
    return transposeChord(key, semitones, useFlats);
  }

  const [rawRoot, suffix] = match.slice(1, 3);
  const normalizedRoot = normalizeNoteName(rawRoot);
  const preferFlats = resolveUseFlats(useFlats, rawRoot);
  const transposed = transposeNote(normalizedRoot, semitones, preferFlats);
  return `${transposed}${suffix}`;
}
