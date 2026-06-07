alter table public.portfolio_images
  add column if not exists title text,
  add column if not exists note text,
  add column if not exists width integer,
  add column if not exists height integer;

notify pgrst, 'reload schema';
