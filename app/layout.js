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
        url: "/icon.png?v=5",
        width: 512,
        height: 512,
        alt: "feliix.wxf Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "feliix.wxf | Fotograf in Hildburghausen & Thüringen",
    description:
      "Portraitfotografie, Hochzeiten, Car Photography und Events in Thüringen.",
    images: ["/icon.png?v=5"],
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
  other: {
    "msvalidate.01": "F12E0B328F3931FDC59FFF62697EF373",
  },
  icons: {
    icon: [
      { url: "/icon.png?v=4", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg?v=4", type: "image/svg+xml" },
      { url: "/favicon.ico?v=4", sizes: "any" },
    ],
    shortcut: "/icon.png?v=4",
    apple: "/icon.png?v=4",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "feliix.wxf",
  url: "https://www.feliixwxf.de",
  inLanguage: "de-DE",
  publisher: {
    "@type": "Organization",
    name: "feliix.wxf",
    url: "https://www.feliixwxf.de",
    logo: "https://www.feliixwxf.de/icon.png",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "feliix.wxf Photography",
  alternateName: "feliix.wxf",
  legalName: "Felix Wolff",
  url: "https://www.feliixwxf.de",
  image: "https://www.feliixwxf.de/images/startpoint.jpg",
  logo: "https://www.feliixwxf.de/icon.png",
  description:
    "Fotograf für Hildburghausen, Eisfeld und Südthüringen mit Fokus auf Portraits, Hochzeiten, Car Photography, Events und moderne Bildbearbeitung.",
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
    "Eisfeld",
    "Hildburghausen",
    "Coburg",
    "Südthüringen",
    "Thüringen",
    "Suhl",
  ],
  sameAs: ["https://www.instagram.com/feliix.wxf/"],
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
        name: "Portraitfotografie in Hildburghausen, Eisfeld und Thüringen",
        areaServed: ["Hildburghausen", "Eisfeld", "Südthüringen"],
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Car Photography in Hildburghausen, Eisfeld und Thüringen",
        areaServed: ["Hildburghausen", "Eisfeld", "Südthüringen"],
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Hochzeitsfotografie in Hildburghausen, Eisfeld und Thüringen",
        areaServed: ["Hildburghausen", "Eisfeld", "Südthüringen"],
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Eventfotografie in Hildburghausen und Umgebung",
        areaServed: ["Hildburghausen", "Eisfeld", "Südthüringen"],
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
        <link rel="icon" href="/icon.png?v=4" type="image/png" sizes="512x512" />
        <link rel="icon" href="/icon.svg?v=4" type="image/svg+xml" />
        <link rel="shortcut icon" href="/icon.png?v=4" />
        <link rel="apple-touch-icon" href="/icon.png?v=4" />
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
      </head>
      <body className="min-h-full flex flex-col">
        <UserErrorReporter />
        {children}
      </body>
    </html>
  );
}
