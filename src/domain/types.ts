export interface Deck {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  weight: number;
  correctCount: number;
  wrongCount: number;
  lastSeenAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export type CardStatus = 'new' | 'learning' | 'mastered';

export interface DeckStats {
  total: number;
  newCount: number;
  learningCount: number;
  masteredCount: number;
  masteredPercent: number;
}

export interface DeckExportV1 {
  schemaVersion: 1;
  exportedAt: number;
  deck: Omit<Deck, 'id'> & { id?: string };
  cards: Array<Omit<Card, 'id' | 'deckId'> & { id?: string }>;
}
