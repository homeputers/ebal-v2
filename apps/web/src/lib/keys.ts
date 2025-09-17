import { transposeKey } from './transpose';

export function computeKeys(
  originalKey: string,
  transpose = 0,
  capo = 0,
  useFlats = false,
) {
  const originalDisplayKey = transposeKey(originalKey, 0, useFlats);
  const soundingKey = transposeKey(originalKey, transpose, useFlats);

  const shapeKey = capo > 0 ? transposeKey(soundingKey, -capo, useFlats) : soundingKey;

  const delta = transpose || 0;
  return { originalKey: originalDisplayKey, soundingKey, shapeKey, delta, capo };
}
