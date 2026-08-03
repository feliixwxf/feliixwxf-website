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
    title: "Allgemeine Hinweise",
    paragraphs: [
      "Der Schutz persönlicher Daten ist wichtig. Personenbezogene Daten werden vertraulich behandelt und nur verarbeitet, wenn dies für die Bereitstellung der Website, die Bearbeitung einer Anfrage, die Nutzung eines Kundenkontos oder die Bereitstellung einer Kundengalerie erforderlich ist.",
      "Verantwortlich für diese Website ist Felix Wolff. Für Datenschutzanfragen, Auskunft oder Löschwünsche genügt eine Nachricht an die im Impressum genannte E-Mail-Adresse.",
    ],
  },
  {
    title: "Zwecke und Rechtsgrundlagen",
    paragraphs: [
      "Die Verarbeitung erfolgt zur Bereitstellung dieser Website, zur Bearbeitung von Kontaktanfragen, zur Verwaltung von Kundenkonten, zur Bereitstellung von Kundengalerien, zur Verwaltung von Bewertungen sowie zur technischen Absicherung des Betriebs.",
      "Je nach Vorgang erfolgt die Verarbeitung zur Durchführung vorvertraglicher oder vertraglicher Maßnahmen, auf Grundlage berechtigter Interessen an einem sicheren und funktionierenden Webangebot oder auf Grundlage einer Einwilligung, sofern eine solche abgefragt wird.",
    ],
  },
  {
    title: "Kontaktformular",
    paragraphs: [
      "Übermittelte Daten aus dem Kontaktformular werden zur Bearbeitung der Anfrage verarbeitet. Dazu können Name, E-Mail-Adresse, Telefonnummer und die Nachricht gehören.",
      "Die Verarbeitung erfolgt, um die Anfrage beantworten und ein mögliches Shooting vorbereiten zu können. Kontaktanfragen können zusätzlich im geschützten Adminbereich gespeichert werden, damit Anfragen zuverlässig nachverfolgt und beantwortet werden können.",
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
      "Wird ein Kundenkonto gelöscht, bleibt eine bereits veröffentlichte Bewertung ohne Konto-Verknüpfung bestehen. Wenn eine Bewertung ebenfalls gelöscht werden soll, kann dies jederzeit per E-Mail angefragt werden.",
      "Bei neuen Bewertungen kann eine Benachrichtigung per E-Mail an den Betreiber ausgelöst werden, damit die Bewertung geprüft und freigegeben werden kann.",
    ],
  },
  {
    title: "Cookies und lokale Speicherung",
    paragraphs: [
      "Für den Betrieb der Website können technisch notwendige Session-Cookies verwendet werden, etwa für Admin- oder Kunden-Logins. Zusätzlich können einzelne Einstellungen wie der gewählte Hell-/Dunkel-Modus lokal im Browser gespeichert werden.",
      "Eine werbliche Tracking- oder Analysefunktion ist auf dieser Website nicht vorgesehen.",
    ],
  },
  {
    title: "Hosting und Content Delivery Network mit Vercel",
    paragraphs: [
      "Diese Website wird bei Vercel gehostet. Anbieter ist Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA. Vercel stellt Webhosting-Kapazitäten, Infrastruktur-Dienstleistungen und ein weltweites Content Delivery Network (CDN) bereit, damit die Inhalte der Website schnell, sicher und zuverlässig ausgeliefert werden können.",
      "Beim Aufruf der Website können durch Vercel technisch erforderliche Daten verarbeitet werden. Dazu gehören insbesondere IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seiten, Browser- und Geräteinformationen, Betriebssystem, Referrer-URL sowie weitere technische Verbindungsdaten.",
      "Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt in der sicheren, schnellen und fehlerfreien Bereitstellung des Onlineangebots durch einen professionellen Cloud- und Hosting-Anbieter.",
      "Da Vercel ein Anbieter mit Sitz in den USA ist, kann eine Übermittlung personenbezogener Daten in die USA nicht ausgeschlossen werden. Mit Vercel wurde ein Data Processing Addendum abgeschlossen, das die EU-Standardvertragsklauseln enthält, um ein angemessenes Datenschutzniveau bei Datenübermittlungen in Drittstaaten sicherzustellen.",
      "IP-Adressen und Server-Logfiles werden nur so lange verarbeitet und gespeichert, wie dies für die Bereitstellung des Dienstes, die technische Funktionalität und die IT-Sicherheit erforderlich ist. Soweit verfügbar, werden datenschutzfreundliche Einstellungen wie die Anonymisierung von IP-Adressen und Logdaten genutzt.",
    ],
  },
  {
    title: "Speicherdauer",
    paragraphs: [
      "Daten werden nur so lange gespeichert, wie sie für die jeweiligen Zwecke erforderlich sind. Kundengalerien können nach Abschluss eines Projekts deaktiviert, mit einem Ablaufdatum versehen oder gelöscht werden.",
      "Gesetzliche Aufbewahrungspflichten bleiben unberührt.",
    ],
  },
  {
    title: "Externe Dienste",
    paragraphs: [
      "Diese Website nutzt externe Dienste zur Bereitstellung und Verwaltung der Inhalte. Supabase wird für Datenbank, Kundenkonten, Bewertungen, Kundengalerien und Bildspeicher genutzt. Formspree kann für Kontaktformulare eingesetzt werden.",
      "Bei diesen Diensten können technische Daten wie IP-Adresse, Zeitpunkt des Zugriffs, Geräte- und Browserinformationen oder Formularinhalte verarbeitet werden, soweit dies für Betrieb, Sicherheit und Anfragebearbeitung erforderlich ist.",
      "Soweit diese Dienste personenbezogene Daten im Auftrag verarbeiten, sollten entsprechende Vereinbarungen zur Auftragsverarbeitung geprüft und abgeschlossen werden.",
    ],
  },
  {
    title: "Ihre Rechte",
    paragraphs: [
      "Sie haben jederzeit das Recht auf Auskunft, Berichtigung oder Löschung Ihrer gespeicherten Daten. Außerdem können je nach Situation Einschränkung der Verarbeitung, Widerspruch gegen die Verarbeitung oder Datenübertragbarkeit verlangt werden.",
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
            Stand: Juni 2026
          </p>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">
            Datenschutz
          </h1>
          <p className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-neutral-400">
            Diese Hinweise fassen zusammen, welche Daten auf dieser Website
            verarbeitet werden. Sie ersetzen keine individuelle Rechtsberatung,
            sollen aber transparent erklären, wie Kontaktformular, Kundenkonto,
            Bewertungen und Kundengalerien funktionieren.
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
