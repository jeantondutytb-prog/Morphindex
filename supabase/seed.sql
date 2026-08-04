-- Local development seed (run automatically by `supabase start` / `supabase db reset`).
-- NOT applied to hosted Supabase projects.
--
-- Hosted Supabase automatically grants full CRUD on new public tables to the
-- API roles (anon / authenticated / service_role). Some local supabase postgres
-- images only grant a partial set by default, which makes the service_role
-- server routes fail with "permission denied for table ...". These statements
-- replicate the hosted defaults so the app works locally end-to-end.
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
