import type { Card, DeckStats } from './types';
import { getCardStatus } from './algorithm';

export function computeDeckStats(cards: Card[]): DeckStats {
  const total = cards.length;
  let newCount = 0;
  let learningCount = 0;
  let masteredCount = 0;

  for (const card of cards) {
    const status = getCardStatus(card);
    if (status === 'new') newCount++;
    else if (status === 'learning') learningCount++;
    else masteredCount++;
  }

  const masteredPercent = total === 0 ? 0 : Math.round((masteredCount / total) * 100);

  return { total, newCount, learningCount, masteredCount, masteredPercent };
}
