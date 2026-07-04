"use client";

import { useEffect, useRef, useState } from "react";

const EMPTY_ASSETS = {
  hero_before: { url: "" },
  hero_after: { url: "" },
};

export default function BeforeAfterSlider({ className = "" }) {
  const sliderRef = useRef(null);
  const beforeRef = useRef(null);
  const lineRef = useRef(null);
  const handleRef = useRef(null);
  const frameRef = useRef(null);
  const percentRef = useRef(50);
  const [assets, setAssets] = useState(EMPTY_ASSETS);

  useEffect(() => {
    let active = true;

    async function loadAssets() {
      try {
        const response = await fetch("/api/site-assets", { cache: "no-store" });
        const data = await response.json();

        if (!active) return;

        setAssets({
          hero_before: data.assets?.hero_before || EMPTY_ASSETS.hero_before,
          hero_after: data.assets?.hero_after || EMPTY_ASSETS.hero_after,
        });
      } catch {
        if (active) setAssets(EMPTY_ASSETS);
      }
    }

    loadAssets();

    return () => {
      active = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const updateSlider = (clientX) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    percentRef.current = Math.min(
      100,
      Math.max(0, ((clientX - rect.left) / rect.width) * 100)
    );

    if (frameRef.current) return;

    frameRef.current = requestAnimationFrame(() => {
      const percent = percentRef.current;

      if (beforeRef.current) {
        beforeRef.current.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      }
      if (lineRef.current) lineRef.current.style.left = `${percent}%`;
      if (handleRef.current) handleRef.current.style.left = `${percent}%`;

      frameRef.current = null;
    });
  };

  return (
    <div className={`rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 shadow-2xl ${className}`}>
      <div
        ref={sliderRef}
        onPointerDown={(event) => {
          sliderRef.current?.setPointerCapture(event.pointerId);
          updateSlider(event.clientX);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 1) updateSlider(event.clientX);
        }}
        className="relative aspect-[4/5] touch-none select-none overflow-hidden rounded-[1.5rem] bg-neutral-900"
      >
        {assets.hero_after?.url ? (
          <img
            src={assets.hero_after.url}
            alt="Nachher"
            draggable="false"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950" />
        )}

        <div
          ref={beforeRef}
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: "inset(0 50% 0 0)" }}
        >
          {assets.hero_before?.url ? (
            <img
              src={assets.hero_before.url}
              alt="Vorher"
              draggable="false"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-neutral-800" />
          )}
        </div>

        <div
          ref={lineRef}
          className="absolute top-0 h-full w-1 bg-white shadow-lg"
          style={{ left: "50%" }}
        />

        <div
          ref={handleRef}
          className="absolute top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-white/70 bg-black/45 text-xl text-white shadow-lg"
          style={{ left: "50%" }}
        >
          ↔
        </div>

        <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white">
          Vorher
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white">
          Nachher
        </div>
      </div>
    </div>
  );
}
