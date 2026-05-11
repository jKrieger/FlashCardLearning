import { supabase } from './supabase';
import type { Card } from '../domain/types';
import { newCardDefaults } from '../domain/algorithm';

interface CardRow {
  id: string;
  deck_id: string;
  owner_id: string;
  front: string;
  back: string;
  weight: number;
  correct_count: number;
  wrong_count: number;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(r: CardRow): Card {
  return {
    id: r.id,
    deckId: r.deck_id,
    front: r.front,
    back: r.back,
    weight: r.weight,
    correctCount: r.correct_count,
    wrongCount: r.wrong_count,
    lastSeenAt: r.last_seen_at ? Date.parse(r.last_seen_at) : null,
    createdAt: Date.parse(r.created_at),
    updatedAt: Date.parse(r.updated_at)
  };
}

export async function apiListCardsByDeck(deckId: string): Promise<Card[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function apiListAllCards(): Promise<Card[]> {
  const { data, error } = await supabase.from('cards').select('*');
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function apiGetCard(id: string): Promise<Card | null> {
  const { data, error } = await supabase.from('cards').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

export async function apiCreateCard(input: {
  deckId: string;
  front: string;
  back: string;
}): Promise<Card> {
  const defaults = newCardDefaults();
  const { data, error } = await supabase
    .from('cards')
    .insert({
      deck_id: input.deckId,
      front: input.front,
      back: input.back,
      weight: defaults.weight,
      correct_count: defaults.correctCount,
      wrong_count: defaults.wrongCount,
      last_seen_at: defaults.lastSeenAt ? new Date(defaults.lastSeenAt).toISOString() : null
    })
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function apiUpdateCardContent(
  id: string,
  patch: { front: string; back: string }
): Promise<Card> {
  const { data, error } = await supabase
    .from('cards')
    .update({ front: patch.front, back: patch.back })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function apiSaveCard(card: Card): Promise<Card> {
  const { data, error } = await supabase
    .from('cards')
    .update({
      front: card.front,
      back: card.back,
      weight: card.weight,
      correct_count: card.correctCount,
      wrong_count: card.wrongCount,
      last_seen_at: card.lastSeenAt ? new Date(card.lastSeenAt).toISOString() : null
    })
    .eq('id', card.id)
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function apiDeleteCard(id: string): Promise<void> {
  const { error } = await supabase.from('cards').delete().eq('id', id);
  if (error) throw error;
}

export async function apiBulkInsertCards(
  cards: Array<{
    id?: string;
    deckId: string;
    front: string;
    back: string;
    weight: number;
    correctCount: number;
    wrongCount: number;
    lastSeenAt: number | null;
  }>
): Promise<Card[]> {
  if (cards.length === 0) return [];
  const rows = cards.map((c) => ({
    ...(c.id ? { id: c.id } : {}),
    deck_id: c.deckId,
    front: c.front,
    back: c.back,
    weight: c.weight,
    correct_count: c.correctCount,
    wrong_count: c.wrongCount,
    last_seen_at: c.lastSeenAt ? new Date(c.lastSeenAt).toISOString() : null
  }));
  const { data, error } = await supabase.from('cards').insert(rows).select();
  if (error) throw error;
  return (data ?? []).map(fromRow);
}
