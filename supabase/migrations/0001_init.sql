-- Morphindex — schéma initial
-- À exécuter dans le SQL Editor du projet Supabase (une seule fois).
-- Repris de Projects/morphindex — les commentaires documentent des décisions
-- de sécurité délibérées : ne pas les "simplifier".

-- PROFILS
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  plan text not null default 'free',           -- free | weekly | yearly | lifetime
  credits int not null default 1,              -- 1 analyse offerte à l'inscription
  credits_reset_date timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  age_confirmed_at timestamptz,                -- NULL = barrière 18+ non franchie
  photo_consent_at timestamptz,                -- consentement explicite, distinct des CGU
  created_at timestamptz not null default now()
);

-- ANALYSES
create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',      -- pending | complete | failed
  scores jsonb,                                -- {overall, potential, subscores[]}
  routine jsonb,                               -- {steps[]}
  source_photo_path text,                      -- NULL une fois supprimée
  source_photo_deleted_at timestamptz,
  unlocked_at timestamptz,                     -- NULL = encore derrière le paywall
  created_at timestamptz not null default now()
);

-- PROJECTIONS
create table public.projections (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  horizon_months int not null,                 -- 1 | 3 | 6 | 12
  clear_path text not null,                    -- bucket privé "projections"
  blurred_path text not null,                  -- bucket privé "projections-floutees"
  created_at timestamptz not null default now(),
  unique (analysis_id, horizon_months)
);

-- INDEX pour la vérification du quota (2 analyses par mois par user) et la liste des analyses
create index analyses_user_id_created_at_idx
  on public.analyses (user_id, created_at desc);

-- RLS
alter table public.profiles    enable row level security;
alter table public.analyses    enable row level security;
alter table public.projections enable row level security;

create policy "profil visible par son proprietaire"
  on public.profiles for select using (auth.uid() = id);

-- Aucune policy UPDATE sur les profils : toutes les écritures passent par la clé
-- service_role côté serveur, qui contourne l'RLS. Une policy UPDATE côté client
-- permettrait à un utilisateur authentifié de modifier ses propres crédits et plan
-- via la clé anon, contournant le paywall.

-- ATTENTION : aucune policy SELECT sur analyses et projections
-- L'RLS est activée sur ces tables, mais volontairement sans policy client.
-- RLS activée + zéro policy = refus d'accès direct client à ces tables.
-- Toute lecture/écriture passe par les routes serveur avec la clé service_role,
-- qui contourne l'RLS.
-- Raison : l'RLS est au niveau des lignes (row-level), pas des colonnes.
-- Une policy SELECT restreinte au propriétaire retournerait la ligne complète
-- (scores, routine, clear_path, ...), indépendamment de analyses.unlocked_at
-- (marqueur du paywall). L'utilisateur pourrait lire son analyse payante
-- directement du navigateur avec la clé anon, sans jamais payer.
-- Donc : ne PAS ajouter de policy SELECT sur ces tables.

-- TRIGGER de création de profil
-- SET search_path = public + table qualifiée : sans ça, l'inscription renvoie
-- HTTP 500 "Database error saving new user" après durcissement Supabase.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, credits)
  values (new.id, new.email, 1)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Remboursement : ré-crédite un utilisateur après un échec d'analyse post-débit.
create or replace function public.increment_credits(p_user_id uuid, p_amount int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set credits = credits + p_amount where id = p_user_id;
end;
$$;

-- Débit atomique et symétrique à increment_credits. La condition `credits >= p_amount`
-- est évaluée par Postgres au moment du UPDATE, qui sérialise les écritures concurrentes
-- sur la même ligne : deux requêtes simultanées ne peuvent plus toutes les deux lire
-- `credits = 2`, calculer `1`, et écrire `1` chacune. Si aucune ligne ne correspond
-- (crédits insuffisants), `returning` ne fixe jamais new_balance, qui reste NULL —
-- c'est le signal que l'appelant doit refuser l'opération et NE PAS débiter.
-- `security definer` + `set search_path = public` avec tables qualifiées par schéma
-- sont impératifs : leur absence a causé une panne d'inscription en production sur un
-- projet voisin.
create or replace function public.decrement_credits(p_user_id uuid, p_amount int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  new_balance int;
begin
  -- Un p_amount <= 0 transformerait ce débit en crédit gratuit (`credits - (-1000)`
  -- augmente le solde). Cette fonction ne doit jamais pouvoir servir à ajouter
  -- des crédits : seul increment_credits (appelé uniquement par service_role, cf.
  -- revoke ci-dessous) a le droit d'augmenter un solde.
  if p_amount <= 0 then
    raise exception 'decrement_credits: p_amount doit être strictement positif (reçu: %)', p_amount;
  end if;

  update public.profiles
     set credits = credits - p_amount
   where id = p_user_id and credits >= p_amount
  returning credits into new_balance;
  return new_balance;
end;
$$;

-- SÉCURITÉ CRITIQUE — ne JAMAIS regranter l'exécution de ces fonctions à
-- `anon`/`authenticated`/`public`. PostgREST expose automatiquement toute
-- fonction du schéma `public` sur `/rest/v1/rpc/<nom>`, et Postgres accorde
-- `EXECUTE` à `PUBLIC` par défaut sur les fonctions nouvellement créées.
-- Combiné aux GRANT USAGE ON SCHEMA public accordés par Supabase à `anon` et
-- `authenticated`, ces deux fonctions seraient sinon appelables directement
-- depuis le navigateur avec la seule clé anon — y compris `decrement_credits`
-- pour vider le solde d'un AUTRE utilisateur (p_user_id est un paramètre
-- fourni par l'appelant), et `increment_credits` pour s'auto-créditer des
-- crédits illimités. Les crédits doivent rester strictement server-authoritative :
-- seul `service_role` (utilisé par `createAdminClient()` côté serveur) peut les
-- appeler. Si une erreur de permission apparaît un jour sur ces RPC, la
-- correction n'est PAS de regranter l'exécution ici : c'est d'appeler la
-- fonction depuis le serveur avec `createAdminClient()`.
-- `revoke` est idempotent : ré-exécuter cette migration ne provoque pas d'erreur
-- même si les droits ont déjà été révoqués.
revoke execute on function public.increment_credits(uuid, int) from public, anon, authenticated;
revoke execute on function public.decrement_credits(uuid, int) from public, anon, authenticated;

-- Le grant explicite ci-dessous rend ce fichier auto-suffisant : sans lui,
-- l'exécutabilité par `service_role` ne tiendrait qu'aux privilèges par défaut
-- ambiants de Supabase (accordés à la création des fonctions), jamais déclarés
-- ici. Si ces privilèges par défaut étaient un jour modifiés (globalement ou
-- sur ce schéma), le flux payant serait cassé silencieusement — plus aucune
-- ligne de cette migration ne garantirait alors l'accès de `createAdminClient()`
-- (qui utilise `service_role`) à ces RPC. `grant` est lui aussi idempotent.
grant execute on function public.increment_credits(uuid, int) to service_role;
grant execute on function public.decrement_credits(uuid, int) to service_role;
