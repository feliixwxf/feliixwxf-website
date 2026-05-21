-- Security hardening for customer accounts, client galleries, and reviews.
-- Run this after the main setup files. It keeps customer gallery tables locked
-- from direct public access; your Next.js API uses the service role server-side.

alter table public.client_galleries enable row level security;
alter table public.client_gallery_images enable row level security;
alter table public.client_favorites enable row level security;

drop policy if exists "Public can read active client galleries by code" on public.client_galleries;
drop policy if exists "Public can read client gallery images" on public.client_gallery_images;
drop policy if exists "Public can manage client favorites" on public.client_favorites;

-- Reviews may be public only after admin approval.
alter table public.reviews enable row level security;

drop policy if exists "Public can read approved reviews" on public.reviews;
drop policy if exists "Public can create pending reviews" on public.reviews;

create policy "Public can read approved reviews"
on public.reviews
for select
to anon, authenticated
using (is_approved = true);

create policy "Public can create pending reviews"
on public.reviews
for insert
to anon, authenticated
with check (is_approved = false);

-- Keep PostgREST schema cache fresh after policy/schema changes.
notify pgrst, 'reload schema';
