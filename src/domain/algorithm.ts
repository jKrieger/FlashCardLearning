import type { Card, CardStatus } from './types';

export const INITIAL_WEIGHT = 10;
export const MIN_WEIGHT = 1;
export const MAX_WEIGHT = 20;
export const MASTERED_WEIGHT_THRESHOLD = 2;
export const MASTERED_MIN_CORRECT = 3;
const RECENT_BUFFER = 2;

export function getCardStatus(card: Card): CardStatus {
  if (card.correctCount === 0 && card.wrongCount === 0) return 'new';
  if (card.correctCount >= MASTERED_MIN_CORRECT && card.weight <= MASTERED_WEIGHT_THRESHOLD) {
    return 'mastered';
  }
  return 'learning';
}

export function pickNextCard(cards: Card[], recentIds: string[] = []): Card | null {
  if (cards.length === 0) return null;

  const recent = new Set(recentIds.slice(-RECENT_BUFFER));
  let pool = cards.filter((c) => !recent.has(c.id));
  if (pool.length === 0) pool = cards;

  const total = pool.reduce((acc, c) => acc + Math.max(MIN_WEIGHT, c.weight), 0);
  if (total <= 0) return pool[Math.floor(Math.random() * pool.length)];

  let r = Math.random() * total;
  for (const card of pool) {
    r -= Math.max(MIN_WEIGHT, card.weight);
    if (r < 0) return card;
  }
  return pool[pool.length - 1];
}

export function applyAnswer(card: Card, correct: boolean): Card {
  const now = Date.now();
  if (correct) {
    return {
      ...card,
      weight: Math.max(MIN_WEIGHT, card.weight - 3),
      correctCount: card.correctCount + 1,
      lastSeenAt: now,
      updatedAt: now
    };
  }
  return {
    ...card,
    weight: Math.min(MAX_WEIGHT, card.weight + 5),
    wrongCount: card.wrongCount + 1,
    lastSeenAt: now,
    updatedAt: now
  };
}

export function newCardDefaults(): Pick<Card, 'weight' | 'correctCount' | 'wrongCount' | 'lastSeenAt'> {
  return {
    weight: INITIAL_WEIGHT,
    correctCount: 0,
    wrongCount: 0,
    lastSeenAt: null
  };
}
