import { db } from './database';
import type { Card } from '../domain/types';
import { newId } from '../util/id';
import { newCardDefaults } from '../domain/algorithm';

export async function listCards(deckId: string): Promise<Card[]> {
  return db.cards.where('deckId').equals(deckId).toArray();
}

export async function getCard(id: string): Promise<Card | undefined> {
  return db.cards.get(id);
}

export async function createCard(input: { deckId: string; front: string; back: string }): Promise<Card> {
  const now = Date.now();
  const card: Card = {
    id: newId(),
    deckId: input.deckId,
    front: input.front,
    back: input.back,
    ...newCardDefaults(),
    createdAt: now,
    updatedAt: now
  };
  await db.cards.add(card);
  return card;
}

export async function updateCardContent(
  id: string,
  patch: { front: string; back: string }
): Promise<void> {
  await db.cards.update(id, { ...patch, updatedAt: Date.now() });
}

export async function saveCard(card: Card): Promise<void> {
  await db.cards.put(card);
}

export async function deleteCard(id: string): Promise<void> {
  await db.cards.delete(id);
}

export async function bulkInsertCards(cards: Card[]): Promise<void> {
  await db.cards.bulkAdd(cards);
}
