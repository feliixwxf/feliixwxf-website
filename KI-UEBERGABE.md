# feliix.wxf Website - KI-Übergabe

Stand: 04.08.2026

Diese Datei ist für eine andere Coding-KI oder einen Entwickler gedacht. Ziel: Das Projekt schnell verstehen, sicher weiterarbeiten und keine vorhandenen Funktionen doppelt bauen.

## Projekt

Fotografie-Website für `feliix.wxf` mit öffentlicher Website, Adminbereich, Kundenkonto, privaten Kundengalerien, Portfolio-Verwaltung, Bewertungen, Verträgen/Terminen, Wartungsmodus, lokalen SEO-Seiten und Datenschutz-/Sicherheitsfunktionen.

Live-Domain:
- `https://www.feliixwxf.de`

Wichtige Seiten:
- Startseite: `/`
- Kundenkonto: `/konto`
- Kundengalerie per Code/QR: `/kunden`
- Adminbereich: `/admin`
- Datenschutz: `/datenschutz`
- Impressum: `/impressum`
- Ortsseite Eisfeld: `/fotograf-eisfeld`
- Ortsseite Hildburghausen: `/fotograf-hildburghausen`

## Tech Stack

- Next.js `16.2.6`
- React `19.2.4`
- Tailwind CSS
- Framer Motion
- Lucide Icons
- Supabase für Datenbank, Auth, Storage und signierte Kundengalerie-Links
- Formspree für Kontaktformular und Bewertungsbenachrichtigungen
- Vercel Deployment über GitHub
- Supabase Storage Image Transform für Startseitenbilder

## Wichtige Befehle

```bash
npm install
npm run dev
npm run build
git status --short
git pull
git add <dateien>
git commit -m "Beschreibung"
git push
```

Lokale Entwicklung:
- meistens `http://localhost:3000`
- wenn Port belegt ist, nimmt Next.js automatisch z. B. `3001`

## Git-Stand

Letzter bekannter Commit:
- `77d4fe9 Use Supabase image transforms for hero assets`

Wichtige letzte Änderungen:
- Vorher-Nachher-Hero nutzt jetzt Supabase Image Transform statt serverseitiger Sharp-Umrechnung auf Vercel.
- Hero-Bilder nutzen responsive Bildgrößen.
- Presselink, starke Startseiten-CTA und Galerie-CTA wurden ergänzt.
- Datenschutz, Einwilligungstexte, noindex für Konto/Kunden und strukturierte Daten wurden verbessert.
- Eisfeld- und Hildburghausen-Seiten wurden SEO-technisch erweitert.
- Bewertungsübersicht lädt mit stabilem Initialwert, damit die Anzeige nicht sichtbar springt.

Lokal liegen außerdem einige alte Design-/PDF-/ZIP-Artefakte untracked oder geändert im Projektordner. Diese nicht versehentlich mit App-Code committen, wenn nur Website-Code geändert wird.

## Wichtige Dateien

App:
- `app/page.js` - Startseite, Portfolio, Bewertungen, Kontakt, Chatbot-Einbindung
- `app/layout.js` - globale Metadaten, OpenGraph, JSON-LD
- `app/globals.css` - globale Styles
- `app/konto/page.js` - Kundenkonto
- `app/kunden/page.js` - Kundengalerie
- `app/admin/page.js` - Adminbereich
- `app/fotograf-eisfeld/page.js` - Ortsseite Eisfeld
- `app/fotograf-hildburghausen/page.js` - Ortsseite Hildburghausen
- `app/datenschutz/page.js`
- `app/impressum/page.js`
- `app/robots.js`
- `app/sitemap.js`

Komponenten:
- `components/before-after-slider.js`
- `components/faq-chatbot.js`
- `components/user-error-reporter.js`
- `components/report-user-error-button.js`
- `components/legal-back-button.jsx`
- `components/ui/button.jsx`
- `components/ui/card.jsx`

Server/API:
- `app/api/_lib/supabase.js`
- `app/api/_lib/storage.js`
- `app/api/_lib/gallery-session.js`
- `app/api/_lib/spam-protection.js`
- `app/api/reviews/route.js`
- `app/api/contact-inquiries/route.js`
- `app/api/portfolio-images/route.js`
- `app/api/portfolio-images/download/route.js`
- `app/api/site-assets/image/[key]/route.js`
- `app/api/client-gallery/route.js`
- `app/api/client-gallery/download/route.js`
- `app/api/client-gallery/favorites/route.js`
- `app/api/account/*`
- `app/api/admin/*`

SQL/Doku:
- `supabase-admin-setup.sql`
- `supabase-review-moderation.sql`
- `supabase-client-galleries.sql`
- `supabase-portfolio-metadata.sql`
- `supabase-portfolio-sort.sql`
- `supabase-site-assets.sql`
- `supabase-site-settings.sql`
- `supabase-contact-inquiries.sql`
- `supabase-contracts-schedule.sql`
- `supabase-user-error-logs.sql`
- `supabase-security-hardening.sql`
- `SUPABASE_EMAIL_TEMPLATES.md`
- `AUFBEWAHRUNG_LOESCHKONZEPT.md`
- `SICHERHEIT_DATENSCHUTZ.md`

## Environment Variables in Vercel

Pflicht:
- `ADMIN_PASSWORD`
- `ADMIN_ACCESS_CODE`
- `ADMIN_SESSION_SECRET` mindestens 32 Zeichen lang
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional/empfohlen:
- `SUPABASE_STORAGE_BUCKET`
- `SUPABASE_PORTFOLIO_STORAGE_BUCKET`
- `SUPABASE_CLIENT_GALLERY_STORAGE_BUCKET`
- `SUPABASE_SIGN_CLIENT_IMAGES`
- `REVIEW_NOTIFICATION_ENDPOINT`
- `FORMSPREE_ENDPOINT`

Wichtig:
- `SUPABASE_SERVICE_ROLE_KEY` darf nur serverseitig verwendet werden.
- Keine Secrets in Code, Screenshots, Markdown oder ZIP-Übergaben speichern.
- Ohne `SUPABASE_CLIENT_GALLERY_STORAGE_BUCKET` nutzt die App `client-galleries`.
- `SUPABASE_SIGN_CLIENT_IMAGES` sollte nicht auf `false` stehen.
- Bewertungsbenachrichtigung nutzt zuerst `REVIEW_NOTIFICATION_ENDPOINT`, dann `FORMSPREE_ENDPOINT`, dann Fallback `https://formspree.io/f/xqennvyy`.

## Supabase Struktur

Wichtige Tabellen:
- `reviews`
- `portfolio_images`
- `site_assets`
- `site_settings`
- `client_galleries`
- `client_gallery_images`
- `client_favorites`
- Supabase Auth Users
- `account_profiles`
- `admin_documents`
- `admin_appointments`
- `admin_waitlist`
- `admin_activity_logs`
- `user_error_logs`
- `contact_inquiries`

Storage:
- Öffentlicher Bucket `portfolio`
  - Portfolio-Bilder
  - Startseitenbilder
  - Portfolio-Titelbilder
  - Profilbilder
- Privater Bucket `client-galleries`
  - Kundengalerie-Bilder
  - Kundengalerie-ZIP-Archive
  - `public = false`
  - Auslieferung über serverseitig erzeugte signierte Links

Wenn eine Supabase-Änderung nicht sichtbar wird:
1. passende SQL-Datei erneut ausführen
2. letzte Cache-Zeile in der SQL ausführen, falls vorhanden
3. Vercel redeployen
4. Browser hart neu laden

## Öffentliche Website

Vorhanden:
- Hero mit Vorher-Nachher-Slider
- direkte CTA: Shooting unverbindlich anfragen
- Button: Arbeiten ansehen
- Bewertungs-Trustline mit Anzahl, Durchschnitt und Sternen
- Portfolio-Galerien mit Lightbox, Navigation, Download und optionalem Wasserzeichen
- Galerie-CTA unter jeder Portfolio-Galerie
- Kontaktformular mit Erfolgsmeldung und Kamera-Blitz
- klickbare Telefonnummer und E-Mail
- Bewertungen mit optionalen Avataren/Profilbildern
- Chatbot/FAQ-Hilfe
- Wartungsmodus mit weiter nutzbarem Kontaktformular
- Datenschutz und Impressum als eigene Seiten

Performance:
- Hero-Bilder werden über `/api/site-assets/image/[key]?w=...` ausgeliefert.
- Die API leitet auf Supabase Image Transform weiter und setzt Cache-Header.
- Kein Live-Sharp-Rendering mehr in dieser Route, weil das Vorher-Nachher-Bild dadurch auf Vercel zu langsam wurde.
- Portfolio-Cover und weiter unten liegende Bilder sollen lazy geladen werden.

## Portfolio

Kategorien:
- `car`
- `portrait`
- `nature`
- `event`

Vorhanden:
- Portfolio-Bilder im Admin hochladen, sortieren, löschen, beschriften
- Mehrfachupload
- Bildzuschnitt/Layout-Vorschau für Kachelansicht
- Titelbilder separat verwalten
- Startseitenbilder separat verwalten
- archivierte Kategorien bleiben strukturell erhalten, werden aber öffentlich ausgeblendet
- Portrait und Nature wurden zwischenzeitlich archiviert
- Portfolio-Download kann optional ein feliix.wxf-Wasserzeichen erhalten
- Hochkant-Bilder in der Lightbox werden zentriert

Wichtig:
- Zuschnitt/Layout darf nur die Darstellung/Kachel betreffen, nicht die Originalansicht in der Lightbox zerstören.
- Uploads sollen komprimieren, aber nicht so stark, dass sichtbare Qualität verloren geht.
- Keine alten KI-Platzhalter wieder öffentlich einblenden.

## Bewertungen

Workflow:
1. Besucher oder eingeloggte Kunden schreiben Bewertung.
2. Bewertung wird in Supabase gespeichert.
3. Neue Bewertung ist standardmäßig nicht freigegeben.
4. Admin gibt frei oder löscht.
5. Freigegebene Bewertungen erscheinen öffentlich.
6. E-Mail-Benachrichtigung an Felix läuft über Formspree.

Vorhanden:
- öffentliche Bewertungsanzeige mit Anzahl, Durchschnitt und halben Sternen
- Avatar-Auswahl optional und einklappbar
- Profilbild wird genutzt, wenn kein Avatar gewählt wurde
- Username wird vorbefüllt, kann für die Bewertung aber geändert werden
- Konto-Löschung entfernt Konto-Verknüpfung, Bewertung bleibt bestehen
- Bewertungslöschung durch Nutzer nur per E-Mail-Anfrage

Wichtig:
- Bewertungsformular darf beim Sterne-Auswählen nicht refreshen oder Text verlieren.
- Bewertungskarten dürfen beim Scrollen nicht über Modal-Header/Übersicht schieben.

## Kundenkonto

Vorhanden:
- Registrierung mit Pflicht-Benutzername
- optionale Telefonnummer schon bei Registrierung, später änderbar
- Datenschutz-Haken bei Registrierung
- Login/Logout
- Passwort anzeigen/ausblenden
- Passwort-zurücksetzen per E-Mail
- Profilbild
- Light/Dark Mode
- eingeloggter Nutzer erscheint oben im Website-Header mit Benutzernamen
- Galerie-Code mit Konto verknüpfen
- aktive/abgeschlossene Galerien
- Download-Datei/ZIP statt riesiger Bildliste, wenn Galerie abgeschlossen ist
- Konto löschen mit klarer Bestätigung und Haken

Wichtig:
- Kundenkonto und Kundengalerie sind noindex/nofollow.
- Kundenkonto sollte nicht zu statistiklastig werden. Felix möchte es klar, ruhig und mobil gut bedienbar.
- Telefonnummer soll im Admin beim Kundenprofil sichtbar sein, wenn der Nutzer sie angegeben hat.

## Kundengalerien

Vorhanden:
- Galerie per Code
- QR-Code pro Galerie
- persönliche Begrüßung/Nachricht
- Coverbild und Hero-Banner
- Favoriten
- Download aktivierbar/deaktivierbar
- Wasserzeichen-Schutz bei deaktivierten Downloads
- Galerie abschließen
- ZIP-Archiv erzeugen
- ZIP-Archiv später im Kundenkonto und auf `/kunden` herunterladen
- private Supabase-Buckets
- signierte Links für Bilder und ZIPs

Wichtig:
- Galeriecodes nicht unnötig in sichtbaren/teilbaren URLs verwenden.
- Alte Bilder aus früherem öffentlichem Bucket können noch als Fallback funktionieren, sollten bei echten Kundenprojekten neu hochgeladen oder migriert werden.
- Bei neuen Kundengalerien immer den privaten Bucket nutzen.

## Adminbereich

Vorhandene Bereiche:
- Dashboard
- Kunden/Galerien
- Bewertungen
- Portfolio
- Titelbilder
- Website-Texte
- Kontakt/Datenschutz
- Verträge & Termine
- Nutzerfehler/Protokoll
- Einstellungen/Schnellzugriff

Admin kann:
- Portfolio verwalten
- Portfolio-Titelbilder verwalten
- Startseitenbilder tauschen
- Website-Texte/Kontaktinfos ändern
- Kundengalerien erstellen/bearbeiten/abschließen/löschen
- Galerie-ZIPs erzeugen
- Downloads aktivieren/deaktivieren
- Kundenkonten per E-Mail suchen
- Kundenprofile öffnen
- Profilbild, Telefonnummer, E-Mail, Username und Aktivität sehen
- Bewertungen freigeben/löschen
- Nutzerfehler ansehen/löschen
- Aktivitätsverlauf bereinigen
- Wartungsmodus aktivieren/deaktivieren
- Website-QR-Code für Visitenkarten herunterladen
- A4-Vertragsvorlage bearbeiten/drucken
- Termine und Warteliste verwalten

Wichtig:
- Adminbereich soll übersichtlich bleiben. Neue Funktionen lieber untergeordnet in bestehende Bereiche einbauen.
- Auf Handy ist Platz kritisch: große Tabellen, breite Buttonleisten und Modal-Fenster vermeiden.
- Löschaktionen sollen mit Haken/Bestätigung statt Texteingabe funktionieren.
- Admin-Code/Passwort nicht im Client auslesbar machen.

## Verträge & Termine

Vorhanden:
- Adminbereich für Verträge & Termine
- professionelle A4-Vertragsvorlage mit Logo
- Druck-/PDF-Vorschau
- Klausel: Terminverschiebung innerhalb der letzten 14 Tage, sonst kein Geld zurück
- Termine mit Datum, Uhrzeit, Name, Kontakt, Status
- kompakte Terminübersicht
- Warteliste/Notizen

Wichtig:
- PDF soll A4 bleiben und sich beim Druck nicht verschieben.
- Bei Textänderung darf die Vorschau nicht ständig zurückspringen/zoomen.

## Datenschutz und Sicherheit

Vorhanden:
- Datenschutzerklärung und Impressum als eigene Seiten
- Verantwortlicher mit Anschrift
- Hinweise zu Vercel, Supabase, Formspree, Kundenkonto, Kundengalerien, Bewertungen, Kontaktformular, Session-Cookies, lokalen Speicherungen, Betroffenenrechten
- Kontaktformular nutzt Honeypot/Spam-Schutz
- Admin-Login mit Passwort, Admin-Code und HTTP-only Session-Cookie
- Rate-Limits/Spam-Schutz an wichtigen Stellen
- CSP, HSTS, nosniff, Frame-Schutz, Referrer-Policy, Permissions-Policy in `next.config.mjs`
- Konto- und Kundenseiten mit `X-Robots-Tag: noindex, nofollow`
- private Kundengalerien mit signierten Links
- Aufbewahrungs- und Löschkonzept dokumentiert
- Nutzerfehler-Protokoll vorhanden

Noch manuell/rechtlich prüfen:
- AVV/DPA bei Vercel, Supabase und Formspree wirklich abgeschlossen und abgelegt
- Supabase-Projektregion dokumentieren
- Formspree-Speicherfrist und Vertrag im tatsächlichen Tarif prüfen
- Datenschutzerklärung final juristisch prüfen lassen
- Backup-/Löschroutine regelmäßig manuell einhalten

## SEO

Vorhanden:
- globale Metadata
- OpenGraph/Twitter mit Logo
- `msvalidate.01` für Bing
- `robots.js` erlaubt `OAI-SearchBot`
- Sitemap mit Startseite, Ortsseiten, Impressum und Datenschutz
- strukturierte Daten `WebSite` und `ProfessionalService`
- lokale SEO-Seiten für Eisfeld und Hildburghausen
- H1 auf Ortsseiten für `Fotograf in Eisfeld...` und `Fotograf in Hildburghausen...`
- Ortsseiten untereinander verlinkt
- lokale Leistungen: Portraits, Hochzeiten, Car Photography, Events
- Pressereferenz inSüdthüringen:
  `https://www.insuedthueringen.de/inhalt.sbsz-hildburghausen-abikropolis-abiturienten-verlassen-den-olymp.f37f4fe5-bc8f-4a78-bb17-948d220d264d.html`

Wichtig:
- Google Search Console weiter beobachten.
- Bing Webmaster prüfen, falls Sitemap-Einreichung hakt.
- Google Unternehmensprofil aktuell halten.
- Mehr echte lokale Inhalte/Bilder helfen langfristig mehr als Keyword-Wiederholung.

## Lokale Artefakte

Im Projektordner liegen einige Design- und Übergabe-Dateien, die nicht direkt zur App gehören:
- Bewertungskarte PNG/SVG/PDF/HTML
- QR-Karte HTML/SVG
- Google-Logo PNG/SVG
- Poster/Prompt-Dateien
- Visitenkarten PNG/SVG/PDF
- ältere ZIP-Übergaben
- `scripts/`

Diese Dateien nicht automatisch löschen. Wenn aufgeräumt werden soll, vorher entscheiden, was archiviert wird.

## Bekannte offene Punkte

Relevant und noch sinnvoll:
1. Datenschutz final rechtlich prüfen lassen.
2. Google Search Console weiter beobachten, besonders Weiterleitungen und Indexierung.
3. Bing Sitemap-Berechtigung prüfen.
4. Auf echtem Handy Adminbereich und Kundenkonto in Ruhe durchtesten.
5. Hero-/Portfolio-Bilder weiterhin im Blick behalten, weil Bildgröße der größte Ladezeitfaktor bleibt.
6. Untracked lokale Design-Artefakte bewusst archivieren oder aus dem Projektordner verschieben.
7. README noch zu einer echten Projektbeschreibung umbauen, falls externe Entwickler/KIs häufiger übernehmen sollen.
8. Echte Kundendaten regelmäßig sichern/löschen nach Löschkonzept.

Nicht mehr als offene Aufgabe doppelt vorschlagen:
- Kundenkonto
- private Kundengalerien
- QR-Codes
- ZIP-Archive
- Wasserzeichen
- Wartungsmodus
- Fehlerprotokoll
- Admin-Kundensuche
- Verträge & Termine
- lokale SEO-Seiten
- Datenschutzseiten
- OpenGraph/Favicon
- Bing Meta Tag

## Übergabe-Regeln für nächste KI

- Erst `git status --short` prüfen.
- Unrelated lokale Artefakte nicht committen.
- Keine Secrets ausgeben oder in Dateien schreiben.
- Supabase-Service-Key niemals clientseitig verwenden.
- Neue DB-Felder immer auch in passender SQL-Datei ergänzen.
- Nach SQL-Änderungen Felix klar sagen, welche SQL-Datei in Supabase auszuführen ist.
- Bei UI-Arbeit Desktop und Handy beachten.
- Adminbereich nicht weiter überladen.
- Bei Bildern auf Dateigröße, Lazy Loading, responsive Größen und Cache achten.
- Bei Kundengalerien private Buckets, RLS und signierte Links nicht umgehen.

## Letzte Prüfung

Letzter bekannter Build:
- `npm run build` erfolgreich am 04.08.2026

Vor jeder Übergabe oder jedem Deployment:

```bash
npm run build
git status --short
git push
```
