import Link from "next/link";
import BeforeAfterSlider from "@/components/before-after-slider";
import LegalBackButton from "@/components/legal-back-button";

const pageUrl = "https://www.feliixwxf.de/fotograf-hildburghausen";

const services = [
  {
    title: "Portraits",
    text: "natürlich, urban oder passend zu deinem Look",
  },
  {
    title: "Hochzeiten",
    text: "Paarbilder, Momente und kleine Reportagen",
  },
  {
    title: "Car Photography",
    text: "Fahrzeuge, Details und Social-Media-Content",
  },
  {
    title: "Events",
    text: "private Feiern und geschäftliche Anlässe",
  },
];

export const metadata = {
  title: "Fotograf in Hildburghausen für Portraits, Hochzeiten & Autos",
  description:
    "Fotograf in Hildburghausen und Südthüringen: Portraits, Hochzeiten, Car Photography, Events und moderne Bildbearbeitung von feliix.wxf.",
  keywords: [
    "Fotograf Hildburghausen",
    "Fotograf in Hildburghausen",
    "Portraitfotograf Hildburghausen",
    "Hochzeitsfotograf Hildburghausen",
    "Car Photography Hildburghausen",
    "Autofotograf Hildburghausen",
    "Eventfotograf Hildburghausen",
    "Fotograf Südthüringen",
  ],
  alternates: {
    canonical: "/fotograf-hildburghausen",
  },
  openGraph: {
    title:
      "Fotograf in Hildburghausen für Portraits, Hochzeiten & Autos | feliix.wxf",
    description:
      "Portraits, Hochzeiten, Car Photography, Events und Bildbearbeitung in Hildburghausen und Südthüringen.",
    url: pageUrl,
    type: "website",
    images: [
      {
        url: "/icon.png?v=5",
        width: 512,
        height: 512,
        alt: "feliix.wxf Logo",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  name: "feliix.wxf",
  url: pageUrl,
  image: "https://www.feliixwxf.de/icon.png",
  email: "felixwolff411@gmail.com",
  telephone: "+4915259105754",
  priceRange: "€€",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Zum Großenbach 1",
    postalCode: "98673",
    addressLocality: "Eisfeld",
    addressRegion: "Thüringen",
    addressCountry: "DE",
  },
  areaServed: ["Hildburghausen", "Eisfeld", "Südthüringen"],
  makesOffer: [
    "Portraitfotografie in Hildburghausen",
    "Hochzeitsfotografie in Hildburghausen",
    "Car Photography in Hildburghausen",
    "Eventfotografie in Hildburghausen",
  ].map((name) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name,
    },
  })),
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Fotografie in Hildburghausen",
  serviceType: [
    "Portraitfotografie",
    "Hochzeitsfotografie",
    "Car Photography",
    "Eventfotografie",
    "Bildbearbeitung",
  ],
  description:
    "Fotoshootings in Hildburghausen und Südthüringen mit natürlichem Look, moderner Bearbeitung und digitaler Bereitstellung.",
  provider: {
    "@type": "LocalBusiness",
    name: "feliix.wxf",
    url: "https://www.feliixwxf.de",
  },
  areaServed: [
    {
      "@type": "City",
      name: "Hildburghausen",
    },
    {
      "@type": "AdministrativeArea",
      name: "Südthüringen",
    },
  ],
  url: pageUrl,
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Startseite",
      item: "https://www.feliixwxf.de",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Fotograf in Hildburghausen",
      item: pageUrl,
    },
  ],
};

const faqItems = [
  {
    question: "Was kostet ein Fotoshooting in Hildburghausen?",
    answer:
      "Die Preise hängen von Shooting-Art, Dauer, Location und gewünschtem Umfang ab. Portraits, Hochzeiten, Autofotos und Events werden individuell geplant. Nach deiner Anfrage erhältst du ein unverbindliches Angebot.",
  },
  {
    question: "Wo fotografierst du rund um Hildburghausen?",
    answer:
      "Ich fotografiere in Hildburghausen, Eisfeld, Coburg, Südthüringen und nach Absprache auch an weiteren Orten in der Umgebung.",
  },
  {
    question: "Wie läuft ein Shooting ab?",
    answer:
      "Zuerst klären wir deine Idee, den Stil, den Ort und den Zeitraum. Danach planen wir das Shooting konkret, fotografieren vor Ort und stellen die bearbeiteten Bilder digital bereit.",
  },
  {
    question: "Wann erhalte ich meine fertigen Bilder?",
    answer:
      "Die Bearbeitungs- und Lieferzeit richtet sich nach dem Umfang. Kleinere Shootings sind meist schneller fertig, bei Hochzeiten oder Events wird der Zeitraum vorher gemeinsam besprochen.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const steps = [
  "Anfrage mit Wunsch, Ort und Zeitraum senden.",
  "Look, Ablauf und Umfang gemeinsam klären.",
  "Shooting in Hildburghausen oder Umgebung umsetzen.",
  "Bilder bearbeiten und digital bereitstellen.",
];

export default function FotografHildburghausenPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="px-5 py-8">
        <div className="mx-auto max-w-6xl">
          <LegalBackButton />
        </div>
      </section>

      <section className="px-5 pb-16 pt-10">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
              Fotograf in Hildburghausen
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              Fotograf in Hildburghausen für Portraits, Hochzeiten und Autos
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-300 md:text-lg">
              Du suchst einen Fotografen in Hildburghausen für Portraits,
              Hochzeiten, Autos oder Events? feliix.wxf verbindet moderne
              Fotografie mit sauberer Bearbeitung und einem natürlichen,
              hochwertigen Stil.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/#kontakt"
                className="rounded-full bg-yellow-400 px-5 py-3 text-sm font-black text-black"
              >
                Unverbindlich anfragen
              </Link>
              <Link
                href="/#portfolio"
                className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold"
              >
                Portfolio ansehen
              </Link>
              <Link
                href="/#bewertung"
                className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold"
              >
                Bewertungen
              </Link>
            </div>
          </div>

          <BeforeAfterSlider />
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.04] px-5 py-14">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <h2 className="text-3xl font-black">
              Fotografie für Hildburghausen und Umgebung
            </h2>
            <p className="mt-4 leading-8 text-neutral-300">
              Felix Wolff ist der Fotograf hinter feliix.wxf. Ich fotografiere
              in Hildburghausen, Eisfeld, Coburg und Südthüringen und biete
              Portraitshootings, Hochzeiten, Autofotografie, Events und moderne
              Bildbearbeitung an. Ziel sind Bilder mit Charakter, natürlicher
              Wirkung und einem klaren Look, der zum Menschen, Fahrzeug oder
              Anlass passt.
            </p>
            <p className="mt-4 leading-8 text-neutral-300">
              Für ein Shooting in Hildburghausen stimmen wir Location,
              Bildstil, Licht und Umfang vorher gemeinsam ab. Ob natürliche
              Portraits, Paarbilder, Hochzeitsmomente, Detailaufnahmen von
              Fahrzeugen oder Eventfotos: Jedes Shooting wird passend geplant.
              Preise nenne ich bewusst auf Anfrage, weil Dauer, Ort und Umfang
              stark variieren können.
            </p>
            <p className="mt-4 leading-8 text-neutral-300">
              Nach dem Termin werden die Bilder sortiert, bearbeitet und digital
              bereitgestellt. Die Lieferzeit hängt vom Umfang ab. Kleinere
              Portrait- oder Autofotoshootings sind meist schneller fertig,
              Hochzeiten und Events benötigen mehr Auswahl und Bearbeitung.
              Wenn du in Hildburghausen oder Umgebung fotografiert werden
              möchtest, kannst du direkt über das Kontaktformular anfragen.
            </p>
          </div>

          <div className="grid content-start gap-3 sm:grid-cols-2 lg:pt-2">
            {services.map((service) => (
              <article
                key={service.title}
                className="rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-4 shadow-sm"
              >
                <h3 className="text-base font-black leading-tight text-white">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-neutral-400">
                  {service.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <h2 className="text-3xl font-black">So läuft eine Anfrage ab</h2>
              <p className="mt-4 leading-8 text-neutral-300">
                Du sendest mir eine unverbindliche Anfrage mit Shooting-Art,
                Wunschort, Zeitraum und einer kurzen Beschreibung deiner Idee.
                Danach klären wir Stil, Location, Umfang und mögliche Termine.
                Erst wenn alles passt, planen wir den Termin konkret.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {steps.map((step, index) => (
                  <article
                    key={step}
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5"
                  >
                    <p className="text-sm font-black text-yellow-300">
                      Schritt {index + 1}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-neutral-300">
                      {step}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-black">Häufige Fragen</h2>
              <div className="mt-8 space-y-4">
                {faqItems.map((item) => (
                  <article
                    key={item.question}
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5"
                  >
                    <h3 className="font-black text-white">{item.question}</h3>
                    <p className="mt-3 text-sm leading-7 text-neutral-300">
                      {item.answer}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold"
          >
            Zur Website
          </Link>
          <Link
            href="/#kontakt"
            className="rounded-full bg-yellow-400 px-5 py-3 text-sm font-black text-black"
          >
            Kontaktformular öffnen
          </Link>
          <Link
            href="/#bewertung"
            className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold"
          >
            Kundenbewertungen
          </Link>
        </div>
        <div className="mx-auto mt-8 max-w-6xl rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-5">
          <p className="text-sm leading-7 text-neutral-300">
            Du suchst ein Shooting in der Umgebung? Entdecke auch meinen
            Service als{" "}
            <Link
              href="/fotograf-eisfeld"
              className="font-bold text-yellow-300 transition hover:text-yellow-200"
            >
              Fotograf in Eisfeld
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
