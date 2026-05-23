-- =====================================================================
-- LUMIÈRE — Schéma Supabase
-- À exécuter dans Supabase SQL Editor
-- =====================================================================

-- Profils utilisateurs (1:1 avec auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,m
  full_name text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz default now()
);

-- Films
create table if not exists public.films (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  director text,
  year int,
  duration int,
  genres text[] default '{}',
  rating text,
  synopsis text,
  tagline text,
  cast_members text[] default '{}',
  poster_url text,
  poster_gradient text,
  poster_text text,
  backdrop_gradient text,
  accent_tone text,
  created_at timestamptz default now()
);

-- Séances
create table if not exists public.screenings (
  id uuid primary key default gen_random_uuid(),
  film_id uuid not null references public.films on delete cascade,
  starts_at timestamptz not null,
  room text not null,
  format text,
  total_seats int not null default 168,
  price_standard numeric(6,2) default 12.50,
  price_premium  numeric(6,2) default 16.00,
  price_duo      numeric(6,2) default 32.00,
  created_at timestamptz default now()
);

-- Snacks
create table if not exists public.snacks (
  id text primary key,
  name text not null,
  size text,
  price numeric(6,2) not null,
  emoji text,
  description text
);

-- Réservations
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  screening_id uuid not null references public.screenings on delete restrict,
  seats text[] not null,
  seat_categories jsonb not null default '{}',
  snacks jsonb not null default '{}',
  total numeric(8,2) not null,
  status text not null default 'confirmed' check (status in ('pending','confirmed','cancelled')),
  email text,
  full_name text,
  reference text unique,
  created_at timestamptz default now()
);

create index if not exists reservations_screening_idx on public.reservations(screening_id);
create index if not exists reservations_user_idx on public.reservations(user_id);
create index if not exists screenings_film_idx on public.screenings(film_id);

-- =====================================================================
-- Profil auto-créé à l'inscription
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles      enable row level security;
alter table public.films         enable row level security;
alter table public.screenings    enable row level security;
alter table public.snacks        enable row level security;
alter table public.reservations  enable row level security;

-- Helper : est-ce admin ?
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- profiles
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id);

-- films : lecture publique, écriture admin
drop policy if exists "films read" on public.films;
create policy "films read" on public.films for select using (true);
drop policy if exists "films admin write" on public.films;
create policy "films admin write" on public.films
  for all using (public.is_admin()) with check (public.is_admin());

-- screenings : idem
drop policy if exists "screenings read" on public.screenings;
create policy "screenings read" on public.screenings for select using (true);
drop policy if exists "screenings admin write" on public.screenings;
create policy "screenings admin write" on public.screenings
  for all using (public.is_admin()) with check (public.is_admin());

-- snacks : lecture publique, écriture admin
drop policy if exists "snacks read" on public.snacks;
create policy "snacks read" on public.snacks for select using (true);
drop policy if exists "snacks admin write" on public.snacks;
create policy "snacks admin write" on public.snacks
  for all using (public.is_admin()) with check (public.is_admin());

-- reservations : utilisateur voit les siennes, admin tout, création publique (invité OK)
drop policy if exists "reservations read own" on public.reservations;
create policy "reservations read own" on public.reservations
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "reservations insert" on public.reservations;
create policy "reservations insert" on public.reservations
  for insert with check (auth.uid() = user_id or user_id is null);

drop policy if exists "reservations admin write" on public.reservations;
create policy "reservations admin write" on public.reservations
  for update using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- Storage : bucket "posters"
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('posters', 'posters', true)
on conflict (id) do nothing;

drop policy if exists "posters public read" on storage.objects;
create policy "posters public read" on storage.objects
  for select using (bucket_id = 'posters');

drop policy if exists "posters admin write" on storage.objects;
create policy "posters admin write" on storage.objects
  for all using (bucket_id = 'posters' and public.is_admin())
  with check (bucket_id = 'posters' and public.is_admin());

-- =====================================================================
-- Seed minimal
-- =====================================================================
insert into public.snacks (id, name, size, price, emoji, description) values
  ('pop-l',  'Popcorn salé',            'Grand · 1L',   7.50,  '🍿', 'Maïs frais soufflé sur place'),
  ('pop-m',  'Popcorn sucré',           'Moyen · 60cl', 6.00,  '🍿', 'Caramel maison'),
  ('duo',    'Duo Popcorn + 2 sodas',   'Menu',         14.00, '🥤', 'L''option qui rassemble'),
  ('soda',   'Soda',                    '50cl',         4.50,  '🥤', 'Coca, Orangina, Sprite'),
  ('water',  'Eau plate',               '50cl',         3.00,  '💧', 'Évian'),
  ('mm',     'M&M''s',                  'Sachet 200g',  5.50,  '🍫', 'Chocolat ou peanut'),
  ('haribo', 'Bonbons Haribo',          'Sachet 250g',  5.00,  '🍬', 'Mix maison'),
  ('glace',  'Glace artisanale',        'Pot 120ml',    6.50,  '🍦', 'Vanille bourbon, choco intense')
on conflict (id) do nothing;

-- Films de démo
insert into public.films (id, title, director, year, duration, genres, rating, synopsis, tagline, cast_members, poster_gradient, poster_text, backdrop_gradient, accent_tone) values
  (gen_random_uuid(), 'Dune : Messie', 'Denis Villeneuve', 2026, 167,
   array['Science-fiction','Épopée'], '12+',
   'Paul Atréides règne désormais sur l''univers connu. Mais ses visions le hantent : un futur où la galaxie s''embrase à cause de lui.',
   'Le messie n''est pas celui que l''on attend.',
   array['Timothée Chalamet','Zendaya','Florence Pugh','Austin Butler'],
   'linear-gradient(180deg, #c9651f 0%, #6e2a0a 60%, #1d0a04 100%)',
   E'DUNE\nMESSIE',
   'radial-gradient(ellipse at 50% 30%, #f4a55c 0%, #c9651f 25%, #5a1f08 60%, #0a0405 100%)',
   '#f4a55c'),
  (gen_random_uuid(), 'La Chambre d''à Côté', 'Pedro Almodóvar', 2026, 107,
   array['Drame'], 'TP',
   'Deux amies de longue date se retrouvent à un moment charnière de leur vie.',
   'Tout ce que l''on n''a jamais osé dire.',
   array['Tilda Swinton','Julianne Moore','John Turturro'],
   'linear-gradient(180deg, #d94a4a 0%, #7a1818 70%, #1a0606 100%)',
   E'LA CHAMBRE\nD''À CÔTÉ',
   'radial-gradient(ellipse at 30% 40%, #ff6b6b 0%, #b53232 30%, #4a0e0e 70%, #0a0303 100%)',
   '#ff6b6b'),
  (gen_random_uuid(), 'Mickey 17', 'Bong Joon-ho', 2026, 137,
   array['Science-fiction','Comédie noire'], '12+',
   'Sur une planète gelée, Mickey accepte un travail un peu particulier : mourir, encore et encore.',
   'Une vie. Plusieurs fois.',
   array['Robert Pattinson','Naomi Ackie','Mark Ruffalo'],
   'linear-gradient(180deg, #5da8d9 0%, #1f4f7a 60%, #050d18 100%)',
   E'MICKEY\n17',
   'radial-gradient(ellipse at 60% 35%, #8ed4ff 0%, #3d7bb0 30%, #102438 70%, #02060c 100%)',
   '#8ed4ff'),
  (gen_random_uuid(), 'Megalopolis', 'Francis Ford Coppola', 2026, 138,
   array['Fable politique','Drame'], '16+',
   'New Rome. Un architecte visionnaire veut reconstruire la ville idéale après une catastrophe.',
   'Il faut imaginer Sisyphe heureux.',
   array['Adam Driver','Nathalie Emmanuel','Aubrey Plaza','Giancarlo Esposito'],
   'linear-gradient(180deg, #d4a857 0%, #6e4a14 60%, #14100a 100%)',
   E'MEGA\nLOPOLIS',
   'radial-gradient(ellipse at 50% 25%, #f0c878 0%, #b58838 30%, #4a3514 70%, #08050a 100%)',
   '#f0c878')
on conflict do nothing;

-- Séances seed : prendre 4 séances par film, sur 2 jours
do $$
declare f record;
begin
  for f in select id from public.films loop
    insert into public.screenings (film_id, starts_at, room, format, total_seats) values
      (f.id, (now()::date + interval '14 hours 30 minutes'), 'Salle 1 · Dolby Atmos', 'VOSTFR · 4K HDR', 168),
      (f.id, (now()::date + interval '17 hours 45 minutes'), 'Salle 2 · IMAX',        'VOSTFR · IMAX',    220),
      (f.id, (now()::date + interval '20 hours 30 minutes'), 'Salle 1 · Dolby Atmos', 'VOSTFR · 4K HDR', 168),
      (f.id, (now()::date + interval '1 day 11 hours'),      'Salle 2 · IMAX',        'VOSTFR · IMAX',    220),
      (f.id, (now()::date + interval '1 day 20 hours 30 minutes'),'Salle 1 · Dolby Atmos','VOSTFR · 4K HDR',168);
  end loop;
end$$;
