import { db } from './database';
import type { Deck } from '../domain/types';
import { newId } from '../util/id';

export async function listDecks(): Promise<Deck[]> {
  return db.decks.orderBy('updatedAt').reverse().toArray();
}

export async function getDeck(id: string): Promise<Deck | undefined> {
  return db.decks.get(id);
}

export async function createDeck(input: { name: string; description?: string }): Promise<Deck> {
  const now = Date.now();
  const deck: Deck = {
    id: newId(),
    name: input.name.trim(),
    description: input.description?.trim() || undefined,
    createdAt: now,
    updatedAt: now
  };
  await db.decks.add(deck);
  return deck;
}

export async function updateDeck(
  id: string,
  patch: Partial<Pick<Deck, 'name' | 'description'>>
): Promise<void> {
  await db.decks.update(id, { ...patch, updatedAt: Date.now() });
}

export async function deleteDeck(id: string): Promise<void> {
  await db.transaction('rw', db.decks, db.cards, async () => {
    await db.cards.where('deckId').equals(id).delete();
    await db.decks.delete(id);
  });
}

export async function touchDeck(id: string): Promise<void> {
  await db.decks.update(id, { updatedAt: Date.now() });
}
