create table if not exists public.portfolio_images (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('car', 'portrait', 'nature', 'event')),
  url text not null,
  path text not null,
  created_at timestamptz not null default now()
);

alter table public.portfolio_images enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'portfolio_images'
      and policyname = 'public can read portfolio images'
  ) then
    create policy "public can read portfolio images"
    on public.portfolio_images
    for select
    using (true);
  end if;
end
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio',
  'portfolio',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];
