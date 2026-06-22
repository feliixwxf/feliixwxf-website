import { Geist, Geist_Mono } from "next/font/google";
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
  title: "fellixwxf",
  description: "Fotografie, Kundenbereiche und Galerien von fellixwxf.",
  icons: {
    icon: "/favicon.ico?v=3",
    shortcut: "/favicon.ico?v=3",
    apple: "/icon.svg?v=3",
  },
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
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
