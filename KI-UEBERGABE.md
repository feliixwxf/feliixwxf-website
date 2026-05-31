# feliix.wxf Website - KI-Übergabe

Stand: 31.05.2026

Diese Datei ist für eine andere Coding-KI oder einen Entwickler gedacht, damit das Projekt ohne langes Einlesen weitergeführt werden kann.

## Kurzüberblick

Website für `feliix.wxf` Fotografie mit öffentlicher Website, Adminbereich, Kundenkonto, Kundengalerien, Portfolio-Verwaltung und Bewertungsworkflow.

Tech Stack:
- Next.js `16.2.6`
- React `19.2.4`
- Tailwind CSS
- Framer Motion
- Lucide Icons
- Supabase für Bewertungen, Kundenkonten, Portfolio-Bilder, Titelbilder, Website-Texte und Kundengalerien
- Formspree für Kontaktformular und E-Mail-Benachrichtigung bei neuen Bewertungen
- Vercel Deployment über GitHub

Live-Domain:
- `https://www.feliixwxf.de`

Wichtige Bereiche:
- Website: `/`
- Kundenkonto: `/konto`
- Kundengalerie per Code: `/kunden`
- Adminbereich: `/admin`

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
- wenn Port belegt ist, nimmt Next.js automatisch z. B. `3001`

## Wichtige Dateien

Hauptseite:
- `app/page.js`

Kundenkonto:
- `app/konto/page.js`

Kundengalerie:
- `app/kunden/page.js`

Adminbereich:
- `app/admin/page.js`

Globale Styles:
- `app/globals.css`

Supabase-Hilfe:
- `app/api/_lib/supabase.js`
- `app/api/_lib/storage.js`

Admin-Auth:
- `app/api/admin/_lib/auth.js`

Kundenkonto-Auth:
- `app/api/account/_lib/auth.js`

## Environment Variables in Vercel

Benötigt:
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET` mindestens 32 Zeichen lang
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

Hinweise:
- `SUPABASE_SERVICE_ROLE_KEY` nur serverseitig verwenden.
- Keine echten Secrets in Code, Screenshots oder Übergabe-Dateien speichern.
- `SUPABASE_CLIENT_GALLERY_STORAGE_BUCKET` ist optional. Ohne Variable nutzt die App `client-galleries`.
- `SUPABASE_SIGN_CLIENT_IMAGES` sollte nicht auf `false` stehen. Ohne Variable sind signierte Kundengalerie-Links aktiv.
- Für neue Bewertungs-E-Mails nutzt `app/api/reviews/route.js` diese Reihenfolge:
  `REVIEW_NOTIFICATION_ENDPOINT`, dann `FORMSPREE_ENDPOINT`, dann Fallback `https://formspree.io/f/xqennvyy`.
- Wenn Felix den Formspree-Link nicht ändert, muss in Vercel für die Bewertungs-E-Mail nichts Neues gesetzt werden.

## Supabase Setup

SQL-Dateien im Projekt:
- `supabase-admin-setup.sql`
- `supabase-review-moderation.sql`
- `supabase-portfolio-sort.sql`
- `supabase-portfolio-metadata.sql`
- `supabase-site-assets.sql`
- `supabase-site-settings.sql`
- `supabase-client-galleries.sql`
- `supabase-security-hardening.sql`

Wichtige Tabellen:
- `reviews`
- `portfolio_images`
- `site_assets`
- `site_settings`
- `client_galleries`
- `client_gallery_images`
- `client_favorites`
- `customer_users`
- `customer_sessions`

Storage:
- Öffentlicher Bucket `portfolio`
  - Portfolio-Bilder
  - Startseitenbilder
  - Portfolio-Titelbilder
  - Profilbilder
- Privater Bucket `client-galleries`
  - neue Kundengalerie-Bilder
  - wird über `supabase-client-galleries.sql` angelegt
  - muss `public = false` sein
  - Bilder werden serverseitig über zeitlich begrenzte signierte URLs ausgeliefert

## Bewertungen

Besucher und eingeloggte Kunden können Bewertungen schreiben.

Workflow:
1. Bewertung wird über `app/api/reviews/route.js` gespeichert.
2. Neue Bewertungen sind standardmäßig `is_approved = false`.
3. Admin kann Bewertungen im Adminbereich freigeben oder löschen.
4. Erst freigegebene Bewertungen erscheinen öffentlich.
5. Bei einer neuen Bewertung wird zusätzlich eine E-Mail-Benachrichtigung über Formspree ausgelöst.

Wichtig:
- Die E-Mail-Benachrichtigung ist absichtlich nicht blockierend. Wenn Formspree kurz nicht antwortet, bleibt die Bewertung trotzdem gespeichert.
- Wenn ein Kunde sein Konto löscht, bleiben Bewertungen bestehen, aber die Konto-Verknüpfung wird entfernt und `account_deleted_at` gesetzt.
- Profilbild und Benutzername können bei Bewertungen angezeigt werden.
- Der Bewertungsname ist im Formular vorbefüllt, kann aber geändert werden.

Wichtige Dateien:
- `app/api/reviews/route.js`
- `app/api/admin/reviews/route.js`
- `app/page.js`
- `app/admin/page.js`

## Kundenkonto

Kunden können ein Konto erstellen, sich einloggen und Galerien mit ihrem Konto verknüpfen.

Funktionen:
- Registrierung mit Datenschutz-Haken
- Login und Logout
- Passwort anzeigen/ausblenden
- Benutzername
- Profilbild
- Galerie-Code mit Konto verknüpfen
- aktive und abgeschlossene Galerien sehen
- Favoriten zählen
- Downloadstatus sehen
- Konto löschen

Konto löschen:
- löscht Kundenkonto, Session, Profilbild, Favoriten und Galerie-Verknüpfungen
- Bewertungen bleiben aus Nachweis- und Moderationsgründen bestehen
- wenn eine Bewertung gelöscht werden soll, muss der Kunde Felix per E-Mail kontaktieren

Wichtige Dateien:
- `app/konto/page.js`
- `app/api/account/register/route.js`
- `app/api/account/login/route.js`
- `app/api/account/logout/route.js`
- `app/api/account/session/route.js`
- `app/api/account/profile/route.js`
- `app/api/account/avatar/route.js`
- `app/api/account/galleries/route.js`
- `app/api/account/delete/route.js`

## Kundengalerien

Kundengalerien funktionieren über Code, QR-Link und Kundenkonto.

Workflow:
1. Admin erstellt eine Galerie im Adminbereich.
2. Admin lädt Bilder hoch.
3. Admin kann Downloads aktivieren/deaktivieren.
4. Admin kann Cover, Hero-Banner, Titel, persönliche Nachricht und Status pflegen.
5. Kunde öffnet `/kunden` per Code oder QR-Link.
6. Kunde kann Galerie später im Konto verknüpfen.

Funktionen:
- QR-Code für Galerie-Zugriff
- Favoriten
- abgeschlossene Galerien
- Downloadschutz mit Wasserzeichen, wenn Downloads aus sind
- persönliche Begrüßung und Nachricht
- Galerie kann über Kundenkonto erneut geöffnet werden
- neue Kundenbilder liegen im privaten Supabase-Bucket `client-galleries`
- Kundenbilder werden über signierte URLs ausgeliefert

Wichtig zu alten Kundengalerie-Bildern:
- Bilder, die vor der privaten Bucket-Umstellung hochgeladen wurden, können noch im öffentlichen `portfolio`-Bucket liegen.
- Der Code lässt alte Bilder als Fallback sichtbar, damit keine Galerie plötzlich leer ist.
- Für maximalen Datenschutz sollten alte Kundengalerie-Bilder bei Gelegenheit neu hochgeladen oder migriert werden.

Wichtige Dateien:
- `app/kunden/page.js`
- `app/api/client-gallery/route.js`
- `app/api/client-gallery/favorites/route.js`
- `app/api/account/galleries/route.js`
- `app/api/_lib/storage.js`
- `app/api/admin/client-galleries/route.js`
- `app/api/admin/client-gallery-images/route.js`
- `supabase-client-galleries.sql`

## Adminbereich

Der Adminbereich ist in übersichtliche Arbeitsbereiche aufgeteilt.

Hauptbereiche:
- Dashboard
- Kunden/Galerien
- Bewertungen
- Portfolio
- Titelbilder
- Website-Texte
- Kontakt/Datenschutz

Admin kann:
- Portfolio-Bilder hochladen, sortieren, löschen und beschriften
- Portfolio-Titelbilder separat verwalten
- Startseitenbilder ändern
- Kundengalerien erstellen und bearbeiten
- Kundengalerie-Bilder hochladen und löschen
- Coverbilder und Hero-Banner pro Shooting setzen
- Galerie-Codes und QR-Codes verwenden
- Downloads aktivieren/deaktivieren
- Checklisten und Abschlussstatus pflegen
- Bewertungen freigeben oder löschen
- Website-Texte und Kontaktinfos ändern

Sicherheitsdetails:
- Admin-Login nutzt HTTP-only Session-Cookie
- Admin-Löschaktionen sind zusätzlich abgesichert
- gefährliche Löschaktionen verlangen Bestätigung

## Portfolio

Kategorien:
- `car`
- `portrait`
- `nature`
- `event`

Wichtig:
- Galerie-Bilder sind getrennt von Portfolio-Titelbildern.
- Uploads ändern nicht automatisch die Kacheln auf der Startseite.
- Die Reihenfolge kann im Adminbereich sortiert werden.
- Mehrfachauswahl für sichtbare Bilder ist vorhanden.

Wichtige Dateien:
- `app/api/portfolio-images/route.js`
- `app/api/admin/images/route.js`
- `supabase-portfolio-sort.sql`
- `supabase-portfolio-metadata.sql`

## Titelbilder und Website-Texte

Admin kann ändern:
- Startseiten-Vorher-Bild
- Startseiten-Nachher-Bild
- Portfolio-Kachelbilder
- Website-Texte
- Kontaktinfos
- Formspree-Link des Kontaktformulars
- Datenschutz- und Impressumstexte innerhalb der Website

Wichtige Dateien:
- `app/api/site-assets/route.js`
- `app/api/admin/site-assets/route.js`
- `app/api/site-settings/route.js`
- `app/api/admin/site-settings/route.js`
- `supabase-site-assets.sql`
- `supabase-site-settings.sql`

## Datenschutz und Sicherheit

Aktueller Stand:
- Datenschutz-Hinweise sind auf der Website vorhanden.
- Kontoerstellung verlangt einen Datenschutz-Haken.
- Konto kann gelöscht werden.
- Beim Löschen bleiben Bewertungen bestehen, aber ohne Konto-Verknüpfung.
- Kunden werden darauf hingewiesen, dass Bewertungs-Löschung per E-Mail angefragt werden kann.
- Neue Kundengalerie-Bilder werden privat gespeichert und über signierte Links angezeigt.
- Direkter öffentlicher Zugriff auf Kundengalerie-Tabellen wurde über RLS/Policies gehärtet.

Noch sinnvoll zu prüfen:
- Impressum und Datenschutzerklärung rechtlich final prüfen lassen.
- Supabase-E-Mail-Texte anpassen.
- Backup- und Löschfristen schriftlich festlegen.
- Alte Kundengalerie-Bilder aus dem früheren öffentlichen Bucket migrieren oder neu hochladen.

## Letzter technischer Stand

Letzte größere Änderungen:
- Kundengalerie-Uploads wurden auf den privaten Supabase-Bucket `client-galleries` umgestellt.
- Kundengalerie-Bilder werden in Adminbereich, Kundenkonto und Kundengalerie über signierte URLs angezeigt.
- Der Upload prüft jetzt, ob `SUPABASE_SERVICE_ROLE_KEY` vorhanden ist, und zeigt technische Upload-Details im Adminbereich an.
- Der private Bucket muss in Supabase Storage existieren. Falls Supabase ihn nicht automatisch anlegt, manuell erstellen: `client-galleries`, Public aus.
- Kundenbereich optisch aufgeräumt und mit Statistik-/Profilkarten verbessert.
- Leerer Kundenkonto-Zustand klarer erklärt und Galerie-Code-Eingabe hervorgehoben.
- Eingeloggte Kunden sehen auf der Website im Header ihren Benutzernamen statt nur `Konto`.
- Benutzername ist bei der Kontoerstellung Pflichtfeld.
- Neue Bewertungen lösen eine E-Mail-Benachrichtigung an Felix aus.
- Kundenkonto-Löschung bleibt datenschutzfreundlich, Bewertungen bleiben aber nachvollziehbar erhalten.

Vor Übergabe oder Deployment prüfen:

```bash
npm run build
git status --short
git push
```

Letzter bekannter Build:
- `npm run build` erfolgreich am 31.05.2026.

## Wichtige Hinweise für eine nächste KI

- Bestehende Supabase-Struktur nicht ohne Not umbauen.
- Kein `SUPABASE_SERVICE_ROLE_KEY` im Client verwenden.
- Admin-Änderungen möglichst in bestehende Tabs integrieren, Felix möchte keine überladenen neuen Fenster.
- Bei UI-Änderungen besonders auf mobile Darstellung achten.
- Bei Kundengalerien Downloads und Wasserzeichen nicht umgehen.
- Bei Kundengalerie-Bildern immer `app/api/_lib/storage.js` nutzen, damit private Bucket-Signierung und alte Fallback-URLs erhalten bleiben.
- Bewertungen bleiben nach Konto-Löschung bewusst erhalten.
- Wenn neue Datenbankfelder nötig sind, SQL-Datei aktualisieren und Felix klar sagen, welche Datei in Supabase auszuführen ist.
