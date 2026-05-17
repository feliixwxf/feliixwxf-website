create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'site_settings'
      and policyname = 'Public can read site settings'
  ) then
    create policy "Public can read site settings"
      on public.site_settings
      for select
      using (true);
  end if;
end $$;
