# feliix.wxf Website - KI-Übergabe

Stand: 18.05.2026

Diese Datei ist für eine andere Coding-KI oder einen Entwickler gedacht, damit das Projekt schnell weitergeführt werden kann.

## Kurzüberblick

Website für `feliix.wxf` Fotografie.

Tech Stack:
- Next.js `16.2.6`
- React `19.2.4`
- Tailwind CSS
- Framer Motion
- Lucide Icons
- Supabase für Bewertungen, Portfolio-Bilder, Titelbilder und Kontaktinfos
- Vercel Deployment über GitHub

Live-Domain:
- `https://www.feliixwxf.de`

Adminbereich:
- `/admin`

## Wichtige Befehle

```bash
npm install
npm run dev
npm run build
git status --short
git add .
git commit -m "Beschreibung"
git push
```

Lokale Entwicklung läuft meistens auf:
- `http://localhost:3000`
- falls Port belegt ist, nimmt Next.js automatisch z. B. `3001`

## Wichtige Dateien

Hauptseite:
- `app/page.js`

Adminbereich:
- `app/admin/page.js`

UI-Komponenten:
- `components/ui/button.jsx`
- `components/ui/card.jsx`

Globale Styles:
- `app/globals.css`

Supabase-Hilfsdatei:
- `app/api/_lib/supabase.js`

Admin-Auth:
- `app/api/admin/_lib/auth.js`

## API-Routen

Öffentlich:
- `app/api/reviews/route.js`
- `app/api/portfolio-images/route.js`
- `app/api/site-assets/route.js`
- `app/api/site-settings/route.js`

Admin:
- `app/api/admin/login/route.js`
- `app/api/admin/logout/route.js`
- `app/api/admin/session/route.js`
- `app/api/admin/reviews/route.js`
- `app/api/admin/images/route.js`
- `app/api/admin/site-assets/route.js`
- `app/api/admin/site-settings/route.js`

## Environment Variables in Vercel

Benötigt:
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:
- `SUPABASE_STORAGE_BUCKET`

Standard-Bucket im Code:
- `portfolio`

Wichtig:
- Keine echten Secrets in Code, Screenshots oder Übergabe-Dateien speichern.
- `SUPABASE_SERVICE_ROLE_KEY` nur serverseitig verwenden.

## Supabase Setup

SQL-Dateien im Projekt:
- `supabase-admin-setup.sql`
- `supabase-review-moderation.sql`
- `supabase-portfolio-sort.sql`
- `supabase-site-assets.sql`
- `supabase-site-settings.sql`

Tabellen:
- `reviews`
- `portfolio_images`
- `site_assets`
- `site_settings`

Storage:
- Bucket `portfolio`
- Darin liegen Portfolio-Bilder und Admin-gesteuerte Titelbilder.

## Bewertungen

Besucher können Bewertungen schreiben.

Workflow:
1. Besucher schreibt Bewertung.
2. Bewertung wird in Supabase gespeichert.
3. Neue Bewertung ist standardmäßig `is_approved = false`.
4. Admin gibt Bewertung im Adminbereich frei.
5. Erst dann erscheint sie öffentlich auf der Website.

Wichtige Dateien:
- Public API: `app/api/reviews/route.js`
- Admin API: `app/api/admin/reviews/route.js`
- Admin UI: `app/admin/page.js`

## Portfolio-Bilder

Portfolio-Galeriebilder werden im Adminbereich hochgeladen.

Kategorien:
- `car`
- `portrait`
- `nature`
- `event`

Wichtig:
- Galerie-Bilder sind getrennt von Portfolio-Titelbildern.
- Uploads ändern nicht automatisch die Kacheln auf der Startseite.
- Reihenfolge kann im Adminbereich sortiert werden.
- Im Adminbereich gibt es Suche, Kategorie-Filter sowie optionale Bildnamen und Notizen.
- Portfolio-Bilder koennen im Admin nach eigener Reihenfolge, neuesten oder aeltesten Uploads sortiert werden.
- Mehrfachauswahl ist fuer sichtbare Bilder vorhanden, inklusive gesammelt loeschen.
- Fuer Bildnamen und Notizen muss einmal `supabase-portfolio-metadata.sql` ausgefuehrt werden.

Wichtige Dateien:
- Public API: `app/api/portfolio-images/route.js`
- Admin API: `app/api/admin/images/route.js`
- Admin UI: `app/admin/page.js`
- SQL-Erweiterung: `supabase-portfolio-metadata.sql`

## Titelbilder

Admin kann diese Bilder direkt ändern:
- Startseite Vorher-Bild
- Startseite Nachher-Bild
- Portfolio-Kachel Car
- Portfolio-Kachel Portrait
- Portfolio-Kachel Nature & Street
- Portfolio-Kachel Event

Wichtige Dateien:
- Public API: `app/api/site-assets/route.js`
- Admin API: `app/api/admin/site-assets/route.js`
- SQL: `supabase-site-assets.sql`

Fallback-Bilder stehen in `app/page.js` in `DEFAULT_SITE_ASSETS`.

## Kontaktinfos

Admin kann folgende Kontaktinfos ändern:
- Kontakt-Überschrift
- Kontakt-Text
- E-Mail
- Telefon
- Instagram-Link
- Instagram-Anzeige-Name
- Formspree/Formular-Link

Wichtige Dateien:
- Public API: `app/api/site-settings/route.js`
- Admin API: `app/api/admin/site-settings/route.js`
- SQL: `supabase-site-settings.sql`

Fallback-Werte stehen in `app/page.js` und `app/admin/page.js` in `DEFAULT_SITE_SETTINGS`.

## Website-Texte

Admin kann folgende Texte ändern:
- Startseiten-Kicker
- Startseiten-Headline Zeile 1
- Startseiten-Headline Zeile 2
- Startseiten-Untertext
- Info-Kicker
- Info-Überschrift
- Info-Text
- Portfolio-Kicker
- Portfolio-Überschrift
- Bewertungs-Kicker
- Bewertungs-Überschrift
- Bewertungsformular-Kicker
- Bewertungsformular-Überschrift
- Bewertungsformular-Text

Diese Werte werden ebenfalls in `site_settings` gespeichert.

Wichtige Dateien:
- Public API: `app/api/site-settings/route.js`
- Admin API: `app/api/admin/site-settings/route.js`
- Admin UI: `app/admin/page.js`
- Website UI: `app/page.js`

## Adminbereich

Der Adminbereich ist absichtlich strukturiert, damit er nicht unübersichtlich wird.

Tabs:
- Start
- Portfolio
- Titelbilder
- Texte
- Kontakt
- Bewertungen
- Einstellungen

Design-Idee:
- Links Übersicht und Navigation
- Rechts aktiver Arbeitsbereich
- Keine Vermischung von Uploads, Kontaktinfos und Bewertungen

## Bekannte wichtige Hinweise

1. Wenn Admin-Funktionen nicht speichern:
   - Erst prüfen, ob die passende SQL-Datei in Supabase ausgeführt wurde.
   - Dann Vercel Environment Variables prüfen.
   - Danach neuen Deploy auslösen.

2. Wenn Bewertungen nur lokal oder nur auf einem Gerät sichtbar sind:
   - Prüfen, ob die Website wirklich Supabase nutzt.
   - Prüfen, ob `SUPABASE_URL` ohne `/rest/v1` oder mit `/rest/v1` korrekt behandelt wird. Der Code entfernt `/rest/v1` automatisch.

3. Wenn neue Änderungen nicht live sind:
   - `git push`
   - Vercel Deployment abwarten, bis es `Ready/Current` ist.

4. Wenn localhost nicht geht:
   - Terminal prüfen, welchen Port Next.js nutzt.
   - Im Browser genau diesen Port öffnen.

## Aktueller Git-Stand

Letzte wichtige Commits:
- `596fa8f Add editable contact settings`
- `aeb0dbc Add admin dashboard overview`
- `6822dc2 Restructure admin workspace layout`
- `22be289 Add admin editable site images`
- `55529b7 Improve admin dashboard UI`
- `3a46eea Polish admin feedback`

## Sinnvolle nächste Schritte

1. Website-Texte im Admin bearbeitbar machen.
   Beispiele:
   - Startseiten-Headline
   - Startseiten-Untertext
   - Info-Text
   - Portfolio-Überschrift

2. Kundenbereich planen.
   Ziel:
   - Kundenkonto
   - private Galerie pro Kunde
   - Bilder herunterladen

3. Admin weiter verbessern.
   Beispiele:
   - Bildsuche
   - Bildnamen/Notizen
   - Warnung bei sehr großen Bildern
   - bessere Mobile-Admin-Ansicht

## Wichtige Arbeitsregel

Bei Änderungen am Code:
1. Kleine, klare Änderung machen.
2. `npm run build` ausführen.
3. Lokal im Browser testen.
4. Commit erstellen.
5. Pushen.
6. Vercel Deployment abwarten.
