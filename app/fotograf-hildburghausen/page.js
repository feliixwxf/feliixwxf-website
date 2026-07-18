import Link from "next/link";
import BeforeAfterSlider from "@/components/before-after-slider";
import LegalBackButton from "@/components/legal-back-button";

const pageUrl = "https://www.feliixwxf.de/fotograf-hildburghausen";

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
        url: "/images/hyundaititel.jpg",
        width: 1200,
        height: 1600,
        alt: "Fotograf in Hildburghausen feliix.wxf",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  name: "feliix.wxf",
  url: pageUrl,
  image: "https://www.feliixwxf.de/images/hyundaititel.jpg",
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

const services = [
  {
    title: "Portraits",
    text: "Natürliche Portraits, Bewerbungsbilder und kreative Shootings mit modernem Look.",
  },
  {
    title: "Hochzeiten",
    text: "Emotionale Reportagen, Paarbilder und Detailaufnahmen für euren Tag.",
  },
  {
    title: "Car Photography",
    text: "Dynamische Autofotos, Detailshots und Content für Social Media.",
  },
  {
    title: "Events",
    text: "Unauffällige Eventbegleitung mit sauberen, hochwertigen Ergebnissen.",
  },
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
              Fotoshootings in Hildburghausen mit klarem Look.
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
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-black">Fotografie für Hildburghausen und Umgebung</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <article
                key={service.title}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5"
              >
                <h3 className="text-lg font-black">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-300">
                  {service.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <div>
            <h2 className="text-2xl font-black">Warum lokal?</h2>
            <p className="mt-4 leading-7 text-neutral-300">
              Kurze Wege, flexible Termine und Orte in Südthüringen, die zum
              Motiv passen. Ob Innenstadt, Natur, Auto-Location oder Feier.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-black">Für wen?</h2>
            <p className="mt-4 leading-7 text-neutral-300">
              Privatpersonen, Paare, Autofans, Abiturienten, Familien,
              Veranstalter und Unternehmen aus Hildburghausen.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-black">Kontakt</h2>
            <p className="mt-4 leading-7 text-neutral-300">
              Schreib kurz, was du planst. Du bekommst eine unverbindliche
              Rückmeldung zu Ablauf, Termin und Möglichkeiten.
            </p>
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
      </section>
    </main>
  );
}
