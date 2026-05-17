create table if not exists public.site_assets (
  key text primary key,
  url text not null,
  path text not null,
  updated_at timestamptz not null default now()
);

alter table public.site_assets enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'site_assets'
      and policyname = 'Public can read site assets'
  ) then
    create policy "Public can read site assets"
      on public.site_assets
      for select
      using (true);
  end if;
end $$;
