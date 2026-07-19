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

update public.admin_documents
set
  content = $$FOTO-SHOOTING VEREINBARUNG

Zwischen
Felix Wolff / feliix.wxf
Zum Großenbach 1
98673 Eisfeld
E-Mail: felixwolff411@gmail.com
Telefon: +49 15259105754

und
Kunde: [Name des Kunden]
E-Mail: [E-Mail des Kunden]
Telefon: [Telefon optional]

1. Gegenstand der Vereinbarung
Der Fotograf übernimmt die fotografische Begleitung bzw. Durchführung des folgenden Shootings:
Shooting-Art: [Portrait / Car / Hochzeit / Event / Sonstiges]
Datum: [Datum]
Ort: [Ort]
Dauer / Umfang: [z. B. 1 Stunde / halber Tag / nach Absprache]

2. Leistungsumfang
Der Leistungsumfang umfasst:
- Planung und Abstimmung des Shootings
- Durchführung des Shootings vor Ort
- Auswahl und professionelle Bearbeitung der vereinbarten Bilder
- Digitale Bereitstellung über eine geschützte Kundengalerie
- Downloadfreigabe nach Vereinbarung

Anzahl der finalen Bilder: [Anzahl oder nach Absprache]
Lieferzeit: [z. B. 7-14 Werktage nach Shooting]

3. Vergütung
Vereinbarter Betrag: [Betrag]
Zahlungsart: [Bar / Überweisung / nach Absprache]
Fälligkeit: [z. B. am Shootingtag / nach Rechnungsstellung]

4. Nutzungsrechte
Der Kunde erhält die Nutzungsrechte für private Zwecke.
Eine Veröffentlichung auf Social Media ist erlaubt, sofern feliix.wxf genannt wird oder etwas anderes vereinbart wurde.
Eine kommerzielle Nutzung, Weitergabe an Dritte oder Bearbeitung der Bilder ist nur nach vorheriger schriftlicher Zustimmung erlaubt.

5. Portfolio-Nutzung
Der Fotograf darf ausgewählte Bilder nur dann für Portfolio, Website oder Social Media verwenden, wenn der Kunde dies ausdrücklich erlaubt.

Zustimmung Portfolio-Nutzung:
[ ] Ja
[ ] Nein

6. Terminabsage und Verschiebung
Sollte ein Termin nicht stattfinden können, informieren sich beide Parteien so früh wie möglich.
Ein Ersatztermin wird nach Verfügbarkeit abgestimmt.

7. Datenschutz
Personenbezogene Daten werden ausschließlich zur Abwicklung des Shootings, zur Kommunikation und zur Bereitstellung der Bilder verarbeitet.
Weitere Informationen stehen in der Datenschutzerklärung unter:
https://www.feliixwxf.de/datenschutz

8. Sonstige Vereinbarungen
[Platz für individuelle Hinweise, Sonderwünsche oder Absprachen]

Ort, Datum: ______________________________

Unterschrift Fotograf: ______________________________

Unterschrift Kunde: ______________________________$$,
  updated_at = now()
where title = 'Shooting-Vertrag Vorlage'
  and type = 'contract';

insert into public.admin_documents (type, title, status, content)
select
  'contract',
  'Shooting-Vertrag Vorlage',
  'draft',
  $$FOTO-SHOOTING VEREINBARUNG

Zwischen
Felix Wolff / feliix.wxf
Zum Großenbach 1
98673 Eisfeld
E-Mail: felixwolff411@gmail.com
Telefon: +49 15259105754

und
Kunde: [Name des Kunden]
E-Mail: [E-Mail des Kunden]
Telefon: [Telefon optional]

1. Gegenstand der Vereinbarung
Der Fotograf übernimmt die fotografische Begleitung bzw. Durchführung des folgenden Shootings:
Shooting-Art: [Portrait / Car / Hochzeit / Event / Sonstiges]
Datum: [Datum]
Ort: [Ort]
Dauer / Umfang: [z. B. 1 Stunde / halber Tag / nach Absprache]

2. Leistungsumfang
Der Leistungsumfang umfasst:
- Planung und Abstimmung des Shootings
- Durchführung des Shootings vor Ort
- Auswahl und professionelle Bearbeitung der vereinbarten Bilder
- Digitale Bereitstellung über eine geschützte Kundengalerie
- Downloadfreigabe nach Vereinbarung

Anzahl der finalen Bilder: [Anzahl oder nach Absprache]
Lieferzeit: [z. B. 7-14 Werktage nach Shooting]

3. Vergütung
Vereinbarter Betrag: [Betrag]
Zahlungsart: [Bar / Überweisung / nach Absprache]
Fälligkeit: [z. B. am Shootingtag / nach Rechnungsstellung]

4. Nutzungsrechte
Der Kunde erhält die Nutzungsrechte für private Zwecke.
Eine Veröffentlichung auf Social Media ist erlaubt, sofern feliix.wxf genannt wird oder etwas anderes vereinbart wurde.
Eine kommerzielle Nutzung, Weitergabe an Dritte oder Bearbeitung der Bilder ist nur nach vorheriger schriftlicher Zustimmung erlaubt.

5. Portfolio-Nutzung
Der Fotograf darf ausgewählte Bilder nur dann für Portfolio, Website oder Social Media verwenden, wenn der Kunde dies ausdrücklich erlaubt.

Zustimmung Portfolio-Nutzung:
[ ] Ja
[ ] Nein

6. Terminabsage und Verschiebung
Sollte ein Termin nicht stattfinden können, informieren sich beide Parteien so früh wie möglich.
Ein Ersatztermin wird nach Verfügbarkeit abgestimmt.

7. Datenschutz
Personenbezogene Daten werden ausschließlich zur Abwicklung des Shootings, zur Kommunikation und zur Bereitstellung der Bilder verarbeitet.
Weitere Informationen stehen in der Datenschutzerklärung unter:
https://www.feliixwxf.de/datenschutz

8. Sonstige Vereinbarungen
[Platz für individuelle Hinweise, Sonderwünsche oder Absprachen]

Ort, Datum: ______________________________

Unterschrift Fotograf: ______________________________

Unterschrift Kunde: ______________________________$$
where not exists (
  select 1
  from public.admin_documents
  where title = 'Shooting-Vertrag Vorlage'
);

notify pgrst, 'reload schema';
