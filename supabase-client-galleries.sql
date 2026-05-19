create table if not exists public.client_galleries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client_name text,
  access_code text not null unique,
  is_active boolean not null default true,
  downloads_enabled boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.client_gallery_images (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.client_galleries(id) on delete cascade,
  url text not null,
  path text not null,
  filename text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.client_favorites (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.client_galleries(id) on delete cascade,
  image_id uuid not null references public.client_gallery_images(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (gallery_id, image_id)
);

alter table public.client_galleries enable row level security;
alter table public.client_gallery_images enable row level security;
alter table public.client_favorites enable row level security;

drop policy if exists "Public can read active client galleries by code" on public.client_galleries;
drop policy if exists "Public can read client gallery images" on public.client_gallery_images;
drop policy if exists "Public can manage client favorites" on public.client_favorites;
