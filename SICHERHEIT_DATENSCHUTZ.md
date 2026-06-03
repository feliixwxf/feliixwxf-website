# Sicherheit und Datenschutz

Kurzcheck fuer die aktuelle Website mit Kundenkonten, Kundengalerien und Bewertungen.

## Sofort wichtig

- `SUPABASE_SERVICE_ROLE_KEY` darf nur in Vercel Environment Variables liegen, nie im Browser-Code und nie in GitHub.
- Vercel, Supabase und GitHub sollten mit Zwei-Faktor-Login abgesichert sein.
- `ADMIN_PASSWORD` lang und einzigartig halten.
- `ADMIN_SESSION_SECRET` muss mindestens 32 Zeichen haben.
- Supabase SQL-Datei `supabase-security-hardening.sql` nach den Setup-Dateien ausfuehren.
- Bewertungen werden serverseitig gespeichert. Dafuer muss `SUPABASE_SERVICE_ROLE_KEY` in Vercel gesetzt sein.

## Kundendaten

Gespeichert werden koennen:

- E-Mail-Adresse und Nutzername
- Profilbild
- Galerie-Zuordnung und Galerie-Code
- Favoriten
- Download-Freigaben
- Bewertungen

Wenn ein Kunde Loeschung verlangt, muessen Konto, Profilbild, Bewertungen und Galerie-Verknuepfung geprueft und geloescht oder anonymisiert werden. Die praktische Arbeitsregel steht in `AUFBEWAHRUNG_LOESCHKONZEPT.md`.

## Aufbewahrung und Loeschung

Das Projekt hat jetzt ein eigenes Aufbewahrungs- und Loeschkonzept:

- Datei: `AUFBEWAHRUNG_LOESCHKONZEPT.md`
- Kundengalerien nach Abschluss auf `Abgeschlossen` setzen.
- Ablaufdatum oder interne Notiz setzen, wann die Galerie erneut geprueft wird.
- Downloads nur aktiv lassen, wenn der Kunde sie wirklich braucht.
- Abgeschlossene Kundengalerien nach 3 bis 12 Monaten pruefen, je nach Absprache.
- Konto-Loeschung entfernt Kundenkonto, Sessions, Profilbild, Favoriten und Galerie-Verknuepfungen.
- Bewertungen bleiben nach Konto-Loeschung bestehen, aber ohne Konto-Verknuepfung.
- Code-Backups und Uebergabe-ZIPs duerfen keine Secrets enthalten und sollten nicht in GitHub hochgeladen werden.

## Bilder und Galerien

Portfolio-Medien liegen weiterhin im oeffentlichen Storage-Bucket. Neue Kundengalerie-Uploads werden im privaten Bucket `client-galleries` gespeichert und in Kundenkonto, Kundengalerie und Adminbereich ueber zeitlich begrenzte signierte Bildlinks ausgeliefert.

Wichtig:

- `supabase-client-galleries.sql` legt den privaten Bucket an und setzt ihn auf `public = false`.
- `SUPABASE_SERVICE_ROLE_KEY` muss in Vercel gesetzt sein, weil der Server die signierten Bildlinks erzeugt.
- `SUPABASE_SIGN_CLIENT_IMAGES` sollte nicht auf `false` stehen.
- Alte Kundengalerie-Bilder aus dem frueheren oeffentlichen Bucket koennen als Fallback noch sichtbar bleiben. Fuer maximalen Schutz sollten alte Kundengalerien bei Gelegenheit neu hochgeladen oder migriert werden.
- Downloads duerfen nur bei aktiver Freigabe angeboten werden.

## Datenschutztext

Die Datenschutz-Hinweise auf der Website wurden um Kundenkonten, Kundengalerien, Bewertungen, Supabase, Vercel, Formspree, Session-Cookies, lokale Speicherung, Rechtsgrundlagen, Speicherdauer, Betroffenenrechte und Auftragsverarbeitung erweitert.

Noch manuell/offiziell pruefen:

- Impressum mit vollstaendiger ladungsfaehiger Anschrift und aktuellen Anbieterangaben nach § 5 DDG.
- Datenschutzerklaerung rechtlich pruefen lassen, bevor echte Kundendaten in groesserem Umfang verarbeitet werden.
- AVV/Auftragsverarbeitungsvertraege fuer Supabase, Vercel und Formspree pruefen/abschliessen.
- Loesch- und Aufbewahrungsfristen aus `AUFBEWAHRUNG_LOESCHKONZEPT.md` regelmaessig pruefen und bei Bedarf an echte Kundenabsprachen anpassen.
- Supabase Auth E-Mail-Texte, Absender und Links passend zur Domain konfigurieren.
- Vorlagen fuer Supabase Auth liegen in `SUPABASE_EMAIL_TEMPLATES.md`.
