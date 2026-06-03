# Aufbewahrungs- und Löschkonzept

Stand: 03.06.2026

Dieses Dokument beschreibt die praktische Datenpflege für `feliix.wxf`. Es ist keine Rechtsberatung, sondern eine Arbeitsregel für Admin, Support und spätere Weiterentwicklung.

## Grundregel

- Nur Daten speichern, die für Website, Kundenkonto, Kundengalerie, Bewertung oder Abwicklung nötig sind.
- Kundengalerien regelmäßig prüfen: aktiv, abgeschlossen, Downloads an/aus, Ablaufdatum gesetzt.
- Löschung immer zuerst im Adminbereich prüfen, damit nicht versehentlich aktive Kundenbilder entfernt werden.
- Gesetzliche Aufbewahrungspflichten für Rechnungen, Buchhaltung und Verträge bleiben unberührt und werden außerhalb dieser Website behandelt.

## Empfohlene Fristen

| Datenart | Zweck | Empfohlene Aufbewahrung | Maßnahme |
| --- | --- | --- | --- |
| Kundenkonto | Login, Profil, Galerie-Zuordnung | Bis Kunde das Konto löscht oder Löschung verlangt | Konto im Kundenbereich löschen lassen oder manuell prüfen |
| Kundengalerie online | Bildauswahl, Download, QR-Zugriff | Während Projekt läuft, danach prüfen | Nach Abschluss auf `Abgeschlossen` setzen, Ablaufdatum pflegen |
| Abgeschlossene Kundengalerie | Nachlieferung, Rückfragen, Auswahlhistorie | 3 bis 12 Monate nach Abschluss, je nach Absprache | Downloads deaktivieren oder Galerie löschen/archivieren |
| Kundengalerie-Bilder | Kundenbilder im privaten Bucket | So lange wie Galerie benötigt wird | Mit Galerie löschen oder vorher neu abstimmen |
| Favoriten | Kundenauswahl | So lange wie zugehörige Galerie besteht | Wird mit Galerie/Konto-Verknüpfung bereinigt |
| Bewertungen | Öffentliches Feedback und Moderation | Bis Widerruf/Löschwunsch oder manuelle Entfernung | Im Admin freigeben/löschen; bei Konto-Löschung Konto-Verknüpfung entfernen |
| Kontaktanfragen | Bearbeitung von Anfragen | 6 bis 12 Monate, außer Auftrag entsteht | E-Mail/Postfach regelmäßig bereinigen |
| Profilbilder | Kundenkonto und Bewertungen | Bis Konto-Löschung oder Bildwechsel | Beim Konto löschen entfernen |
| Portfolio-Bilder | Öffentliche Referenzen | Solange Veröffentlichung gewünscht/erlaubt ist | Bei Widerruf oder Projektende aus Portfolio entfernen |

## Admin-Arbeitsablauf pro Shooting

1. Galerie erstellen und Kundendaten eintragen.
2. Bilder hochladen und Downloads zunächst nur aktivieren, wenn der Kunde herunterladen darf.
3. Nach Auswahl/Abgabe die Checkliste abhaken.
4. Galerie auf `Abgeschlossen` setzen.
5. Ablaufdatum oder interne Notiz setzen, wann die Galerie geprüft werden soll.
6. Nach Ablauf prüfen:
   - Downloads noch nötig?
   - Kunde braucht weiteren Zugriff?
   - Bilder sollen offline archiviert oder gelöscht werden?
7. Wenn nicht mehr benötigt: Galerie über den Sicherheitsbereich im Admin löschen.

## Backup-Regel

- Code liegt in GitHub und Vercel. Keine Kundendaten oder geheimen Schlüssel in Git speichern.
- Übergabe-ZIPs dürfen lokal auf dem Mac liegen, sollten aber keine Secrets enthalten.
- Kundengalerie-Bilder liegen in Supabase Storage. Für echte Kundenprojekte regelmäßig entscheiden, ob ein separates Offline-Backup nötig ist.
- Backups mit Kundendaten nicht öffentlich teilen und nicht in GitHub hochladen.
- Wenn abgeschlossene Projekte als ZIP archiviert werden, sollte das Archiv nicht öffentlich liegen und nur dem jeweiligen Kunden zugänglich sein.

## Konto-Löschung

Wenn ein Kunde sein Konto löscht:

- Kundenkonto, aktive Sessions, Profilbild, Favoriten und Galerie-Verknüpfungen werden entfernt.
- Kundengalerien selbst bleiben im Admin bestehen, damit Felix das Projekt weiter verwalten kann.
- Bewertungen bleiben bestehen, aber die Konto-Verknüpfung wird entfernt und die Löschung wird markiert.
- Wenn der Kunde zusätzlich eine Bewertung löschen möchte, soll er Felix per E-Mail kontaktieren.

## Manuelle Prüfroutine

Einmal pro Monat im Adminbereich prüfen:

- Galerien ohne Ablaufdatum
- abgeschlossene Galerien, die noch aktiv erreichbar sind
- Galerien mit aktivierten Downloads
- alte Kontaktanfragen im E-Mail-Postfach
- öffentliche Bewertungen, die nicht mehr gewünscht sind
- Portfolio-Bilder, für die keine Veröffentlichung mehr gewünscht ist

## Später mögliche Automatisierung

Nicht jetzt zwingend nötig, aber später sinnvoll:

- Admin-Hinweis für Galerien, deren Ablaufdatum erreicht ist.
- Automatische E-Mail an Felix, wenn eine Galerie 90 Tage abgeschlossen ist.
- Export/ZIP pro abgeschlossenem Shooting.
- Kundenkonto-Downloadbereich für freigegebene ZIPs.
- Automatische Deaktivierung von Downloads nach Ablaufdatum.
