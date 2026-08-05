-- Dimensions granulaires (90+) par analyse
alter table public.analyses add column if not exists dimensions jsonb;
