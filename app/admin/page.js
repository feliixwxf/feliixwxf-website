"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Image as ImageIcon,
  Lock,
  LogOut,
  RefreshCw,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { value: "car", label: "Car" },
  { value: "portrait", label: "Portrait" },
  { value: "nature", label: "Nature & Street" },
  { value: "event", label: "Event" },
];

function renderStars(value) {
  return [1, 2, 3, 4, 5].map((star) => {
    const filled = Number(value) >= star;
    const half = Number(value) === star - 0.5;

    return (
      <span key={star} className="relative inline-flex">
        <Star className="h-5 w-5 text-yellow-400" />
        {(filled || half) && (
          <span
            className="absolute inset-0 overflow-hidden"
            style={{ width: half ? "50%" : "100%" }}
          >
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          </span>
        )}
      </span>
    );
  });
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [images, setImages] = useState([]);
  const [imageCategory, setImageCategory] = useState("car");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [busyImageId, setBusyImageId] = useState(null);

  const loadReviews = async () => {
    setMessage("");

    const response = await fetch("/api/admin/reviews", {
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Bewertungen konnten nicht geladen werden.");
      return;
    }

    setReviews(data.reviews || []);
  };

  const loadImages = async () => {
    setMessage("");

    const response = await fetch("/api/admin/images", {
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Bilder konnten nicht geladen werden.");
      return;
    }

    setImages(data.images || []);
  };

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((response) => response.json())
      .then(async (data) => {
        setConfigured(data.configured);
        setAuthenticated(data.authenticated);

        if (data.authenticated) {
          await Promise.all([loadReviews(), loadImages()]);
        }
      })
      .catch(() => {
        setMessage("Admin-Status konnte nicht geladen werden.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Login fehlgeschlagen.");
      setLoading(false);
      return;
    }

    setPassword("");
    setAuthenticated(true);
    await Promise.all([loadReviews(), loadImages()]);
    setLoading(false);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setReviews([]);
    setImages([]);
  };

  const uploadImage = async (event) => {
    event.preventDefault();

    if (!imageFile) {
      setMessage("Bitte zuerst ein Bild auswaehlen.");
      return;
    }

    setImageUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("category", imageCategory);
    formData.append("file", imageFile);

    const response = await fetch("/api/admin/images", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Bild konnte nicht hochgeladen werden.");
      setImageUploading(false);
      return;
    }

    setImages((current) => [data.image, ...current]);
    setImageFile(null);
    event.currentTarget.reset();
    setMessage("Bild wurde hochgeladen und ist jetzt in der Galerie.");
    setImageUploading(false);
  };

  const deleteReview = async (review) => {
    if (!window.confirm(`Bewertung von ${review.name} wirklich loeschen?`)) {
      return;
    }

    setBusyId(review.id);
    setMessage("");

    const response = await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: review.id }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Bewertung konnte nicht geloescht werden.");
      setBusyId(null);
      return;
    }

    setReviews((current) => current.filter((item) => item.id !== review.id));
    setBusyId(null);
  };

  const deleteImage = async (image) => {
    if (!window.confirm("Bild wirklich aus der Online-Galerie loeschen?")) {
      return;
    }

    setBusyImageId(image.id);
    setMessage("");

    const response = await fetch("/api/admin/images", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: image.id }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Bild konnte nicht geloescht werden.");
      setBusyImageId(null);
      return;
    }

    setImages((current) => current.filter((item) => item.id !== image.id));
    setBusyImageId(null);
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#080808,#151515,#242427)] px-5 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              Zur Website
            </Link>
            <h1 className="mt-6 text-4xl font-black md:text-5xl">
              Admin Bereich
            </h1>
            <p className="mt-3 max-w-xl text-neutral-300">
              Hier kannst du spaeter deine Website-Inhalte verwalten. Als erstes
              ist das Loeschen von Bewertungen freigeschaltet.
            </p>
          </div>

          {authenticated && (
            <button
              onClick={handleLogout}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
            >
              <LogOut className="h-4 w-4" />
              Ausloggen
            </button>
          )}
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-5 py-4 text-sm text-yellow-100">
            {message}
          </div>
        )}

        {!configured && (
          <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-red-100">
            ADMIN_PASSWORD oder ADMIN_SESSION_SECRET fehlt noch in Vercel.
          </div>
        )}

        {!authenticated ? (
          <form
            onSubmit={handleLogin}
            className="mt-10 max-w-md rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6 backdrop-blur-md"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <Lock className="h-5 w-5" />
            </div>

            <label className="text-sm font-semibold text-neutral-300">
              Admin Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-yellow-400"
              placeholder="Passwort eingeben"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-2xl bg-white px-5 py-3 font-bold text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
            >
              {loading ? "Pruefe..." : "Einloggen"}
            </button>
          </form>
        ) : (
          <section className="mt-10">
            <div className="mb-14">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-neutral-400">
                    Portfolio
                  </p>
                  <h2 className="mt-3 text-3xl font-black">
                    Bilder hochladen
                  </h2>
                  <p className="mt-3 max-w-2xl text-neutral-300">
                    Hochgeladene Bilder erscheinen automatisch ganz vorne in der
                    passenden Galerie.
                  </p>
                </div>

                <button
                  onClick={loadImages}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
                >
                  <RefreshCw className="h-4 w-4" />
                  Bilder neu laden
                </button>
              </div>

              <form
                onSubmit={uploadImage}
                className="mt-6 grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6 backdrop-blur-md md:grid-cols-[1fr_1fr_auto]"
              >
                <label className="block">
                  <span className="text-sm font-semibold text-neutral-300">
                    Kategorie
                  </span>
                  <select
                    value={imageCategory}
                    onChange={(event) => setImageCategory(event.target.value)}
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-yellow-400"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-neutral-300">
                    Bilddatei
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setImageFile(event.target.files?.[0] || null)
                    }
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-neutral-950 file:mr-4 file:rounded-full file:border-0 file:bg-neutral-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                  />
                </label>

                <button
                  type="submit"
                  disabled={imageUploading}
                  className="inline-flex h-fit items-center justify-center gap-2 self-end rounded-2xl bg-white px-5 py-3 font-bold text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
                >
                  <Upload className="h-4 w-4" />
                  {imageUploading ? "Laedt hoch..." : "Hochladen"}
                </button>
              </form>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {images.length === 0 && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6 text-neutral-300 sm:col-span-2 lg:col-span-3">
                    Noch keine hochgeladenen Portfolio-Bilder vorhanden.
                  </div>
                )}

                {images.map((image) => (
                  <article
                    key={image.id}
                    className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.08] backdrop-blur-md"
                  >
                    <div className="aspect-[4/3] bg-black/30">
                      <img
                        src={image.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
                        <ImageIcon className="h-4 w-4" />
                        {
                          CATEGORIES.find(
                            (category) => category.value === image.category
                          )?.label
                        }
                      </div>
                      <button
                        onClick={() => deleteImage(image)}
                        disabled={busyImageId === image.id}
                        className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-100 transition hover:bg-red-500/20 disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                        {busyImageId === image.id ? "Loescht..." : "Loeschen"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-neutral-400">
                  Bewertungen
                </p>
                <h2 className="mt-3 text-3xl font-black">
                  {reviews.length} Eintraege
                </h2>
              </div>

              <button
                onClick={loadReviews}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
              >
                <RefreshCw className="h-4 w-4" />
                Neu laden
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              {reviews.length === 0 && (
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6 text-neutral-300">
                  Noch keine Online-Bewertungen vorhanden.
                </div>
              )}

              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6 backdrop-blur-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex gap-1">
                        {renderStars(review.stars)}
                      </div>
                      <h3 className="mt-4 text-xl font-black">
                        {review.name}
                      </h3>
                      <p className="mt-3 leading-7 text-neutral-300">
                        "{review.text}"
                      </p>
                      <p className="mt-4 text-xs uppercase tracking-[0.22em] text-neutral-500">
                        {review.created_at
                          ? new Date(review.created_at).toLocaleString("de-DE")
                          : "Ohne Datum"}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteReview(review)}
                      disabled={busyId === review.id}
                      className="inline-flex w-fit items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-100 transition hover:bg-red-500/20 disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      {busyId === review.id ? "Loescht..." : "Loeschen"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
