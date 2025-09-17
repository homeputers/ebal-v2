import { transposeChord } from '../transpose';
import type {
  ChordProDirectiveNode,
  ChordProLineNode,
  ChordProToken,
  ParsedChordPro,
} from './types';

const CHORD_REGEX = /\[([^\]]+)\]/g;

function tokenizeLine(line: string): ChordProToken[] {
  const tokens: ChordProToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(CHORD_REGEX);

  while ((match = regex.exec(line)) !== null) {
    const [fullMatch, chord] = match;
    const preceding = line.slice(lastIndex, match.index);
    if (preceding) {
      tokens.push({ kind: 'lyric', text: preceding });
    }
    tokens.push({ kind: 'chord', text: chord });
    lastIndex = match.index + fullMatch.length;
  }

  const rest = line.slice(lastIndex);
  if (rest) {
    tokens.push({ kind: 'lyric', text: rest });
  }

  if (tokens.length === 0) {
    tokens.push({ kind: 'lyric', text: line });
  }

  return tokens;
}

function parseDirective(line: string): ChordProDirectiveNode | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
    return null;
  }

  const body = trimmed.slice(1, -1).trim();
  if (!body) {
    return { type: 'directive', name: '' };
  }

  const colonIndex = body.indexOf(':');
  if (colonIndex === -1) {
    return { type: 'directive', name: body };
  }

  const name = body.slice(0, colonIndex).trim();
  const value = body.slice(colonIndex + 1).trim();
  return {
    type: 'directive',
    name,
    value,
  };
}

export function parseChordPro(input: string): ParsedChordPro {
  const normalized = input.replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n');
  const result: ParsedChordPro = [];

  for (const line of lines) {
    if (line.length === 0) {
      result.push({ type: 'empty' });
      continue;
    }

    const directive = parseDirective(line);
    if (directive) {
      result.push(directive);
      continue;
    }

    const tokens = tokenizeLine(line);
    const lineNode: ChordProLineNode = {
      type: 'line',
      tokens,
    };
    result.push(lineNode);
  }

  return result;
}

export function transposeChordToken(
  chord: string,
  semitones: number,
  useFlats?: boolean,
): string {
  if (!chord) {
    return chord;
  }

  const leadingWhitespaceMatch = chord.match(/^\s*/);
  const trailingWhitespaceMatch = chord.match(/\s*$/);
  const leadingWhitespace = leadingWhitespaceMatch ? leadingWhitespaceMatch[0] : '';
  const trailingWhitespace = trailingWhitespaceMatch ? trailingWhitespaceMatch[0] : '';
  const core = chord.trim();

  if (!core) {
    return chord;
  }

  const transposed = transposeChord(core, semitones, useFlats);
  return `${leadingWhitespace}${transposed}${trailingWhitespace}`;
}
