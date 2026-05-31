# Supabase E-Mail-Vorlagen

Stand: 31.05.2026

Diese Vorlagen sind fuer die Supabase-Auth-Mails der Kundenkonten gedacht.

## Wo eintragen

In Supabase:

1. Projekt oeffnen
2. `Authentication`
3. `Emails`
4. `Templates`
5. Jeweilige Vorlage oeffnen
6. Subject und Body ersetzen
7. Speichern

Wichtig:

- Site URL in Supabase sollte auf `https://www.feliixwxf.de` stehen.
- Redirect URLs sollten mindestens enthalten:
  - `https://www.feliixwxf.de/konto`
  - `https://www.feliixwxf.de/konto?verified=1`
- Die Variable `{{ .ConfirmationURL }}` muss im Button-Link bleiben.
- Die Variable `{{ .Email }}` zeigt die Empfaenger-E-Mail.
- Die Variable `{{ .Data.name }}` kann den bei der Registrierung angegebenen Benutzernamen anzeigen, sofern vorhanden.

## Confirm signup

Subject:

```txt
Bitte bestaetige dein feliix.wxf Kundenkonto
```

Body:

```html
<div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #111111; line-height: 1.6;">
  <h1 style="font-size: 26px; margin-bottom: 12px;">Willkommen bei feliix.wxf</h1>

  <p>Hallo{{ if .Data.name }} {{ .Data.name }}{{ end }},</p>

  <p>
    bitte bestaetige deine E-Mail-Adresse, damit dein Kundenkonto aktiviert wird.
    Danach kannst du deine Kundengalerien ansehen, Favoriten setzen und freigegebene Downloads nutzen.
  </p>

  <p style="margin: 28px 0;">
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #111111; color: #ffffff; text-decoration: none; padding: 14px 22px; border-radius: 12px; font-weight: 700;">
      E-Mail bestaetigen
    </a>
  </p>

  <p style="font-size: 14px; color: #555555;">
    Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br />
    <a href="{{ .ConfirmationURL }}" style="color: #111111;">{{ .ConfirmationURL }}</a>
  </p>

  <p style="font-size: 14px; color: #777777;">
    Wenn du dieses Konto nicht erstellt hast, kannst du diese E-Mail ignorieren.
  </p>

  <hr style="border: none; border-top: 1px solid #eeeeee; margin: 28px 0;" />

  <p style="font-size: 13px; color: #777777;">
    feliix.wxf Photography<br />
    Zum Grossenbach 1, 98673 Eisfeld, Deutschland<br />
    Kontakt: felixwolff411@gmail.com
  </p>
</div>
```

## Reset password

Subject:

```txt
Passwort fuer dein feliix.wxf Kundenkonto zuruecksetzen
```

Body:

```html
<div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #111111; line-height: 1.6;">
  <h1 style="font-size: 26px; margin-bottom: 12px;">Passwort zuruecksetzen</h1>

  <p>Hallo,</p>

  <p>
    fuer dein feliix.wxf Kundenkonto wurde eine Passwort-Zuruecksetzung angefragt.
    Klicke auf den Button, um ein neues Passwort festzulegen.
  </p>

  <p style="margin: 28px 0;">
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #111111; color: #ffffff; text-decoration: none; padding: 14px 22px; border-radius: 12px; font-weight: 700;">
      Passwort zuruecksetzen
    </a>
  </p>

  <p style="font-size: 14px; color: #555555;">
    Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br />
    <a href="{{ .ConfirmationURL }}" style="color: #111111;">{{ .ConfirmationURL }}</a>
  </p>

  <p style="font-size: 14px; color: #777777;">
    Wenn du das nicht angefragt hast, kannst du diese E-Mail ignorieren.
  </p>

  <hr style="border: none; border-top: 1px solid #eeeeee; margin: 28px 0;" />

  <p style="font-size: 13px; color: #777777;">
    feliix.wxf Photography<br />
    Zum Grossenbach 1, 98673 Eisfeld, Deutschland<br />
    Kontakt: felixwolff411@gmail.com
  </p>
</div>
```

## Magic link / OTP

Subject:

```txt
Dein Login-Link fuer feliix.wxf
```

Body:

```html
<div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #111111; line-height: 1.6;">
  <h1 style="font-size: 26px; margin-bottom: 12px;">Dein Login-Link</h1>

  <p>Hallo,</p>

  <p>
    mit diesem Link kannst du dich in dein feliix.wxf Kundenkonto einloggen.
  </p>

  <p style="margin: 28px 0;">
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #111111; color: #ffffff; text-decoration: none; padding: 14px 22px; border-radius: 12px; font-weight: 700;">
      Einloggen
    </a>
  </p>

  <p style="font-size: 14px; color: #555555;">
    Alternativ kannst du diesen Code verwenden: <strong>{{ .Token }}</strong>
  </p>

  <p style="font-size: 14px; color: #777777;">
    Wenn du diesen Login nicht angefragt hast, kannst du diese E-Mail ignorieren.
  </p>

  <hr style="border: none; border-top: 1px solid #eeeeee; margin: 28px 0;" />

  <p style="font-size: 13px; color: #777777;">
    feliix.wxf Photography<br />
    Zum Grossenbach 1, 98673 Eisfeld, Deutschland<br />
    Kontakt: felixwolff411@gmail.com
  </p>
</div>
```

## Invite user

Subject:

```txt
Einladung zu deinem feliix.wxf Kundenkonto
```

Body:

```html
<div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #111111; line-height: 1.6;">
  <h1 style="font-size: 26px; margin-bottom: 12px;">Einladung zu feliix.wxf</h1>

  <p>Hallo,</p>

  <p>
    du wurdest eingeladen, ein feliix.wxf Kundenkonto zu nutzen.
    Dort kannst du deine Kundengalerien ansehen, Favoriten setzen und freigegebene Bilder herunterladen.
  </p>

  <p style="margin: 28px 0;">
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #111111; color: #ffffff; text-decoration: none; padding: 14px 22px; border-radius: 12px; font-weight: 700;">
      Einladung annehmen
    </a>
  </p>

  <p style="font-size: 14px; color: #555555;">
    Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br />
    <a href="{{ .ConfirmationURL }}" style="color: #111111;">{{ .ConfirmationURL }}</a>
  </p>

  <hr style="border: none; border-top: 1px solid #eeeeee; margin: 28px 0;" />

  <p style="font-size: 13px; color: #777777;">
    feliix.wxf Photography<br />
    Zum Grossenbach 1, 98673 Eisfeld, Deutschland<br />
    Kontakt: felixwolff411@gmail.com
  </p>
</div>
```

## Empfehlenswerte Auth-Einstellungen

In Supabase unter `Authentication` -> `URL Configuration`:

- Site URL: `https://www.feliixwxf.de`
- Redirect URLs:
  - `https://www.feliixwxf.de/konto`
  - `https://www.feliixwxf.de/konto?verified=1`
  - `http://localhost:3000/konto`
  - `http://localhost:3001/konto`

In Supabase unter `Authentication` -> `SMTP Settings`:

- Fuer echte Kundennutzung langfristig eigene SMTP-Domain nutzen.
- Absender sollte zu deiner Website passen, z. B. `kontakt@feliixwxf.de`, sobald eine Domain-Mailadresse eingerichtet ist.
- Bis dahin kann Supabase Standard-Mail funktionieren, wirkt aber weniger professionell und kann Limits haben.
