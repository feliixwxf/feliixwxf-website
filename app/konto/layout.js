export const metadata = {
  title: "Kundenkonto",
  description:
    "Kundenkonto bei feliix.wxf: Galerien ansehen, Profil verwalten und Downloads abrufen.",
  alternates: {
    canonical: "/konto",
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

export default function KontoLayout({ children }) {
  return children;
}
