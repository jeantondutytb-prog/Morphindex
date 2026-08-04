insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;
