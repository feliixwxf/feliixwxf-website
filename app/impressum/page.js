import Link from "next/link";
import { Camera, Mail, Phone } from "lucide-react";

export const metadata = {
  title: "Impressum",
  description: "Impressum und Kontaktangaben von feliix.wxf Photography.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-neutral-200 transition hover:bg-white/15"
        >
          <Camera className="h-4 w-4" />
          Zur Website
        </Link>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl sm:p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-neutral-400">
            Rechtliches
          </p>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">Impressum</h1>

          <div className="mt-10 space-y-8 text-neutral-300">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Angaben gemäß § 5 DDG
              </h2>
              <p className="mt-3 leading-8">
                Felix Wolff
                <br />
                feliix.wxf Photography
                <br />
                Zum Großenbach 1
                <br />
                98673 Eisfeld
                <br />
                Deutschland
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">Kontakt</h2>
              <div className="mt-4 grid gap-3">
                <a
                  href="mailto:felixwolff411@gmail.com"
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 transition hover:bg-white/10"
                >
                  <Mail className="h-5 w-5 text-red-300" />
                  <span>felixwolff411@gmail.com</span>
                </a>
                <a
                  href="tel:+4915259105754"
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 transition hover:bg-white/10"
                >
                  <Phone className="h-5 w-5 text-emerald-300" />
                  <span>+49 15259105754</span>
                </a>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                Haftung für Inhalte
              </h2>
              <p className="mt-3 leading-8">
                Trotz sorgfältiger Kontrolle übernehmen wir keine Haftung für
                externe Inhalte und Links.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
