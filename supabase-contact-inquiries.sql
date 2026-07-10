-- Contact inquiries for the admin area.
--
-- Run this once in Supabase SQL Editor.
-- The public website writes contact requests through a server-side API route.
-- The table itself is not readable or writable through public browser keys.

create extension if not exists pgcrypto;

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'new',
  source text,
  user_agent text,
  created_at timestamptz not null default now(),
  answered_at timestamptz
);

alter table public.contact_inquiries
  add column if not exists name text not null default '',
  add column if not exists email text not null default '',
  add column if not exists phone text,
  add column if not exists message text not null default '',
  add column if not exists status text not null default 'new',
  add column if not exists source text,
  add column if not exists user_agent text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists answered_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'contact_inquiries_status_check'
  ) then
    alter table public.contact_inquiries
      add constraint contact_inquiries_status_check
      check (status in ('new', 'answered'));
  end if;
end $$;

create index if not exists contact_inquiries_created_at_idx
on public.contact_inquiries (created_at desc);

create index if not exists contact_inquiries_status_idx
on public.contact_inquiries (status);

alter table public.contact_inquiries enable row level security;
revoke all on table public.contact_inquiries from anon, authenticated;
grant all on table public.contact_inquiries to service_role;

select pg_notify('pgrst', 'reload schema');
