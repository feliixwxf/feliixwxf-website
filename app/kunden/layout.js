export const metadata = {
  title: "Kundengalerie",
  description:
    "Private Kundengalerie von feliix.wxf zum Ansehen, Auswählen und Herunterladen freigegebener Bilder.",
  alternates: {
    canonical: "/kunden",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function KundenLayout({ children }) {
  return children;
}
