# Sicherheit und Datenschutz

Kurzcheck fuer die aktuelle Website mit Kundenkonten, Kundengalerien und Bewertungen.

## Sofort wichtig

- `SUPABASE_SERVICE_ROLE_KEY` darf nur in Vercel Environment Variables liegen, nie im Browser-Code und nie in GitHub.
- Vercel, Supabase und GitHub sollten mit Zwei-Faktor-Login abgesichert sein.
- `ADMIN_PASSWORD` lang und einzigartig halten.
- `ADMIN_SESSION_SECRET` muss mindestens 32 Zeichen haben.
- Supabase SQL-Datei `supabase-security-hardening.sql` nach den Setup-Dateien ausfuehren.

## Kundendaten

Gespeichert werden koennen:

- E-Mail-Adresse und Nutzername
- Profilbild
- Galerie-Zuordnung und Galerie-Code
- Favoriten
- Download-Freigaben
- Bewertungen

Wenn ein Kunde Loeschung verlangt, muessen Konto, Profilbild, Bewertungen und Galerie-Verknuepfung geprueft und geloescht oder anonymisiert werden.

## Bilder und Galerien

Aktuell liegen Medien in einem oeffentlichen Storage-Bucket. Das ist fuer Portfolio-Bilder okay. Fuer private Kundengalerien waere langfristig besser:

- eigener privater Bucket fuer Kundengalerien
- signierte Links statt dauerhaft oeffentliche Bild-URLs
- Ablaufdatum pro Galerie
- Downloads nur bei aktiver Freigabe

## Datenschutztext

Die Datenschutz-Hinweise auf der Website wurden um Kundenkonten, Kundengalerien, Bewertungen, Supabase und Vercel erweitert. Fuer rechtssichere Nutzung sollte der Text spaeter durch eine passende Datenschutzerklaerung ersetzt oder anwaltlich geprueft werden.
