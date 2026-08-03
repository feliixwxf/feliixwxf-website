import LegalBackButton from "@/components/legal-back-button";

export const metadata = {
  title: "Datenschutz",
  description:
    "Datenschutzhinweise von feliix.wxf zu Kontaktformular, Kundenkonto, Bewertungen und Kundengalerien.",
  alternates: {
    canonical: "/datenschutz",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const sections = [
  {
    title: "Verantwortlicher",
    paragraphs: [
      "Verantwortlich für die Verarbeitung personenbezogener Daten auf dieser Website ist Felix Wolff, feliix.wxf Photography, Zum Großenbach 1, 98673 Eisfeld, Deutschland.",
      "Kontakt und Datenschutzanfragen: felixwolff411@gmail.com. Über diese E-Mail-Adresse können Auskunfts-, Berichtigungs-, Lösch- und Widerspruchsanfragen gestellt werden.",
    ],
  },
  {
    title: "Zwecke und Rechtsgrundlagen",
    paragraphs: [
      "Personenbezogene Daten werden verarbeitet, um diese Website bereitzustellen, Kontaktanfragen zu beantworten, Kundenkonten zu verwalten, Kundengalerien und Bilddownloads bereitzustellen, Bewertungen zu prüfen und zu veröffentlichen sowie den technischen Betrieb abzusichern.",
      "Rechtsgrundlagen sind Art. 6 Abs. 1 lit. b DSGVO für vorvertragliche und vertragliche Maßnahmen, Art. 6 Abs. 1 lit. f DSGVO für den sicheren und funktionierenden Betrieb der Website sowie Art. 6 Abs. 1 lit. a DSGVO, wenn eine Einwilligung ausdrücklich abgefragt wird.",
    ],
  },
  {
    title: "Kontaktformular",
    paragraphs: [
      "Bei Nutzung des Kontaktformulars werden Name, E-Mail-Adresse, optional Telefonnummer, Nachricht, Quelle der Anfrage und technische Angaben wie der User-Agent verarbeitet. Diese Daten werden zuerst über eine eigene API in der Supabase-Datenbank gespeichert, damit Anfragen im geschützten Adminbereich zuverlässig nachverfolgt und beantwortet werden können.",
      "Anschließend wird dieselbe Formulareinsendung zusätzlich an Formspree übertragen, damit eine E-Mail-Benachrichtigung und Formularverwaltung möglich ist. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO für die Bearbeitung der Anfrage und Art. 6 Abs. 1 lit. f DSGVO für eine zuverlässige Anfrageverwaltung.",
      "Kontaktanfragen werden gespeichert, solange dies für die Bearbeitung, Nachverfolgung oder Dokumentation der Anfrage erforderlich ist. Nicht mehr benötigte Anfragen können im Adminbereich gelöscht werden. Formspree hält Formulareinsendungen im kostenlosen Tarif nach Anbieterangaben für 30 Tage vor.",
    ],
  },
  {
    title: "Kundenkonto und Kundengalerien",
    paragraphs: [
      "Wenn ein Kundenkonto erstellt oder eine Kundengalerie genutzt wird, werden die dafür erforderlichen Daten verarbeitet. Dazu gehören insbesondere E-Mail-Adresse, Nutzername, optional Telefonnummer, optional Profilbild, Galerie-Zuordnung, Favoriten, Download-Freigaben und technische Zugriffsinformationen.",
      "Kundengalerien können persönliche Fotos enthalten und werden nur für den jeweiligen Zweck des Shootings bereitgestellt. Galerien können über Zugangscode, QR-Code oder ein verknüpftes Kundenkonto erreichbar sein.",
      "Neue Kundengalerie-Bilder werden in einem privaten Speicherbereich abgelegt und in der Kundenansicht nur über zeitlich begrenzte Bildlinks bereitgestellt. Zugangscodes und QR-Codes sollten vertraulich behandelt werden.",
      "Ein Kundenkonto kann im Konto-Bereich gelöscht werden. Dabei werden Konto-Verknüpfungen, Profilbild und Favoriten entfernt. Shooting-Galerien bleiben beim Fotografen erhalten, solange sie für Projektabwicklung, Nachlieferung oder Dokumentation benötigt werden.",
    ],
  },
  {
    title: "Bewertungen",
    paragraphs: [
      "Abgegebene Bewertungen werden zunächst gespeichert und erst nach manueller Freigabe veröffentlicht. Bei eingeloggten Kunden kann zusätzlich das Profilbild und der Nutzername aus dem Kundenkonto angezeigt werden.",
      "Vor dem Absenden einer Bewertung muss freiwillig bestätigt werden, dass Name, Bewertung und gegebenenfalls ausgewählter Avatar oder Profilbild nach Freigabe öffentlich auf der Website erscheinen dürfen. Rechtsgrundlage für diese Veröffentlichung ist Art. 6 Abs. 1 lit. a DSGVO. Die Einwilligung kann jederzeit per E-Mail mit Wirkung für die Zukunft widerrufen werden.",
      "Wird ein Kundenkonto gelöscht, bleibt eine bereits veröffentlichte Bewertung ohne Konto-Verknüpfung bestehen. Wenn eine Bewertung ebenfalls gelöscht werden soll, kann dies jederzeit per E-Mail angefragt werden.",
      "Bei neuen Bewertungen kann eine Benachrichtigung per E-Mail an den Betreiber ausgelöst werden, damit die Bewertung geprüft und freigegeben werden kann.",
    ],
  },
  {
    title: "Supabase",
    paragraphs: [
      "Für Datenbank, Authentifizierung, Kundenkonten, Bewertungen, Kontaktanfragen, Kundengalerien, Bildspeicher und Administrationsfunktionen wird Supabase genutzt. Anbieter ist Supabase Inc., 970 Toa Payoh North #07-04, Singapore 318992.",
      "Verarbeitet werden je nach Funktion insbesondere E-Mail-Adresse, Nutzername, optional Telefonnummer, Passwort- beziehungsweise Authentifizierungsdaten, Profilbild, Bewertungsdaten, Kontaktanfragen, Galerie-Zuordnungen, Zugangscodes, Favoriten, Download-Freigaben, Bilddateien, Dateipfade, technische Statusdaten und Zeitstempel.",
      "Die Projektregion ist nach aktueller Dashboard-Anzeige West EU (Ireland), technisch `eu-west-1`. Datenbank- und Speicherdaten werden damit in dieser Supabase-Projektregion verarbeitet. Supabase setzt zur Bereitstellung, Sicherheit und Wartung weitere Unterauftragsverarbeiter ein.",
      "Rechtsgrundlagen sind Art. 6 Abs. 1 lit. b DSGVO für Kundenkonto, Galerie- und Shooting-Abwicklung sowie Art. 6 Abs. 1 lit. f DSGVO für den sicheren Betrieb, die Verwaltung und die technische Absicherung der Website.",
      "Konto- und Galerie-Daten werden gespeichert, solange das Kundenkonto besteht, die Galerie bereitgestellt wird oder die Daten für Projektabwicklung, Nachlieferung, Dokumentation oder gesetzliche Pflichten benötigt werden. Kundenkonten können im Konto-Bereich gelöscht werden; Bewertungen bleiben wie angegeben ohne Konto-Verknüpfung bestehen, sofern keine separate Löschung per E-Mail verlangt wird.",
      "Mit Supabase werden die vom Anbieter bereitgestellten Vereinbarungen zur Auftragsverarbeitung und Datenverarbeitung genutzt. Soweit Supabase oder Unterauftragsverarbeiter Daten in Drittstaaten verarbeiten, werden die vom Anbieter vorgesehenen Schutzmechanismen wie EU-Standardvertragsklauseln eingesetzt.",
    ],
  },
  {
    title: "Formspree",
    paragraphs: [
      "Für die zusätzliche Verarbeitung von Kontaktformularen und E-Mail-Benachrichtigungen wird Formspree genutzt. Anbieter ist Formspree, Inc., USA.",
      "An Formspree werden die im Kontaktformular eingegebenen Daten übertragen, insbesondere Name, E-Mail-Adresse, optional Telefonnummer und Nachricht. Zusätzlich können technische Daten wie Zeitpunkt der Einsendung, IP-Adresse, Browser- und Geräteinformationen verarbeitet werden.",
      "Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO für die Bearbeitung der Anfrage und Art. 6 Abs. 1 lit. f DSGVO für die zuverlässige Zustellung und Verwaltung von Kontaktanfragen.",
      "Formspree speichert Formulareinsendungen im Formspree-Konto. Im kostenlosen Tarif werden Einsendungen nach Anbieterangaben für 30 Tage vorgehalten. Danach richtet sich die weitere Speicherdauer nach den im Formspree-Konto verfügbaren Tarif- und Kontoeinstellungen.",
      "Formspree verarbeitet Daten nach Anbieterangaben über Amazon Web Services in den USA. Für Datenübermittlungen in die USA beruft sich Formspree auf EU-Standardvertragsklauseln. Mit Formspree werden die vom Anbieter bereitgestellten Datenschutz- und Auftragsverarbeitungsbedingungen genutzt.",
    ],
  },
  {
    title: "Hosting und Content Delivery Network mit Vercel",
    paragraphs: [
      "Diese Website wird bei Vercel gehostet. Anbieter ist Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA. Vercel stellt Webhosting-Kapazitäten, Infrastruktur-Dienstleistungen und ein weltweites Content Delivery Network bereit, damit Inhalte schnell, sicher und zuverlässig ausgeliefert werden.",
      "Beim Aufruf der Website verarbeitet Vercel technisch erforderliche Daten wie IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seiten, Browser- und Geräteinformationen, Betriebssystem, Referrer-URL und technische Verbindungsdaten.",
      "Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt in der sicheren, schnellen und fehlerfreien Bereitstellung des Onlineangebots.",
      "Vercel hat seinen Sitz in den USA. Das abgeschlossene Data Processing Addendum von Vercel enthält EU-Standardvertragsklauseln, um ein angemessenes Datenschutzniveau bei Datenübermittlungen in Drittstaaten sicherzustellen.",
      "IP-Adressen und Server-Logfiles werden nur so lange verarbeitet und gespeichert, wie dies für Bereitstellung, Betrieb, technische Funktionalität und IT-Sicherheit erforderlich ist. Soweit verfügbar, werden datenschutzfreundliche Einstellungen wie Log- oder IP-Anonymisierung genutzt.",
    ],
  },
  {
    title: "Cookies und lokale Speicherung",
    paragraphs: [
      "Für den Betrieb der Website werden technisch notwendige Session-Cookies verwendet, etwa für Admin- oder Kunden-Logins. Zusätzlich können einzelne Einstellungen wie der gewählte Hell-/Dunkel-Modus lokal im Browser gespeichert werden.",
      "Eine werbliche Tracking- oder Analysefunktion ist auf dieser Website nicht vorgesehen.",
    ],
  },
  {
    title: "Speicherdauer",
    paragraphs: [
      "Daten werden nur so lange gespeichert, wie sie für die jeweiligen Zwecke erforderlich sind. Kontaktanfragen werden bis zur Bearbeitung und notwendigen Nachverfolgung gespeichert. Kundengalerien können nach Abschluss eines Projekts deaktiviert, archiviert, mit einem Ablaufdatum versehen oder gelöscht werden.",
      "Kundenkonten werden bis zur Löschung durch den Nutzer oder bis zu einer notwendigen administrativen Löschung gespeichert. Technische Protokolle und Fehlerberichte werden nur so lange vorgehalten, wie dies zur Fehlersuche, Sicherheit und Missbrauchsvermeidung erforderlich ist. Gesetzliche Aufbewahrungspflichten bleiben unberührt.",
    ],
  },
  {
    title: "Deine Rechte",
    paragraphs: [
      "Du hast jederzeit das Recht auf Auskunft, Berichtigung oder Löschung deiner gespeicherten Daten. Außerdem können je nach Situation Einschränkung der Verarbeitung, Widerspruch gegen die Verarbeitung oder Datenübertragbarkeit verlangt werden.",
      "Sofern eine Verarbeitung auf Einwilligung beruht, kann diese Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen werden. Außerdem besteht das Recht, sich bei einer zuständigen Datenschutzaufsichtsbehörde zu beschweren.",
    ],
  },
];

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <LegalBackButton />

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl sm:p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-neutral-400">
            Stand: August 2026
          </p>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">
            Datenschutz
          </h1>
          <p className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-neutral-400">
            Diese Hinweise fassen zusammen, welche Daten auf dieser Website
            verarbeitet werden und erklären transparent, wie Kontaktformular,
            Kundenkonto, Bewertungen und Kundengalerien funktionieren.
          </p>

          <div className="mt-10 space-y-8 text-neutral-300">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-2xl font-bold text-white">
                  {section.title}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-3 leading-8">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
