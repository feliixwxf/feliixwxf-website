-- User error reports for the admin area.
-- Run this once in Supabase SQL Editor, then wait 10-30 seconds.

create extension if not exists pgcrypto;

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

alter table public.user_error_logs
  add column if not exists type text not null default 'client',
  add column if not exists page text,
  add column if not exists message text not null default 'Unbekannter Fehler',
  add column if not exists source text,
  add column if not exists stack text,
  add column if not exists user_agent text,
  add column if not exists is_resolved boolean not null default false,
  add column if not exists created_at timestamptz not null default now();

alter table public.user_error_logs enable row level security;

revoke all on table public.user_error_logs from anon, authenticated;
grant all privileges on table public.user_error_logs to service_role;

select pg_notify('pgrst', 'reload schema');

select id, message, created_at
from public.user_error_logs
order by created_at desc
limit 5;
