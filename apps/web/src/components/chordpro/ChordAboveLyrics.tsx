import { useMemo } from 'react';
import { transposeChordToken } from '../../lib/chordpro/parse';
import type { ChordProToken } from '../../lib/chordpro/types';

type Props = {
  tokens: ChordProToken[];
  transpose: number;
  useFlats?: boolean;
};

type BuiltLines = {
  chordLine: string;
  lyricLine: string;
};

function buildLines(tokens: ChordProToken[], transpose: number, useFlats?: boolean): BuiltLines {
  let chordLine = '';
  let lyricLine = '';
  let previousTokenWasChord = false;

  tokens.forEach((token) => {
    if (token.kind === 'lyric') {
      lyricLine += token.text;
      if (chordLine.length < lyricLine.length) {
        chordLine = chordLine.padEnd(lyricLine.length, ' ');
      }
      previousTokenWasChord = false;
      return;
    }

    if (chordLine.length < lyricLine.length) {
      chordLine = chordLine.padEnd(lyricLine.length, ' ');
    } else if (chordLine.length > lyricLine.length) {
      lyricLine = lyricLine.padEnd(chordLine.length, ' ');
    }

    if (previousTokenWasChord && chordLine.length > 0) {
      chordLine += ' ';
      lyricLine = lyricLine.padEnd(chordLine.length, ' ');
    }

    const transposed = transposeChordToken(token.text, transpose, useFlats);
    chordLine += transposed;
    previousTokenWasChord = transposed.trim().length > 0;
  });

  if (chordLine.length < lyricLine.length) {
    chordLine = chordLine.padEnd(lyricLine.length, ' ');
  } else if (lyricLine.length < chordLine.length) {
    lyricLine = lyricLine.padEnd(chordLine.length, ' ');
  }

  return {
    chordLine: chordLine.replace(/\s+$/, ''),
    lyricLine: lyricLine.replace(/\s+$/, ''),
  };
}

export function ChordAboveLyrics({ tokens, transpose, useFlats }: Props) {
  const { chordLine, lyricLine } = useMemo(
    () => buildLines(tokens, transpose, useFlats),
    [tokens, transpose, useFlats],
  );

  return (
    <div className="chordpro-line chordpro-line--stacked">
      <div className="chord-line">{chordLine || ' '}</div>
      <div className="lyric-line">{lyricLine || ' '}</div>
    </div>
  );
}
