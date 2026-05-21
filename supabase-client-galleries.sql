create table if not exists public.client_galleries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client_name text,
  client_email text,
  access_code text not null unique,
  is_active boolean not null default true,
  status text not null default 'active'
    check (status in ('active', 'paused', 'completed')),
  welcome_message text not null default '',
  internal_note text not null default '',
  favorites_reviewed boolean not null default false,
  finals_exported boolean not null default false,
  archive_prepared boolean not null default false,
  client_informed boolean not null default false,
  downloads_enabled boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.client_galleries
  add column if not exists status text default 'active';

update public.client_galleries
set status = case
  when is_active then 'active'
  else 'paused'
end
where status is null or status not in ('active', 'paused', 'completed');

alter table public.client_galleries
  alter column status set default 'active';

alter table public.client_galleries
  alter column status set not null;

alter table public.client_galleries
  drop constraint if exists client_galleries_status_check;

alter table public.client_galleries
  add constraint client_galleries_status_check
  check (status in ('active', 'paused', 'completed'));

alter table public.client_galleries
  add column if not exists internal_note text default '';

alter table public.client_galleries
  add column if not exists welcome_message text default '';

alter table public.client_galleries
  add column if not exists client_email text;

update public.client_galleries
set internal_note = ''
where internal_note is null;

update public.client_galleries
set welcome_message = ''
where welcome_message is null;

alter table public.client_galleries
  alter column internal_note set default '';

alter table public.client_galleries
  alter column internal_note set not null;

alter table public.client_galleries
  alter column welcome_message set default '';

alter table public.client_galleries
  alter column welcome_message set not null;

alter table public.client_galleries
  add column if not exists favorites_reviewed boolean default false;

alter table public.client_galleries
  add column if not exists finals_exported boolean default false;

alter table public.client_galleries
  add column if not exists archive_prepared boolean default false;

alter table public.client_galleries
  add column if not exists client_informed boolean default false;

update public.client_galleries
set
  favorites_reviewed = coalesce(favorites_reviewed, false),
  finals_exported = coalesce(finals_exported, false),
  archive_prepared = coalesce(archive_prepared, false),
  client_informed = coalesce(client_informed, false);

alter table public.client_galleries
  alter column favorites_reviewed set default false,
  alter column favorites_reviewed set not null,
  alter column finals_exported set default false,
  alter column finals_exported set not null,
  alter column archive_prepared set default false,
  alter column archive_prepared set not null,
  alter column client_informed set default false,
  alter column client_informed set not null;

create table if not exists public.client_gallery_images (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.client_galleries(id) on delete cascade,
  url text not null,
  path text not null,
  filename text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.client_galleries
  add column if not exists cover_image_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'client_galleries_cover_image_id_fkey'
  ) then
    alter table public.client_galleries
      add constraint client_galleries_cover_image_id_fkey
      foreign key (cover_image_id)
      references public.client_gallery_images(id)
      on delete set null;
  end if;
end $$;

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

notify pgrst, 'reload schema';
