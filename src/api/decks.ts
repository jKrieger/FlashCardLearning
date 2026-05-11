import { supabase } from './supabase';
import type { Deck } from '../domain/types';

interface DeckRow {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(r: DeckRow): Deck {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? undefined,
    createdAt: Date.parse(r.created_at),
    updatedAt: Date.parse(r.updated_at)
  };
}

export async function apiListDecks(): Promise<Deck[]> {
  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function apiGetDeck(id: string): Promise<Deck | null> {
  const { data, error } = await supabase.from('decks').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

export async function apiCreateDeck(input: { name: string; description?: string }): Promise<Deck> {
  const { data, error } = await supabase
    .from('decks')
    .insert({ name: input.name.trim(), description: input.description?.trim() || null })
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function apiUpdateDeck(
  id: string,
  patch: { name?: string; description?: string }
): Promise<Deck> {
  const payload: Record<string, unknown> = {};
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.description !== undefined) payload.description = patch.description || null;
  const { data, error } = await supabase
    .from('decks')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function apiDeleteDeck(id: string): Promise<void> {
  const { error } = await supabase.from('decks').delete().eq('id', id);
  if (error) throw error;
}

export async function apiTouchDeck(id: string): Promise<void> {
  const { error } = await supabase
    .from('decks')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
