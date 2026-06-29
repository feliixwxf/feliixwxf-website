-- Security hardening for public website data, customer accounts,
-- client galleries, and reviews.
--
-- Run this after the main setup files.
-- Important: customer accounts are stored in Supabase Auth, not in a public
-- profile table. Auth users are managed through the server-side API routes.
-- The public browser key should never receive direct write access to private
-- customer gallery or admin data.

alter table public.client_galleries enable row level security;
alter table public.client_gallery_images enable row level security;
alter table public.client_favorites enable row level security;

drop policy if exists "Public can read active client galleries by code" on public.client_galleries;
drop policy if exists "Public can read client gallery images" on public.client_gallery_images;
drop policy if exists "Public can manage client favorites" on public.client_favorites;

-- Extra lock: the public browser keys should not read or write customer
-- gallery tables directly. The website accesses these tables only through
-- Next.js API routes with the server-side service role key.
revoke all on table public.client_galleries from anon, authenticated;
revoke all on table public.client_gallery_images from anon, authenticated;
revoke all on table public.client_favorites from anon, authenticated;

-- Public website settings and assets may be readable, but never writable from
-- public browser sessions. Admin edits go through protected Next.js API routes.
alter table if exists public.site_settings enable row level security;
alter table if exists public.site_assets enable row level security;
alter table if exists public.portfolio_images enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
drop policy if exists "Public can read site assets" on public.site_assets;
drop policy if exists "public can read portfolio images" on public.portfolio_images;

create policy "Public can read site settings"
on public.site_settings
for select
to anon, authenticated
using (true);

create policy "Public can read site assets"
on public.site_assets
for select
to anon, authenticated
using (true);

create policy "public can read portfolio images"
on public.portfolio_images
for select
to anon, authenticated
using (true);

grant select on table public.site_settings to anon, authenticated;
grant select on table public.site_assets to anon, authenticated;
grant select on table public.portfolio_images to anon, authenticated;

revoke insert, update, delete on table public.site_settings from anon, authenticated;
revoke insert, update, delete on table public.site_assets from anon, authenticated;
revoke insert, update, delete on table public.portfolio_images from anon, authenticated;

-- Reviews may be public only after admin approval.
alter table public.reviews enable row level security;

drop policy if exists "Public can read approved reviews" on public.reviews;
drop policy if exists "Public can create pending reviews" on public.reviews;

create policy "Public can read approved reviews"
on public.reviews
for select
to anon, authenticated
using (is_approved = true);

-- New reviews are created through /api/reviews with the service role key.
-- This prevents spam or manipulated direct inserts with the public anon key.
revoke insert, update, delete on table public.reviews from anon, authenticated;
grant select on table public.reviews to anon, authenticated;

-- Admin activity log. This is only written/read through protected server-side
-- admin API routes with the service role key.
create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  target_type text not null,
  target_id text,
  label text,
  created_at timestamptz not null default now()
);

alter table public.admin_activity_logs enable row level security;
revoke all on table public.admin_activity_logs from anon, authenticated;

-- User-facing error reports. Written through a rate-limited server route and
-- only readable in the protected admin area.
create table if not exists public.user_error_logs (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'client',
  page text,
  message text not null,
  source text,
  stack text,
  user_agent text,
  is_resolved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.user_error_logs enable row level security;
revoke all on table public.user_error_logs from anon, authenticated;

-- Storage overview:
-- - portfolio stays public because those images are meant for the public site.
-- - client-galleries stays private. Images and ZIP files should be served only
--   by server routes through signed URLs or controlled downloads.
update storage.buckets
set public = true
where id = 'portfolio';

update storage.buckets
set public = false
where id = 'client-galleries';

-- Keep PostgREST schema cache fresh after policy/schema changes.
notify pgrst, 'reload schema';
