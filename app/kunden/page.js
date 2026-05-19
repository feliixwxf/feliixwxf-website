"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Heart,
  Image as ImageIcon,
  Lock,
  RefreshCw,
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

export default function CustomerGalleryPage() {
  const [accessCode, setAccessCode] = useState("");
  const [gallery, setGallery] = useState(null);
  const [images, setImages] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busyImageId, setBusyImageId] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    const savedCode = localStorage.getItem("feliix-client-gallery-code");
    if (savedCode) setAccessCode(savedCode);
  }, []);

  const favoriteImageIds = new Set(favorites.map((favorite) => favorite.image_id));

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

  const loadGallery = async (event) => {
    event?.preventDefault();
    const code = normalizeCode(accessCode);

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
    showMessage("Galerie wurde geladen.", "success");
    setLoading(false);
  };

  const closeGallery = () => {
    setGallery(null);
    setImages([]);
    setFavorites([]);
    setSelectedImage(null);
    setMessage("");
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_32%),linear-gradient(135deg,#070707,#151518,#262629)] px-5 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Zur Website
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

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] shadow-2xl backdrop-blur-xl">
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
                  {loading ? "Laedt..." : "Galerie öffnen"}
                </button>

                {message && (
                  <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${messageStyle}`}>
                    {message}
                  </div>
                )}
              </form>
            </div>
          ) : (
            <div className="p-6 md:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
                    {gallery.client_name || "Kundengalerie"}
                  </p>
                  <h1 className="mt-3 text-4xl font-black md:text-6xl">
                    {gallery.title}
                  </h1>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full bg-white/10 px-4 py-2 font-bold text-neutral-200">
                      {images.length} Bilder
                    </span>
                    <span className="rounded-full bg-yellow-400 px-4 py-2 font-black text-black">
                      {favorites.length} Favoriten
                    </span>
                    {gallery.downloads_enabled && (
                      <span className="rounded-full bg-emerald-400 px-4 py-2 font-black text-neutral-950">
                        Downloads aktiv
                      </span>
                    )}
                    {gallery.expires_at && (
                      <span className="rounded-full bg-white/10 px-4 py-2 font-bold text-neutral-200">
                        bis {formatDate(gallery.expires_at)}
                      </span>
                    )}
                  </div>
                </div>

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

              {message && (
                <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${messageStyle}`}>
                  {message}
                </div>
              )}

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {images.length === 0 && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-6 text-neutral-300 sm:col-span-2 lg:col-span-3">
                    In dieser Galerie sind noch keine Bilder.
                  </div>
                )}

                {images.map((image, index) => {
                  const isFavorite = favoriteImageIds.has(image.id);

                  return (
                    <article
                      key={image.id}
                      className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/25"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedImage(image)}
                        className="block aspect-[4/3] w-full bg-black/30"
                      >
                        <img
                          src={image.url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                        />
                      </button>
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-bold text-neutral-300">
                            Bild {index + 1}
                          </p>
                          <button
                            type="button"
                            onClick={() => toggleFavorite(image)}
                            disabled={busyImageId === image.id}
                            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition disabled:opacity-60 ${
                              isFavorite
                                ? "border-yellow-400 bg-yellow-400 text-black"
                                : "border-white/10 bg-white/10 text-white hover:bg-white/15"
                            }`}
                            aria-label="Favorit markieren"
                          >
                            <Heart
                              className={`h-5 w-5 ${
                                isFavorite ? "fill-current" : ""
                              }`}
                            />
                          </button>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedImage(image)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold transition hover:bg-white/15"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Groß
                          </button>
                          {gallery.downloads_enabled && (
                            <a
                              href={image.url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold transition hover:bg-white/15"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 p-4 backdrop-blur-lg">
          <div className="mx-auto flex min-h-full max-w-6xl items-center justify-center">
            <div className="w-full">
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-neutral-950 transition hover:scale-105"
                  aria-label="Bild schließen"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <img
                src={selectedImage.url}
                alt=""
                decoding="async"
                className="max-h-[82vh] w-full rounded-[1.5rem] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
