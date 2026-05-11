import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Supabase] VITE_SUPABASE_URL und/oder VITE_SUPABASE_ANON_KEY fehlen. ' +
      'Bitte .env.example nach .env kopieren und ausfüllen.'
  );
}

export const supabase: SupabaseClient = createClient(
  url ?? 'http://invalid.local',
  anonKey ?? 'public-anon-key-missing',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
