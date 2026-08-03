export const metadata = {
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
