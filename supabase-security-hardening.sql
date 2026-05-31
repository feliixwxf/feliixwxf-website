-- Security hardening for customer accounts, client galleries, and reviews.
-- Run this after the main setup files. It keeps customer gallery tables locked
-- from direct public access; your Next.js API uses the service role server-side.

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

-- Keep PostgREST schema cache fresh after policy/schema changes.
notify pgrst, 'reload schema';
