import { db } from './database';
import type { Card } from '../domain/types';
import {
  apiBulkInsertCards,
  apiCreateCard,
  apiDeleteCard,
  apiGetCard,
  apiListCardsByDeck,
  apiSaveCard,
  apiUpdateCardContent
} from '../api/cards';

function isOfflineError(err: unknown): boolean {
  if (!navigator.onLine) return true;
  if (err instanceof TypeError && /fetch/i.test(err.message)) return true;
  return false;
}

export async function listCards(deckId: string): Promise<Card[]> {
  try {
    const cards = await apiListCardsByDeck(deckId);
    await db.transaction('rw', db.cards, async () => {
      await db.cards.where('deckId').equals(deckId).delete();
      if (cards.length > 0) await db.cards.bulkPut(cards);
    });
    return cards;
  } catch (err) {
    if (isOfflineError(err)) {
      return db.cards.where('deckId').equals(deckId).toArray();
    }
    throw err;
  }
}

export async function getCard(id: string): Promise<Card | undefined> {
  try {
    const card = await apiGetCard(id);
    if (card) await db.cards.put(card);
    else await db.cards.delete(id);
    return card ?? undefined;
  } catch (err) {
    if (isOfflineError(err)) {
      return db.cards.get(id);
    }
    throw err;
  }
}

export async function createCard(input: {
  deckId: string;
  front: string;
  back: string;
}): Promise<Card> {
  const card = await apiCreateCard(input);
  await db.cards.put(card);
  return card;
}

export async function updateCardContent(
  id: string,
  patch: { front: string; back: string }
): Promise<void> {
  const updated = await apiUpdateCardContent(id, patch);
  await db.cards.put(updated);
}

export async function saveCard(card: Card): Promise<void> {
  const saved = await apiSaveCard(card);
  await db.cards.put(saved);
}

export async function deleteCard(id: string): Promise<void> {
  await apiDeleteCard(id);
  await db.cards.delete(id);
}

export async function bulkInsertCards(cards: Card[]): Promise<void> {
  if (cards.length === 0) return;
  const inserted = await apiBulkInsertCards(
    cards.map((c) => ({
      id: c.id,
      deckId: c.deckId,
      front: c.front,
      back: c.back,
      weight: c.weight,
      correctCount: c.correctCount,
      wrongCount: c.wrongCount,
      lastSeenAt: c.lastSeenAt
    }))
  );
  await db.cards.bulkPut(inserted);
}
