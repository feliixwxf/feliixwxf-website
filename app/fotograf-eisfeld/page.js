import Link from "next/link";
import BeforeAfterSlider from "@/components/before-after-slider";
import LegalBackButton from "@/components/legal-back-button";

const pageUrl = "https://www.feliixwxf.de/fotograf-eisfeld";

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
  title: "Fotograf in Eisfeld für Portraits, Hochzeiten & Autos",
  description:
    "Fotograf in Eisfeld und Südthüringen: natürliche Portraits, Hochzeiten, Car Photography, Events und moderne Bildbearbeitung von feliix.wxf.",
  keywords: [
    "Fotograf Eisfeld",
    "Fotograf in Eisfeld",
    "Portraitfotograf Eisfeld",
    "Hochzeitsfotograf Eisfeld",
    "Car Photography Eisfeld",
    "Autofotograf Eisfeld",
    "Eventfotograf Eisfeld",
    "Fotograf Südthüringen",
  ],
  alternates: {
    canonical: "/fotograf-eisfeld",
  },
  openGraph: {
    title: "Fotograf in Eisfeld für Portraits, Hochzeiten & Autos | feliix.wxf",
    description:
      "Fotoshootings in Eisfeld und Südthüringen: Portraits, Hochzeiten, Car Photography, Events und kreative Bildbearbeitung.",
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
  areaServed: ["Eisfeld", "Hildburghausen", "Südthüringen"],
  makesOffer: [
    "Portraitfotografie in Eisfeld",
    "Hochzeitsfotografie in Eisfeld",
    "Car Photography in Eisfeld",
    "Eventfotografie in Eisfeld",
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
  name: "Fotografie in Eisfeld",
  serviceType: [
    "Portraitfotografie",
    "Hochzeitsfotografie",
    "Car Photography",
    "Eventfotografie",
    "Bildbearbeitung",
  ],
  description:
    "Fotoshootings in Eisfeld und Südthüringen mit natürlichem Look, moderner Bearbeitung und digitaler Bereitstellung.",
  provider: {
    "@type": "LocalBusiness",
    name: "feliix.wxf",
    url: "https://www.feliixwxf.de",
  },
  areaServed: [
    {
      "@type": "City",
      name: "Eisfeld",
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
      name: "Fotograf in Eisfeld",
      item: pageUrl,
    },
  ],
};

const faqItems = [
  {
    question: "Was kostet ein Fotoshooting in Eisfeld?",
    answer:
      "Die Preise hängen von Art, Dauer und Umfang des Shootings ab. Portraits, Autofotos, Hochzeiten und Events werden individuell geplant. Du erhältst nach deiner Anfrage ein unverbindliches Angebot.",
  },
  {
    question: "Wo fotografierst du rund um Eisfeld?",
    answer:
      "Ich fotografiere in Eisfeld, Hildburghausen, Coburg, Südthüringen und nach Absprache auch an weiteren Orten in der Umgebung.",
  },
  {
    question: "Wie lange dauert die Bearbeitung der Bilder?",
    answer:
      "Die genaue Bearbeitungs- und Lieferzeit hängt vom Shooting ab. Nach Portrait- oder Autofotos erhältst du deine bearbeiteten Bilder in der Regel schneller als bei großen Events oder Hochzeiten.",
  },
  {
    question: "Wie kann ich einen Termin anfragen?",
    answer:
      "Am einfachsten nutzt du das Kontaktformular auf der Website. Beschreibe kurz, welche Bilder du brauchst, wo das Shooting stattfinden soll und ob du schon ein Wunschdatum hast.",
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
  "Gemeinsam passenden Look und Ablauf klären.",
  "Shooting in Eisfeld oder Umgebung durchführen.",
  "Bilder sauber bearbeiten und digital bereitstellen.",
];

export default function FotografEisfeldPage() {
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
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.85fr_1fr]">
          <BeforeAfterSlider className="order-2 lg:order-1" />

          <div className="order-1 lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
              Fotograf in Eisfeld
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              Moderne Fotografie direkt aus Eisfeld.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-300 md:text-lg">
              feliix.wxf fotografiert in Eisfeld, Hildburghausen und
              Südthüringen. Der Fokus liegt auf starken Bildern mit natürlicher
              Wirkung, klarer Bearbeitung und einem Look, der zu dir passt.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/#kontakt"
                className="rounded-full bg-yellow-400 px-5 py-3 text-sm font-black text-black"
              >
                Jetzt Termin anfragen
              </Link>
              <Link
                href="/#bewertung"
                className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold"
              >
                Bewertungen ansehen
              </Link>
              <Link
                href="/#portfolio"
                className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold"
              >
                Portfolio öffnen
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.04] px-5 py-14">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <h2 className="text-3xl font-black">Shootings in Eisfeld</h2>
            <p className="mt-4 leading-8 text-neutral-300">
              Felix Wolff ist der Fotograf hinter feliix.wxf. Ich arbeite vor
              allem in Eisfeld, Hildburghausen, Coburg und Südthüringen und
              biete Portraitshootings, Hochzeiten, Autofotografie, Events und
              moderne Bildbearbeitung an. Wichtig ist mir, dass die Bilder nicht
              nach Standard aussehen, sondern zu dir, deinem Anlass und deiner
              Umgebung passen.
            </p>
            <p className="mt-4 leading-8 text-neutral-300">
              Ein Shooting in Eisfeld kann draußen, urban, natürlich, am Auto,
              bei einer Feier oder an einer gemeinsam gewählten Location
              stattfinden. Vorab klären wir, welchen Look du möchtest, wie viele
              Bilder du brauchst und ob es besondere Wünsche gibt. Preise gibt
              es deshalb bewusst auf Anfrage: Ein kurzes Portraitshooting hat
              einen anderen Umfang als eine Hochzeit, ein Event oder ein
              komplettes Fahrzeug-Shooting mit Detailaufnahmen.
            </p>
            <p className="mt-4 leading-8 text-neutral-300">
              Nach dem Shooting werden die Bilder sortiert, sauber bearbeitet
              und digital bereitgestellt. Die Bearbeitungs- und Lieferzeit hängt
              vom Umfang ab. Bei kleineren Shootings geht es meist schneller,
              bei Hochzeiten oder Events planen wir den Zeitraum vorher
              gemeinsam. Wenn du ein Shooting in Eisfeld oder Umgebung anfragen
              möchtest, erreichst du mich direkt über das Kontaktformular.
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
                Du schickst mir zuerst eine unverbindliche Anfrage. Hilfreich
                sind Shooting-Art, Ort, Wunschdatum und eine kurze Beschreibung,
                was du dir vorstellst. Danach besprechen wir den Stil, die
                Location und den ungefähren Umfang. Erst wenn alles passt,
                planen wir den Termin konkret.
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

          <div className="mt-10 flex flex-wrap gap-3">
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
        </div>
      </section>
    </main>
  );
}
