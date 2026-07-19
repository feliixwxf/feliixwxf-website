# feliix.wxf Website

Next.js Website fuer `feliix.wxf` Fotografie mit oeffentlicher Website, Adminbereich, Kundenkonto, Kundengalerien, Portfolio-Verwaltung, Bewertungen, Vertragen/Terminen und lokalen SEO-Seiten.

Live-Domain: `https://www.feliixwxf.de`

## Bereiche

- `/` - oeffentliche Website
- `/admin` - geschuetzter Adminbereich
- `/konto` - Kundenkonto
- `/kunden` - Kundengalerie per Code oder QR-Link
- `/fotograf-hildburghausen` - lokale SEO-Seite
- `/fotograf-eisfeld` - lokale SEO-Seite
- `/datenschutz` und `/impressum` - Rechtliches

## Funktionen

- Portfolio-Bilder, Titelbilder und Startseitenbilder im Admin verwalten
- Bewertungen mit Moderation, Avataren, Profilbild-Fallback und E-Mail-Benachrichtigung
- Kundenkonto mit Registrierung, Login, Passwort-Reset, Profilbild, Telefonnummer und Konto-Loeschung
- Kundengalerien mit Code, QR-Link, Favoriten, privaten Bildern, signierten Links und ZIP-Archiv
- Download-Wasserzeichen fuer geschuetzte Kunden- und Portfolio-Downloads
- Wartungsmodus, wobei das Kontaktformular erreichbar bleibt
- Kontaktanfragen, Nutzerfehler-Protokoll und Admin-Aktivitaetsverlauf
- A4-Vertragsvorlage, Termine und Warteliste im Adminbereich
- lokale SEO-Metadaten, Sitemap, Robots und strukturierte Daten

## Entwicklung

```bash
npm install
npm run dev
npm run build
npm run lint
```

Lokale Entwicklung startet normalerweise auf `http://localhost:3000`. Wenn der Port belegt ist, nimmt Next.js automatisch einen anderen Port.

## Wichtige Dateien

- `app/page.js` - Startseite
- `app/admin/page.js` - Adminoberflaeche
- `app/konto/page.js` - Kundenkonto
- `app/kunden/page.js` - Kundengalerie
- `app/layout.js` - globale Metadaten und JSON-LD
- `app/sitemap.js` - Sitemap
- `app/robots.js` - Robots-Regeln
- `KI-UEBERGABE.md` - ausfuehrliche Projektuebergabe
- `SICHERHEIT_DATENSCHUTZ.md` - Sicherheits- und Datenschutznotizen
- `AUFBEWAHRUNG_LOESCHKONZEPT.md` - Aufbewahrung und Loeschung
- `SUPABASE_EMAIL_TEMPLATES.md` - Supabase Auth E-Mail-Vorlagen

## Supabase Setup

Die SQL-Dateien im Projekt muessen je nach Funktion einmal im Supabase SQL Editor ausgefuehrt werden:

- `supabase-admin-setup.sql`
- `supabase-review-moderation.sql`
- `supabase-portfolio-sort.sql`
- `supabase-portfolio-metadata.sql`
- `supabase-site-assets.sql`
- `supabase-site-settings.sql`
- `supabase-client-galleries.sql`
- `supabase-contact-inquiries.sql`
- `supabase-contracts-schedule.sql`
- `supabase-user-error-logs.sql`
- `supabase-security-hardening.sql`

## Vercel Environment Variables

Pflicht:

- `ADMIN_PASSWORD`
- `ADMIN_ACCESS_CODE`
- `ADMIN_SESSION_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:

- `SUPABASE_STORAGE_BUCKET`
- `SUPABASE_PORTFOLIO_STORAGE_BUCKET`
- `SUPABASE_CLIENT_GALLERY_STORAGE_BUCKET`
- `SUPABASE_SIGN_CLIENT_IMAGES`
- `REVIEW_NOTIFICATION_ENDPOINT`
- `FORMSPREE_ENDPOINT`

Keine Secrets in GitHub, Screenshots oder Uebergabe-Dateien speichern.

## Deployment

Deployment laeuft ueber GitHub und Vercel:

```bash
git status --short
git add <dateien>
git commit -m "Beschreibung"
git push
```

Nach `git push` baut Vercel automatisch eine neue Production-Version.

## Aktueller Fokus

Nicht doppelt bauen: Kundenkonto, Kundengalerien, QR-Codes, ZIP-Archive, Wasserzeichen, Wartungsmodus, Fehlerprotokoll, Vertraege/Termine und lokale SEO-Seiten sind bereits vorhanden.

Sinnvolle naechste Arbeiten:

- Admin auf echtem Handy weiter gezielt testen
- Datenschutz/Impressum rechtlich final pruefen lassen
- alte lokale Design- und Uebergabe-Artefakte bewusst archivieren oder auslagern
- Google Search Console und Google Unternehmensprofil beobachten
- Backup- und Loeschroutine bei echten Kundendaten praktisch einhalten
