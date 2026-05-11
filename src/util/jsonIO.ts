import { db } from '../db/database';
import { createDeck } from '../db/decks';
import { bulkInsertCards } from '../db/cards';
import type { Card, Deck, DeckExportV1 } from '../domain/types';
import { newId } from './id';
import { newCardDefaults } from '../domain/algorithm';

export async function exportDeck(deckId: string): Promise<{ filename: string; blob: Blob }> {
  const deck = await db.decks.get(deckId);
  if (!deck) throw new Error('Deck not found');
  const cards = await db.cards.where('deckId').equals(deckId).toArray();

  const payload: DeckExportV1 = {
    schemaVersion: 1,
    exportedAt: Date.now(),
    deck: {
      name: deck.name,
      description: deck.description,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt
    },
    cards: cards.map(({ id: _id, deckId: _deckId, ...rest }) => rest)
  };

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const safeName = deck.name.replace(/[^a-z0-9\-_]+/gi, '_').slice(0, 40) || 'deck';
  return { filename: `${safeName}.json`, blob };
}

export function triggerDownload(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function importDeckFromFile(file: File): Promise<Deck> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Datei ist kein gültiges JSON.');
  }
  if (!isExportV1(parsed)) {
    throw new Error('Unbekanntes Export-Format (erwarte schemaVersion: 1).');
  }

  const deck = await createDeck({
    name: parsed.deck.name,
    description: parsed.deck.description
  });

  const now = Date.now();
  const cards: Card[] = parsed.cards.map((c) => ({
    id: newId(),
    deckId: deck.id,
    front: String(c.front ?? ''),
    back: String(c.back ?? ''),
    weight: typeof c.weight === 'number' ? c.weight : newCardDefaults().weight,
    correctCount: typeof c.correctCount === 'number' ? c.correctCount : 0,
    wrongCount: typeof c.wrongCount === 'number' ? c.wrongCount : 0,
    lastSeenAt: typeof c.lastSeenAt === 'number' ? c.lastSeenAt : null,
    createdAt: typeof c.createdAt === 'number' ? c.createdAt : now,
    updatedAt: now
  }));

  await bulkInsertCards(cards);
  return deck;
}

function isExportV1(value: unknown): value is DeckExportV1 {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (v.schemaVersion !== 1) return false;
  if (!v.deck || typeof v.deck !== 'object') return false;
  const deck = v.deck as Record<string, unknown>;
  if (typeof deck.name !== 'string') return false;
  if (!Array.isArray(v.cards)) return false;
  return true;
}
