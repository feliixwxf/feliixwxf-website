export const metadata = {
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
