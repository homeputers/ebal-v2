const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

function transposeNote(note: string, steps: number, useFlats: boolean): string {
  const indexSharp = NOTES_SHARP.indexOf(note);
  const indexFlat = NOTES_FLAT.indexOf(note);
  let index = indexSharp !== -1 ? indexSharp : indexFlat;
  if (index === -1) return note;
  const newIndex = (index + steps + 12) % 12;
  return useFlats ? NOTES_FLAT[newIndex] : NOTES_SHARP[newIndex];
}

function transposeChord(chord: string, steps: number, useFlats: boolean): string {
  const parts = chord.split('/');
  return parts
    .map((part) => {
      const m = part.match(/^([A-G][b#]?)(.*)$/);
      if (!m) return part;
      const [, root, rest] = m;
      return transposeNote(root, steps, useFlats) + rest;
    })
    .join('/');
}

export function transposeChordPro(
  content: string,
  steps: number,
  useFlats: boolean,
): string {
  return content.replace(/\[([^\]]+)\]/g, (_, chord) => {
    return `[${transposeChord(chord, steps, useFlats)}]`;
  });
}

export { transposeNote, transposeChord };
