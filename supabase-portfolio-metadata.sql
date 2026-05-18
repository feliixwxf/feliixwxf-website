alter table public.portfolio_images
  add column if not exists title text,
  add column if not exists note text;
