import Link from "next/link";
import { Camera, CheckCircle2, Mail } from "lucide-react";

export const metadata = {
  title: "Anfrage erhalten",
  description:
    "Deine Anfrage an feliix.wxf wurde erhalten. Ich melde mich zeitnah bei dir zurück.",
  alternates: {
    canonical: "/anfrage-erhalten",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function AnfrageErhaltenPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_32%),linear-gradient(135deg,#070707,#18181b,#2c2c2f)] px-5 py-10 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-white/15 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-2xl md:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-yellow-300/30 bg-yellow-300/15 text-yellow-300 shadow-[0_0_45px_rgba(250,204,21,0.22)]">
            <Camera className="h-9 w-9" />
          </div>

          <div className="mt-7 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.28em] text-yellow-200">
            <CheckCircle2 className="h-5 w-5" />
            Anfrage erhalten
          </div>

          <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
            Danke für deine Anfrage.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-neutral-300 md:text-lg">
            Deine Nachricht ist angekommen. Ich schaue mir deine Anfrage an und
            melde mich zeitnah bei dir zurück, damit wir dein Shooting planen
            können.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="rounded-full bg-white px-6 py-3 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 hover:bg-yellow-300"
            >
              Zurück zur Website
            </Link>
            <a
              href="mailto:felixwolff411@gmail.com"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              <Mail className="h-4 w-4" />
              E-Mail schreiben
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
