import Dexie, { type Table } from 'dexie';
import type { Card, Deck } from '../domain/types';

class FlashcardsDb extends Dexie {
  decks!: Table<Deck, string>;
  cards!: Table<Card, string>;

  constructor() {
    super('flashcards-db');
    this.version(1).stores({
      decks: 'id, updatedAt',
      cards: 'id, deckId, weight, updatedAt'
    });
  }
}

export const db = new FlashcardsDb();
