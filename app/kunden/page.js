"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  ExternalLink,
  Heart,
  Image as ImageIcon,
  Lock,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 32);
}

function getGalleryStatus(gallery) {
  if (gallery?.status === "completed") {
    return {
      label: "Abgeschlossen",
      tone: "bg-sky-300 text-neutral-950",
      text: "Das Projekt ist abgeschlossen. Favoriten bleiben weiterhin sichtbar.",
    };
  }

  return {
    label: "Aktiv",
    tone: "bg-emerald-400 text-neutral-950",
    text: "Du kannst deine Auswahl ansehen und Favoriten markieren.",
  };
}

function WatermarkOverlay({ gallery }) {
  const label = [
    "feliix.wxf",
    gallery?.access_code ? `Code ${gallery.access_code}` : "",
    gallery?.client_name || "",
  ]
    .filter(Boolean)
    .join("  •  ");
  const textShadow =
    "0 1px 2px rgba(0,0,0,0.45)";

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.06))]" />

      <div className="absolute -inset-16 grid rotate-[-19deg] grid-cols-2 gap-x-16 gap-y-16 text-center text-[9px] font-black uppercase tracking-[0.24em] text-white/28 sm:grid-cols-3 sm:text-xs">
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            key={`light-${index}`}
            className="select-none whitespace-nowrap"
            style={{ textShadow }}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="absolute -inset-16 grid rotate-[-19deg] grid-cols-2 gap-x-20 gap-y-20 text-center text-[10px] font-black uppercase tracking-[0.28em] text-black/12 sm:grid-cols-3 sm:text-sm">
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={`dark-${index}`}
            className="select-none whitespace-nowrap"
            style={{
              textShadow: "0 1px 2px rgba(255,255,255,0.2)",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CustomerGalleryPage() {
  const [accessCode, setAccessCode] = useState("");
  const [gallery, setGallery] = useState(null);
  const [images, setImages] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState("all");
  const [loading, setLoading] = useState(false);
  const [busyImageId, setBusyImageId] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const favoriteImageIds = useMemo(
    () => new Set(favorites.map((favorite) => favorite.image_id)),
    [favorites]
  );
  const favoriteImages = images.filter((image) => favoriteImageIds.has(image.id));
  const visibleImages = viewMode === "favorites" ? favoriteImages : images;
  const selectedImageIndex = selectedImage
    ? images.findIndex((image) => image.id === selectedImage.id)
    : -1;
  const coverImage = gallery?.cover_url
    ? { url: gallery.cover_url }
    : images[0];
  const galleryStatus = getGalleryStatus(gallery);
  const galleryGreetingName = String(gallery?.client_name || "").trim();
  const galleryGreeting = galleryGreetingName
    ? `Hallo, ${galleryGreetingName}.`
    : "Hallo.";

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  const messageStyle =
    messageType === "success"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
      : messageType === "error"
        ? "border-red-400/30 bg-red-500/10 text-red-100"
        : "border-yellow-400/30 bg-yellow-400/10 text-yellow-100";

  const loadGalleryByCode = async (rawCode) => {
    const code = normalizeCode(rawCode);
    if (!code) {
      showMessage("Bitte deinen Galerie-Code eingeben.", "error");
      return;
    }

    setLoading(true);
    setMessage("");

    const response = await fetch("/api/client-gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessCode: code }),
    });
    const data = await response.json();

    if (!response.ok) {
      showMessage(data.error || "Galerie konnte nicht geladen werden.", "error");
      setLoading(false);
      return;
    }

    localStorage.setItem("feliix-client-gallery-code", code);
    setAccessCode(code);
    setGallery(data.gallery);
    setImages(data.images || []);
    setFavorites(data.favorites || []);
    setViewMode("all");
    showMessage("Galerie wurde geladen.", "success");
    setLoading(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get("code");
    const savedCode = localStorage.getItem("feliix-client-gallery-code");
    const initialCode = normalizeCode(urlCode || savedCode);

    if (!initialCode) return;

    setAccessCode(initialCode);

    if (urlCode) {
      window.history.replaceState(null, "", "/kunden");
      loadGalleryByCode(initialCode);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!selectedImage) return;

      if (event.key === "Escape") {
        setSelectedImage(null);
      }

      if (event.key === "ArrowLeft") {
        showPreviousImage();
      }

      if (event.key === "ArrowRight") {
        showNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, images]);

  const loadGallery = async (event) => {
    event?.preventDefault();
    await loadGalleryByCode(accessCode);
  };

  const closeGallery = () => {
    setGallery(null);
    setImages([]);
    setFavorites([]);
    setSelectedImage(null);
    setViewMode("all");
    setMessage("");
  };

  const showPreviousImage = () => {
    if (!images.length || selectedImageIndex < 0) return;
    const nextIndex = selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1;
    setSelectedImage(images[nextIndex]);
  };

  const showNextImage = () => {
    if (!images.length || selectedImageIndex < 0) return;
    const nextIndex = selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1;
    setSelectedImage(images[nextIndex]);
  };

  const toggleFavorite = async (image) => {
    if (!gallery || busyImageId) return;

    const isFavorite = favoriteImageIds.has(image.id);
    const nextFavorites = isFavorite
      ? favorites.filter((favorite) => favorite.image_id !== image.id)
      : [
          ...favorites,
          {
            image_id: image.id,
            gallery_id: gallery.id,
            created_at: new Date().toISOString(),
          },
        ];

    setFavorites(nextFavorites);
    setBusyImageId(image.id);

    const response = await fetch("/api/client-gallery/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accessCode: gallery.access_code,
        imageId: image.id,
        favorite: !isFavorite,
      }),
    });

    if (!response.ok) {
      setFavorites(favorites);
      const data = await response.json().catch(() => ({}));
      showMessage(data.error || "Favorit konnte nicht gespeichert werden.", "error");
    }

    setBusyImageId("");
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_32%),linear-gradient(135deg,#070707,#151518,#262629)] px-4 py-6 text-white sm:px-5 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Zur Website
          </Link>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/konto"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:bg-white/15"
            >
              <ShieldCheck className="h-4 w-4" />
              Kundenkonto
            </Link>

          {gallery && (
            <button
              type="button"
              onClick={closeGallery}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
            >
              <Lock className="h-4 w-4" />
              Andere Galerie öffnen
            </button>
          )}
          </div>
        </div>

        <section className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.08] shadow-2xl backdrop-blur-xl sm:mt-8 sm:rounded-[2rem]">
          {!gallery ? (
            <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                  <Lock className="h-6 w-6" />
                </div>
                <p className="mt-8 text-sm uppercase tracking-[0.3em] text-neutral-400">
                  Kundengalerie
                </p>
                <h1 className="mt-4 text-4xl font-black md:text-6xl">
                  Bilder ansehen.
                  <br />
                  Favoriten markieren.
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-300">
                  Gib den Code ein, den du von feliix.wxf bekommen hast. Danach
                  siehst du deine private Auswahl.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Privat", "Nur mit deinem Code sichtbar."],
                    ["Auswahl", "Favoriten werden gespeichert."],
                    ["Download", "Sobald Downloads freigegeben sind."],
                  ].map(([title, text]) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                    >
                      <p className="text-sm font-black">{title}</p>
                      <p className="mt-2 text-xs leading-5 text-neutral-400">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <form
                onSubmit={loadGallery}
                className="self-center rounded-[1.5rem] border border-white/10 bg-black/25 p-6"
              >
                <label className="block">
                  <span className="text-sm font-bold text-neutral-200">
                    Galerie-Code
                  </span>
                  <input
                    value={accessCode}
                    onChange={(event) => {
                      setAccessCode(event.target.value.toUpperCase());
                      setMessage("");
                    }}
                    placeholder="z. B. GAL-ABC123"
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-white px-4 py-4 text-lg font-black tracking-[0.12em] text-neutral-950 outline-none focus:border-yellow-400"
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-black text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <ImageIcon className="h-5 w-5" />
                  )}
                  {loading ? "Lädt..." : "Galerie öffnen"}
                </button>

                {message && (
                  <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${messageStyle}`}>
                    {message}
                  </div>
                )}
              </form>
            </div>
          ) : (
            <div>
              <header className="relative overflow-hidden border-b border-white/10">
                {coverImage && (
                  <img
                    src={coverImage.url}
                    alt=""
                    className="absolute inset-0 h-full w-full scale-105 object-cover opacity-20 blur-sm"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-black via-black/75 to-black/35" />

                <div className="relative grid gap-6 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
                      Kundengalerie
                    </p>
                    <motion.h1
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="mt-3 max-w-4xl text-4xl font-black leading-tight md:text-6xl"
                    >
                      {galleryGreeting}
                      <br />
                      {gallery.title}
                    </motion.h1>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-300 md:text-lg md:leading-8">
                      {galleryStatus.text}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2 text-sm">
                      <span className={`rounded-full px-4 py-2 font-black ${galleryStatus.tone}`}>
                        {galleryStatus.label}
                      </span>
                      {gallery.expires_at && (
                        <span className="rounded-full bg-white/10 px-4 py-2 font-bold text-neutral-200">
                          bis {formatDate(gallery.expires_at)}
                        </span>
                      )}
                      <span className="rounded-full bg-white/10 px-4 py-2 font-bold text-neutral-200">
                        Code {gallery.access_code}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-[1.3rem] border border-white/10 bg-black/30 p-2 backdrop-blur">
                    <div className="rounded-2xl bg-white/[0.08] p-3 text-center">
                      <p className="text-2xl font-black">{images.length}</p>
                      <p className="mt-1 text-xs text-neutral-400">Bilder</p>
                    </div>
                    <div className="rounded-2xl bg-yellow-400/10 p-3 text-center text-yellow-100">
                      <p className="text-2xl font-black">{favorites.length}</p>
                      <p className="mt-1 text-xs">Favoriten</p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.08] p-3 text-center">
                      <p
                        className={`text-sm font-black ${
                          gallery.downloads_enabled
                            ? "text-emerald-200"
                            : "text-neutral-200"
                        }`}
                      >
                        {gallery.downloads_enabled ? "Frei" : "Gesperrt"}
                      </p>
                      <p className="mt-1 text-xs text-neutral-400">Download</p>
                    </div>
                  </div>
                </div>
              </header>

              <div className="p-6 md:p-8">
                <div className="flex flex-col gap-3 rounded-[1.3rem] border border-white/10 bg-black/25 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setViewMode("all")}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition ${
                        viewMode === "all"
                          ? "bg-white text-neutral-950"
                          : "bg-white/10 text-neutral-200 hover:bg-white/15"
                      }`}
                    >
                      <ImageIcon className="h-4 w-4" />
                      Alle Bilder
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("favorites")}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition ${
                        viewMode === "favorites"
                          ? "bg-yellow-400 text-neutral-950"
                          : "bg-white/10 text-neutral-200 hover:bg-white/15"
                      }`}
                    >
                      <Heart className="h-4 w-4" />
                      Favoriten
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/[0.08] px-4 py-2 text-sm font-bold text-neutral-300">
                      {visibleImages.length} von {images.length} Bildern
                    </span>
                    <button
                      type="button"
                      onClick={loadGallery}
                      disabled={loading}
                      className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15 disabled:opacity-60"
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                      Neu laden
                    </button>
                  </div>
                </div>

                {message && (
                  <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${messageStyle}`}>
                    {message}
                  </div>
                )}

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleImages.length === 0 && (
                    <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-6 text-neutral-300 sm:col-span-2 lg:col-span-3">
                      {viewMode === "favorites"
                        ? "Du hast noch keine Favoriten markiert."
                        : "In dieser Galerie sind noch keine Bilder."}
                    </div>
                  )}

                  {visibleImages.map((image) => {
                    const imageIndex = images.findIndex((item) => item.id === image.id);
                    const isFavorite = favoriteImageIds.has(image.id);

                    return (
                      <article
                        key={image.id}
                        className="group overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/25"
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedImage(image)}
                          className="relative block aspect-[4/3] w-full overflow-hidden bg-black/30"
                        >
                          <img
                            src={image.url}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            draggable="false"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                          />
                          {!gallery.downloads_enabled && (
                            <WatermarkOverlay gallery={gallery} />
                          )}
                          <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-black text-white backdrop-blur">
                            Bild {imageIndex + 1}
                          </span>
                          {isFavorite && (
                            <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-black shadow-lg">
                              <Heart className="h-4 w-4 fill-current" />
                            </span>
                          )}
                        </button>

                        <div className="flex items-center justify-between gap-3 p-4">
                          <button
                            type="button"
                            onClick={() => setSelectedImage(image)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold transition hover:bg-white/15"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Groß
                          </button>

                          <div className="flex gap-2">
                            {gallery.downloads_enabled && (
                              <a
                                href={image.url}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl"
                                aria-label="Bild herunterladen"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => toggleFavorite(image)}
                              disabled={busyImageId === image.id}
                              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition disabled:opacity-60 ${
                                isFavorite
                                  ? "border-yellow-400 bg-yellow-400 text-black"
                                  : "border-white/10 bg-white/10 text-white hover:bg-white/15"
                              }`}
                              aria-label="Favorit markieren"
                            >
                              {busyImageId === image.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Heart
                                  className={`h-4 w-4 ${
                                    isFavorite ? "fill-current" : ""
                                  }`}
                                />
                              )}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <section className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-neutral-950">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-black">Auswahl gespeichert</h2>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-300">
                        Deine Favoriten werden direkt gespeichert. Du kannst die
                        Galerie später erneut über den gleichen Code oder QR-Code
                        öffnen und weiter auswählen.
                      </p>
                    </div>
                    </div>

                    {!gallery.downloads_enabled && (
                      <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-sm font-bold text-yellow-100">
                        Downloads werden vom Admin freigeschaltet.
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}
        </section>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 p-4 backdrop-blur-lg">
          <div className="mx-auto flex min-h-full max-w-6xl items-center justify-center">
            <div className="w-full">
              <div className="mb-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={showPreviousImage}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                  aria-label="Vorheriges Bild"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-neutral-200 backdrop-blur">
                    {selectedImageIndex + 1} / {images.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-neutral-950 transition hover:scale-105"
                    aria-label="Bild schließen"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={showNextImage}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                  aria-label="Nächstes Bild"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>

              <div className="relative overflow-hidden rounded-[1.2rem] bg-black/30">
                <img
                  src={selectedImage.url}
                  alt=""
                  decoding="async"
                  draggable="false"
                  className="max-h-[80vh] w-full object-contain"
                />
                {!gallery?.downloads_enabled && (
                  <WatermarkOverlay gallery={gallery} />
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleFavorite(selectedImage)}
                  disabled={busyImageId === selectedImage.id}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-3 font-black transition disabled:opacity-60 ${
                    favoriteImageIds.has(selectedImage.id)
                      ? "bg-yellow-400 text-neutral-950"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {favoriteImageIds.has(selectedImage.id) ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Heart className="h-5 w-5" />
                  )}
                  {favoriteImageIds.has(selectedImage.id)
                    ? "Favorit markiert"
                    : "Als Favorit markieren"}
                </button>

                {gallery?.downloads_enabled && (
                  <a
                    href={selectedImage.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 font-black text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <Download className="h-5 w-5" />
                    Bild herunterladen
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
