"use client";

import { ArrowLeft, Camera } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LegalBackButton() {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <div className="sticky top-4 z-30">
      <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-neutral-950/85 p-1.5 shadow-2xl backdrop-blur-xl">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </button>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-neutral-300 transition hover:bg-white/10 hover:text-white"
        >
          <Camera className="h-4 w-4" />
          Startseite
        </a>
      </div>
    </div>
  );
}
