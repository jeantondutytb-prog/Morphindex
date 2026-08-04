create index if not exists events_user_type_created_idx
  on public.events (user_id, type, created_at desc);
