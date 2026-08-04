-- ── profiles ────────────────────────────────────────────────────────────────
create table public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  email              text not null,
  age_confirmed_at   timestamptz,
  terms_accepted_at  timestamptz,
  objectif           text,
  tranche_age        text,
  sexe               text,
  phototype          int check (phototype between 1 and 6),
  type_cheveux       text,
  sensibilite        text,
  routine_actuelle   text[] default '{}',
  mode_prefere       text default 'soft' check (mode_prefere in ('soft','hard','both')),
  onboarding_done_at timestamptz,
  created_at         timestamptz not null default now()
);

-- ── analyses ────────────────────────────────────────────────────────────────
create table public.analyses (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  mode                  text not null default 'soft' check (mode in ('soft','hard')),
  status                text not null default 'pending' check (status in ('pending','done','failed')),
  scores                jsonb,
  indice_actuel         numeric(3,1),
  indice_atteignable    numeric(3,1),
  points                jsonb,
  points_count          int,
  premier_point_libelle text,
  routine               jsonb,
  unlocked              boolean not null default false,
  blurred_image_path    text,
  photo_deleted_at      timestamptz,
  model_used            text,
  error_reason          text,
  created_at            timestamptz not null default now()
);
create index analyses_user_created_idx on public.analyses (user_id, created_at desc);

-- ── subscriptions ───────────────────────────────────────────────────────────
create table public.subscriptions (
  user_id                uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  formule                text check (formule in ('hebdo','annuel','vie')),
  status                 text check (status in ('active','canceled','past_due')),
  current_period_end     timestamptz,
  cancel_at              timestamptz,
  canceled_at            timestamptz,
  withdrawal_waived_at   timestamptz,
  quota_used             int not null default 0,
  quota_reset_at         timestamptz not null default date_trunc('month', now()) + interval '1 month'
);

-- ── events ──────────────────────────────────────────────────────────────────
create table public.events (
  id         bigserial primary key,
  user_id    uuid references auth.users(id) on delete set null,
  type       text not null,
  payload    jsonb default '{}',
  created_at timestamptz not null default now()
);
create index events_user_created_idx on public.events (user_id, created_at desc);

-- ── trigger d'inscription ───────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  insert into public.subscriptions (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.analyses      enable row level security;
alter table public.subscriptions enable row level security;
alter table public.events        enable row level security;

create policy "profiles: lecture de soi" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: écriture de soi" on public.profiles
  for update using (auth.uid() = id);

create policy "analyses: lecture si débloquée" on public.analyses
  for select using (auth.uid() = user_id and unlocked = true);

create policy "subscriptions: lecture de soi" on public.subscriptions
  for select using (auth.uid() = user_id);
