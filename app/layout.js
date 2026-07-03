import { Geist, Geist_Mono } from "next/font/google";
import UserErrorReporter from "@/components/user-error-reporter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://www.feliixwxf.de"),
  title: {
    default: "feliix.wxf | Fotograf in Hildburghausen & Thüringen",
    template: "%s | feliix.wxf",
  },
  description:
    "feliix.wxf ist dein Fotograf für Hildburghausen, Eisfeld und Thüringen. Portraitfotografie, Hochzeiten, Car Photography, Eventfotos und moderne Bildbearbeitung.",
  authors: [{ name: "Felix Wolff" }],
  creator: "Felix Wolff",
  publisher: "feliix.wxf",
  category: "Fotografie",
  keywords: [
    "Fotograf Hildburghausen",
    "Fotograf in Hildburghausen",
    "Fotograf Eisfeld",
    "Fotograf Thüringen",
    "Portraitfotograf Thüringen",
    "Portrait Shooting Thüringen",
    "Hochzeitsfotograf Thüringen",
    "Hochzeitsfotograf Hildburghausen",
    "Hochzeitsfotografie Thüringen",
    "Car Photography Thüringen",
    "Autofotografie Thüringen",
    "Eventfotograf Thüringen",
    "Bildbearbeitung Fotograf",
    "feliix.wxf",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "feliix.wxf | Fotograf in Hildburghausen & Thüringen",
    description:
      "Portraits, Hochzeiten, Car Photography, Events und kreative Bildbearbeitung in Hildburghausen, Eisfeld und Thüringen.",
    url: "https://www.feliixwxf.de",
    siteName: "feliix.wxf",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "/images/nacher.jpg",
        width: 1200,
        height: 1600,
        alt: "Fotografie und Bildbearbeitung von feliix.wxf",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "feliix.wxf | Fotograf in Hildburghausen & Thüringen",
    description:
      "Portraitfotografie, Hochzeiten, Car Photography und Events in Thüringen.",
    images: ["/images/nacher.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico?v=3",
    shortcut: "/favicon.ico?v=3",
    apple: "/icon.svg?v=3",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "feliix.wxf",
  url: "https://www.feliixwxf.de",
  inLanguage: "de-DE",
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  name: "feliix.wxf",
  legalName: "Felix Wolff",
  url: "https://www.feliixwxf.de",
  image: "https://www.feliixwxf.de/images/nacher.jpg",
  email: "felixwolff411@gmail.com",
  telephone: "+4915259105754",
  priceRange: "€€",
  founder: {
    "@type": "Person",
    name: "Felix Wolff",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Zum Großenbach 1",
    postalCode: "98673",
    addressLocality: "Eisfeld",
    addressRegion: "Thüringen",
    addressCountry: "DE",
  },
  areaServed: [
    "Hildburghausen",
    "Eisfeld",
    "Thüringen",
    "Suhl",
    "Coburg",
  ],
  sameAs: ["https://www.instagram.com/feliix.wxf"],
  knowsAbout: [
    "Portraitfotografie",
    "Hochzeitsfotografie",
    "Car Photography",
    "Eventfotografie",
    "Bildbearbeitung",
  ],
  makesOffer: [
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Portraitfotografie in Thüringen",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Car Photography in Thüringen",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Hochzeitsfotografie in Thüringen",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Eventfotografie in Hildburghausen und Umgebung",
      },
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Wo bietet feliix.wxf Fotoshootings an?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "feliix.wxf fotografiert vor allem in Hildburghausen, Eisfeld, Südthüringen und Umgebung. Shootings in angrenzenden Regionen sind nach Absprache möglich.",
      },
    },
    {
      "@type": "Question",
      name: "Welche Shootings kann ich anfragen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Anfragen sind für Portraits, Hochzeiten, Car Photography, Events und moderne Bildbearbeitung möglich.",
      },
    },
    {
      "@type": "Question",
      name: "Wie schnell bekomme ich eine Antwort?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Anfragen werden unverbindlich geprüft und in der Regel zeitnah beantwortet.",
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" />
        <link rel="apple-touch-icon" href="/icon.svg?v=3" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <UserErrorReporter />
        {children}
      </body>
    </html>
  );
}
