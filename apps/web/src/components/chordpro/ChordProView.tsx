import { useMemo } from 'react';
import { parseChordPro, transposeChordToken } from '../../lib/chordpro/parse';
import type { ChordProLineNode, ChordProNode } from '../../lib/chordpro/types';
import { ChordAboveLyrics } from './ChordAboveLyrics';

type Layout = 'inline' | 'above';

type Props = {
  source: string;
  transpose?: number;
  useFlats?: boolean;
  layout?: Layout;
  className?: string;
};

function renderInlineLine(
  line: ChordProLineNode,
  transpose: number,
  useFlats: boolean,
  lineIndex: number,
) {
  return (
    <div key={`line-${lineIndex}`} className="chordpro-line">
      {line.tokens.map((token, tokenIndex) => {
        if (token.kind === 'chord') {
          const transposed = transposeChordToken(token.text, transpose, useFlats);
          return (
            <span key={`line-${lineIndex}-token-${tokenIndex}`} className="chord">
              {transposed || ' '}
            </span>
          );
        }

        return (
          <span key={`line-${lineIndex}-token-${tokenIndex}`}>
            {token.text.length > 0 ? token.text : '​'}
          </span>
        );
      })}
    </div>
  );
}

function renderDirective(node: ChordProNode, index: number) {
  if (node.type !== 'directive') {
    return null;
  }

  const name = node.name.trim().toLowerCase();
  if (name === 'title') {
    return (
      <div key={`directive-${index}`} className="chordpro-title">
        {node.value}
      </div>
    );
  }

  if (name === 'comment') {
    return (
      <div key={`directive-${index}`} className="chordpro-comment">
        {node.value}
      </div>
    );
  }

  return null;
}

export function ChordProView({
  source,
  transpose = 0,
  useFlats = false,
  layout = 'above',
  className,
}: Props) {
  const parsed = useMemo(() => parseChordPro(source ?? ''), [source]);
  const containerClassName = ['chordpro-view', className].filter(Boolean).join(' ');

  return (
    <div className={containerClassName}>
      {parsed.map((node, index) => {
        if (node.type === 'empty') {
          return (
            <div key={`empty-${index}`} className="chordpro-line chordpro-line--empty">
              {' '}
            </div>
          );
        }

        if (node.type === 'directive') {
          return renderDirective(node, index);
        }

        if (layout === 'above') {
          return (
            <ChordAboveLyrics
              key={`line-${index}`}
              tokens={node.tokens}
              transpose={transpose}
              useFlats={useFlats}
            />
          );
        }

        return renderInlineLine(node, transpose, useFlats, index);
      })}
    </div>
  );
}
