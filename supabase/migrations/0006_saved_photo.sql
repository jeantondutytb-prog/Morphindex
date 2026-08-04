-- Photo source conservée pour relancer une analyse sans re-upload
alter table public.profiles
  add column if not exists saved_photo_path text;
