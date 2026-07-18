import Link from "next/link";
import BeforeAfterSlider from "@/components/before-after-slider";
import LegalBackButton from "@/components/legal-back-button";

const pageUrl = "https://www.feliixwxf.de/fotograf-eisfeld";

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
        url: "/images/fw.jpg",
        width: 1200,
        height: 1600,
        alt: "Fotograf in Eisfeld feliix.wxf",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  name: "feliix.wxf",
  url: pageUrl,
  image: "https://www.feliixwxf.de/images/fw.jpg",
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
              Ob Portrait, Hochzeit, Auto oder Event: Die Fotos sollen nicht
              nach Standard aussehen, sondern nach dir. Dafür werden Location,
              Licht, Bildstil und Bearbeitung passend geplant.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Portraitfotografie",
              "Hochzeitsfotografie",
              "Car Photography",
              "Eventfotografie",
            ].map((service) => (
              <div
                key={service}
                className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] p-4 font-bold"
              >
                {service}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-black">So läuft eine Anfrage ab</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
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
