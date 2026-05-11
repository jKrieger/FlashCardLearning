import { db } from './database';
import type { Deck } from '../domain/types';
import {
  apiCreateDeck,
  apiDeleteDeck,
  apiGetDeck,
  apiListDecks,
  apiTouchDeck,
  apiUpdateDeck
} from '../api/decks';

function isOfflineError(err: unknown): boolean {
  if (!navigator.onLine) return true;
  if (err instanceof TypeError && /fetch/i.test(err.message)) return true;
  return false;
}

export async function listDecks(): Promise<Deck[]> {
  try {
    const decks = await apiListDecks();
    await db.transaction('rw', db.decks, async () => {
      await db.decks.clear();
      await db.decks.bulkPut(decks);
    });
    return decks;
  } catch (err) {
    if (isOfflineError(err)) {
      return db.decks.orderBy('updatedAt').reverse().toArray();
    }
    throw err;
  }
}

export async function getDeck(id: string): Promise<Deck | undefined> {
  try {
    const deck = await apiGetDeck(id);
    if (deck) await db.decks.put(deck);
    else await db.decks.delete(id);
    return deck ?? undefined;
  } catch (err) {
    if (isOfflineError(err)) {
      return db.decks.get(id);
    }
    throw err;
  }
}

export async function createDeck(input: { name: string; description?: string }): Promise<Deck> {
  const deck = await apiCreateDeck(input);
  await db.decks.put(deck);
  return deck;
}

export async function updateDeck(
  id: string,
  patch: Partial<Pick<Deck, 'name' | 'description'>>
): Promise<void> {
  const updated = await apiUpdateDeck(id, patch);
  await db.decks.put(updated);
}

export async function deleteDeck(id: string): Promise<void> {
  await apiDeleteDeck(id);
  await db.transaction('rw', db.decks, db.cards, async () => {
    await db.cards.where('deckId').equals(id).delete();
    await db.decks.delete(id);
  });
}

export async function touchDeck(id: string): Promise<void> {
  try {
    await apiTouchDeck(id);
    const fresh = await apiGetDeck(id);
    if (fresh) await db.decks.put(fresh);
  } catch (err) {
    if (!isOfflineError(err)) throw err;
  }
}
