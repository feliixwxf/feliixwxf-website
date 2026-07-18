create table if not exists public.admin_documents (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'contract',
  title text not null default 'Neues Dokument',
  client_name text,
  client_email text,
  amount numeric,
  status text not null default 'draft',
  event_date timestamptz,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_appointments (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Neuer Termin',
  client_name text,
  client_email text,
  phone text,
  location text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'planned',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Ohne Namen',
  email text,
  phone text,
  interest text,
  desired_period text,
  status text not null default 'open',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_documents enable row level security;
alter table public.admin_appointments enable row level security;
alter table public.admin_waitlist enable row level security;

drop policy if exists "Service role can manage admin documents" on public.admin_documents;
drop policy if exists "Service role can manage admin appointments" on public.admin_appointments;
drop policy if exists "Service role can manage admin waitlist" on public.admin_waitlist;

create policy "Service role can manage admin documents"
on public.admin_documents
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Service role can manage admin appointments"
on public.admin_appointments
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Service role can manage admin waitlist"
on public.admin_waitlist
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create index if not exists admin_documents_updated_at_idx
on public.admin_documents (updated_at desc);

create index if not exists admin_appointments_starts_at_idx
on public.admin_appointments (starts_at asc);

create index if not exists admin_waitlist_created_at_idx
on public.admin_waitlist (created_at desc);

insert into public.admin_documents (type, title, status, content)
select
  'contract',
  'Shooting-Vertrag Vorlage',
  'draft',
  'Shooting-Vertrag\n\nFotograf: Felix Wolff / feliix.wxf\nKunde: [Name]\nShooting: [Art des Shootings]\nDatum: [Datum]\nOrt: [Ort]\n\nLeistung:\n- Planung und Durchführung des Shootings\n- Auswahl und Bearbeitung der vereinbarten Bilder\n- Digitale Bereitstellung über eine Kundengalerie\n\nNutzungsrechte:\nDie Bilder dürfen privat genutzt werden. Veröffentlichung auf Social Media ist nach Absprache möglich. Kommerzielle Nutzung nur mit ausdrücklicher Zustimmung.\n\nZahlung:\nBetrag: [Betrag]\nFälligkeit: [Fälligkeit]\n\nUnterschriften:\nFotograf: ____________________\nKunde: ____________________'
where not exists (
  select 1
  from public.admin_documents
  where title = 'Shooting-Vertrag Vorlage'
);

notify pgrst, 'reload schema';
