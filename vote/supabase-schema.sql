-- Vote en ligne (service Docker vote / iahome.fr)
-- À exécuter dans Supabase : SQL Editor → New query → Run.
-- Le backend utilise uniquement la clé service_role ; pas d’accès anon nécessaire.

create table if not exists public.vote_polls (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  pin text not null unique check (pin ~ '^\d{4}$'),
  public_slug text not null unique
);

create table if not exists public.vote_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.vote_polls (id) on delete cascade,
  label text not null,
  sort_order int not null default 0
);

create index if not exists vote_options_poll_id_idx on public.vote_options (poll_id);

create table if not exists public.vote_votes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  poll_id uuid not null references public.vote_polls (id) on delete cascade,
  option_id uuid not null references public.vote_options (id) on delete cascade,
  client_id text not null check (char_length(client_id) >= 8 and char_length(client_id) <= 128)
);

create unique index if not exists vote_votes_poll_client_uidx on public.vote_votes (poll_id, client_id);

create index if not exists vote_votes_poll_id_idx on public.vote_votes (poll_id);

alter table public.vote_polls enable row level security;
alter table public.vote_options enable row level security;
alter table public.vote_votes enable row level security;

-- Aucune policy : accès réservé au service_role (backend Express).
