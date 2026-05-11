-- Karteikarten-Initial-Schema
-- Ausführen im Supabase SQL-Editor.

-- Decks
create table public.decks (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name        text not null check (length(name) between 1 and 200),
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Cards
create table public.cards (
  id            uuid primary key default gen_random_uuid(),
  deck_id       uuid not null references public.decks(id) on delete cascade,
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  front         text not null,
  back          text not null,
  weight        integer not null default 10 check (weight between 1 and 20),
  correct_count integer not null default 0,
  wrong_count   integer not null default 0,
  last_seen_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index on public.cards (deck_id);
create index on public.cards (owner_id);
create index on public.decks (owner_id);

-- updated_at-Trigger
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_decks
  before update on public.decks
  for each row execute function public.tg_set_updated_at();

create trigger set_updated_at_cards
  before update on public.cards
  for each row execute function public.tg_set_updated_at();

-- Row-Level-Security
alter table public.decks enable row level security;
alter table public.cards enable row level security;

create policy "decks_own" on public.decks
  for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "cards_own" on public.cards
  for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
