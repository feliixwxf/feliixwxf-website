"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
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
import ReportUserErrorButton from "@/components/report-user-error-button";

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

function ClientImage({ src, alt = "", className = "", sizes = "100vw", priority = false }) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-neutral-900 text-neutral-600 ${className}`}
      >
        <ImageIcon className="h-7 w-7" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      unoptimized={String(src).startsWith("http")}
      className={className}
    />
  );
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

function GalleryNotice({ message, type = "info" }) {
  if (!message) return null;

  const tone =
    type === "success"
      ? {
          className: "border-emerald-400/25 bg-emerald-400/10 text-emerald-50",
          icon: <CheckCircle2 className="h-5 w-5" />,
        }
      : type === "error"
        ? {
            className: "border-red-400/25 bg-red-500/10 text-red-50",
            icon: <X className="h-5 w-5" />,
          }
        : {
            className: "border-yellow-400/25 bg-yellow-400/10 text-yellow-50",
            icon: <ShieldCheck className="h-5 w-5" />,
          };

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm shadow-lg shadow-black/10 ${tone.className}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{tone.icon}</span>
        <div>
          <p className="leading-6">{message}</p>
          {type === "error" && (
            <ReportUserErrorButton
              page="/kunden"
              source="Kundengalerie"
              message={message}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function CustomerGalleryPage() {
  const prefersReducedMotion = useReducedMotion();
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
  const favoriteCount = favorites.length;
  const favoriteProgress =
    images.length > 0 ? Math.round((favoriteCount / images.length) * 100) : 0;
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
  const galleryWelcomeMessage = String(gallery?.welcome_message || "").trim();
  const galleryHeroText = galleryStatus.text;
  const galleryActionHint =
    gallery?.status === "completed"
      ? "Deine Galerie ist abgeschlossen. Du kannst deine Favoriten und Bilder weiterhin ansehen."
      : "Markiere deine Favoriten. Deine Auswahl wird direkt gespeichert und ist für mich im Admin sichtbar.";
  const galleryDownloadHint = gallery?.downloads_enabled
    ? "Downloads sind freigegeben."
    : "Downloads sind aktuell deaktiviert. Die Bilder sind als geschützte Vorschau sichtbar.";
  const getImageDownloadUrl = (image) =>
    image?.id
      ? `/api/client-gallery/download?image=${encodeURIComponent(image.id)}`
      : "";

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
  };

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

    queueMicrotask(() => {
      setAccessCode(initialCode);

      if (urlCode) {
        window.history.replaceState(null, "", "/kunden");
        loadGalleryByCode(initialCode);
      }
    });
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

  function showPreviousImage() {
    if (!images.length || selectedImageIndex < 0) return;
    const nextIndex = selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1;
    setSelectedImage(images[nextIndex]);
  }

  function showNextImage() {
    if (!images.length || selectedImageIndex < 0) return;
    const nextIndex = selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1;
    setSelectedImage(images[nextIndex]);
  }

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
    <main className="min-h-screen overflow-x-hidden bg-[#080808] px-4 py-5 text-white sm:px-6 sm:py-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_8%,rgba(250,204,21,0.14),transparent_30%),radial-gradient(circle_at_86%_20%,rgba(255,255,255,0.09),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent)]" />

      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-3 sm:flex sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:bg-white/15 sm:w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Zur Website
          </Link>

          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <Link
              href="/konto"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:bg-white/15 sm:w-fit"
            >
              <ShieldCheck className="h-4 w-4" />
              Kundenkonto
            </Link>

          {gallery && (
            <button
              type="button"
              onClick={closeGallery}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15 sm:w-fit"
            >
              <Lock className="h-4 w-4" />
              Andere Galerie öffnen
            </button>
          )}
          </div>
        </div>

        <section className="mt-4 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#151515]/92 shadow-[0_30px_120px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:mt-8 sm:rounded-[2rem]">
          {!gallery ? (
            <div className="grid overflow-hidden lg:grid-cols-[0.54fr_0.46fr]">
              <div className="relative min-h-[210px] overflow-hidden lg:min-h-[620px]">
                <motion.div
                  className="absolute inset-0"
                  animate={
                    prefersReducedMotion
                      ? undefined
                      : { scale: [1, 1.045, 1.02], x: [0, -8, 0] }
                  }
                  transition={
                    prefersReducedMotion
                      ? undefined
                      : {
                          duration: 18,
                          repeat: Infinity,
                          repeatType: "mirror",
                          ease: "easeInOut",
                        }
                  }
                >
                  <Image
                    src="/images/abititel.jpg"
                    alt="Private Kundengalerie von feliix.wxf"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 648px"
                    className="object-cover"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/58 to-black/18 lg:bg-gradient-to-br lg:from-black/92 lg:via-black/45 lg:to-black/18" />
                <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />

                <div className="relative flex h-full min-h-[210px] flex-col justify-end p-5 sm:p-8 lg:min-h-[620px] lg:p-10">
                  <p className="text-xs font-black uppercase tracking-[0.32em] text-yellow-200/90">
                    Private Client Lounge
                  </p>
                  <h1 className="mt-4 text-3xl font-black leading-tight text-white md:text-5xl">
                    Deine private Galerie.
                  </h1>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-neutral-200 md:text-base">
                    Öffne deine Bilder, speichere Favoriten und lade sie herunter,
                    sobald der Download freigegeben ist.
                  </p>
                  <div className="mt-6 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    {[
                      [ShieldCheck, "Privat geschützt"],
                      [Heart, "Favoriten speichern"],
                      [Download, "Bilder herunterladen"],
                    ].map(([Icon, label]) => (
                      <div
                        key={label}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 text-xs font-bold text-white/90 backdrop-blur"
                      >
                        <Icon className="h-4 w-4 text-yellow-300" />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <form
                method="post"
                onSubmit={loadGallery}
                className="flex flex-col justify-center bg-[#111]/95 p-5 sm:p-8 lg:p-10"
              >
                <p className="text-xs font-black uppercase tracking-[0.28em] text-neutral-500">
                  Galeriecode
                </p>
                <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
                  Schön, dass du da bist.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-neutral-400">
                  Gib deinen persönlichen Code ein, um direkt in deine private
                  Galerie zu kommen.
                </p>

                <label className="block">
                  <span className="mt-7 block text-sm font-semibold text-neutral-300">
                    Galerie-Code
                  </span>
                  <input
                    value={accessCode}
                    onChange={(event) => {
                      setAccessCode(event.target.value.toUpperCase());
                      setMessage("");
                    }}
                    placeholder="z. B. GAL-ABC123"
                    className="mt-2 h-14 w-full rounded-2xl border border-white/10 bg-[#202020] px-4 text-base font-black tracking-[0.08em] text-white outline-none transition placeholder:text-neutral-600 focus:border-yellow-400 focus:bg-[#242424] focus:ring-2 focus:ring-yellow-400/15 sm:tracking-[0.12em]"
                  />
                </label>
                <p className="mt-3 text-sm leading-6 text-neutral-500">
                  Den Code findest du in deiner persönlichen Nachricht.
                </p>

                <div className="mt-5">
                  <GalleryNotice message={message} type={messageType} />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 text-sm font-black text-black shadow-[0_18px_60px_rgba(250,204,21,0.16)] transition hover:-translate-y-0.5 hover:bg-yellow-300 disabled:opacity-60"
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <ImageIcon className="h-5 w-5" />
                  )}
                  {loading ? "Lädt..." : "Private Galerie öffnen"}
                </button>

                <Link
                  href="/konto"
                  className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-bold text-neutral-200 transition hover:bg-white/[0.1]"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Zum Kundenkonto
                </Link>
              </form>
            </div>
          ) : (
            <div>
              <header className="relative overflow-hidden border-b border-white/10">
                {coverImage && (
                  <ClientImage
                    src={coverImage.url}
                    alt=""
                    priority
                    sizes="100vw"
                    className="scale-105 object-cover opacity-20 blur-sm"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-black via-black/75 to-black/35" />

                <div className="relative grid gap-5 p-4 sm:p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-neutral-400 sm:text-sm sm:tracking-[0.3em]">
                      Kundengalerie
                    </p>
                    <motion.h1
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="mt-3 max-w-4xl text-3xl font-black leading-tight sm:text-4xl md:text-6xl"
                    >
                      {galleryGreeting}
                      <br />
                      {gallery.title}
                    </motion.h1>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-300 sm:text-base sm:leading-7 md:text-lg md:leading-8">
                      {galleryHeroText}
                    </p>

                    {galleryWelcomeMessage && (
                      <div className="mt-5 max-w-2xl rounded-[1.4rem] border border-yellow-400/25 bg-yellow-400/10 p-4 text-yellow-50 shadow-[0_18px_60px_rgba(250,204,21,0.08)] backdrop-blur">
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-100/70">
                          Persönliche Nachricht
                        </p>
                        <p className="mt-2 text-sm leading-7 md:text-base">
                          {galleryWelcomeMessage}
                        </p>
                      </div>
                    )}

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

                  <div className="grid grid-cols-3 gap-1.5 rounded-[1.1rem] border border-white/10 bg-black/30 p-1.5 backdrop-blur sm:gap-2 sm:rounded-[1.3rem] sm:p-2">
                    <div className="rounded-2xl bg-white/[0.08] p-2 text-center sm:p-3">
                      <p className="text-xl font-black sm:text-2xl">{images.length}</p>
                      <p className="mt-1 text-xs text-neutral-400">Bilder</p>
                    </div>
                    <div className="rounded-2xl bg-yellow-400/10 p-2 text-center text-yellow-100 sm:p-3">
                      <p className="text-xl font-black sm:text-2xl">{favoriteCount}</p>
                      <p className="mt-1 text-xs">Auswahl</p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.08] p-2 text-center sm:p-3">
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

              <div className="p-4 sm:p-6 md:p-8">
                <div className="mb-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.06] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
                      Nächster Schritt
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-300">
                      {galleryActionHint}
                    </p>
                  </div>
                  <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.06] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
                      Download
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-300">
                      {galleryDownloadHint}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <GalleryNotice message={message} type={messageType} />
                </div>

                <div className="flex flex-col gap-3 rounded-[1.3rem] border border-white/10 bg-black/25 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    <button
                      type="button"
                      onClick={() => setViewMode("all")}
                      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-black transition ${
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
                      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-black transition ${
                        viewMode === "favorites"
                          ? "bg-yellow-400 text-neutral-950"
                          : "bg-white/10 text-neutral-200 hover:bg-white/15"
                      }`}
                    >
                      <Heart className="h-4 w-4" />
                      Favoriten
                    </button>
                  </div>

                  <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center">
                    <span className="inline-flex items-center justify-center gap-2 rounded-full bg-yellow-400/10 px-4 py-2 text-center text-sm font-black text-yellow-100">
                      <Heart className="h-4 w-4 fill-current" />
                      {favoriteCount} gespeichert
                    </span>
                    <span className="rounded-full bg-white/[0.08] px-4 py-2 text-center text-sm font-bold text-neutral-300">
                      Ansicht: {visibleImages.length}/{images.length}
                    </span>
                    <button
                      type="button"
                      onClick={loadGallery}
                      disabled={loading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15 disabled:opacity-60 sm:w-fit"
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                      Neu laden
                    </button>
                    {gallery.archive_download_url && (
                      <a
                        href={gallery.archive_download_url}
                        download
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-300 px-4 py-2 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-fit"
                      >
                        <Download className="h-4 w-4" />
                        ZIP herunterladen
                      </a>
                    )}
                  </div>
                </div>

                {images.length > 0 && (
                  <section className="mt-4 rounded-[1.3rem] border border-yellow-400/20 bg-yellow-400/10 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-100/70">
                          Deine Auswahl
                        </p>
                        <p className="mt-1 text-sm font-bold text-yellow-50">
                          {favoriteCount === 0
                            ? "Noch keine Favoriten markiert."
                            : `${favoriteCount} Favorit${
                                favoriteCount === 1 ? "" : "en"
                              } markiert.`}
                        </p>
                      </div>
                      <p className="text-sm leading-6 text-yellow-100/75 md:max-w-md md:text-right">
                        Alles wird automatisch gespeichert. Du kannst jederzeit
                        weiter auswählen oder Favoriten wieder entfernen.
                      </p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/25">
                      <div
                        className="h-full rounded-full bg-yellow-400 transition-all"
                        style={{ width: `${favoriteProgress}%` }}
                      />
                    </div>
                  </section>
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
                          {image.url ? (
                            <ClientImage
                              src={image.url}
                              alt=""
                              sizes="(max-width: 768px) 100vw, 360px"
                              className="object-cover transition duration-500 group-hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-bold text-neutral-500">
                              Bildlink konnte nicht geladen werden
                            </div>
                          )}
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

                        <div className="flex items-center justify-between gap-3 p-3 sm:p-4">
                          <button
                            type="button"
                            onClick={() => setSelectedImage(image)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold transition hover:bg-white/15"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Groß
                          </button>

                          <div className="flex gap-2">
                            {gallery.downloads_enabled && image.url && (
                              <a
                                href={getImageDownloadUrl(image)}
                                download
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
                              className={`inline-flex h-10 items-center justify-center gap-2 rounded-full border px-3 text-sm font-black transition disabled:opacity-60 ${
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
                              <span className="hidden sm:inline">
                                {isFavorite ? "Markiert" : "Merken"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <section className="mt-8 rounded-[1.3rem] border border-white/10 bg-white/[0.06] p-4 sm:rounded-[1.5rem] sm:p-5">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-neutral-950">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-black">Auswahl gespeichert</h2>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-300">
                        Deine Favoriten werden direkt gespeichert und im Admin
                        angezeigt. Du kannst die Galerie später erneut über den
                        gleichen Code oder QR-Code öffnen und weiter auswählen.
                      </p>
                    </div>
                    </div>

                    {!gallery.downloads_enabled && (
                      <div className="w-full rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-sm font-bold text-yellow-100 md:w-fit">
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
                {selectedImage.url ? (
                  <img
                    src={selectedImage.url}
                    alt=""
                    decoding="async"
                    draggable="false"
                    className="max-h-[80vh] w-full object-contain"
                  />
                ) : (
                  <div className="flex min-h-[320px] items-center justify-center px-6 text-center text-sm font-bold text-neutral-400">
                    Bildlink konnte nicht geladen werden. Bitte später erneut
                    öffnen.
                  </div>
                )}
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

                {gallery?.downloads_enabled && selectedImage.url && (
                  <a
                    href={getImageDownloadUrl(selectedImage)}
                    download
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
