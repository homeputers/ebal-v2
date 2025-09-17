export type ChordProToken = {
  kind: 'chord' | 'lyric';
  text: string;
};

export type ChordProLineNode = {
  type: 'line';
  tokens: ChordProToken[];
};

export type ChordProDirectiveNode = {
  type: 'directive';
  name: string;
  value?: string;
};

export type ChordProEmptyNode = {
  type: 'empty';
};

export type ChordProNode =
  | ChordProLineNode
  | ChordProDirectiveNode
  | ChordProEmptyNode;

export type ParsedChordPro = ChordProNode[];
