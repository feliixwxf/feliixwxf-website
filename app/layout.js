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
  },
  icons: {
    icon: "/favicon.ico?v=3",
    shortcut: "/favicon.ico?v=3",
    apple: "/icon.svg?v=3",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "feliix.wxf",
  url: "https://www.feliixwxf.de",
  image: "https://www.feliixwxf.de/images/nacher.jpg",
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
  areaServed: [
    "Hildburghausen",
    "Eisfeld",
    "Thüringen",
    "Suhl",
    "Coburg",
  ],
  sameAs: ["https://www.instagram.com/feliix.wxf"],
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
