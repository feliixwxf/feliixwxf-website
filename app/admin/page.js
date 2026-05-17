"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  EyeOff,
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
  const [activeTab, setActiveTab] = useState("portfolio");
  const [reviewFilter, setReviewFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [busyImageId, setBusyImageId] = useState(null);

  const approvedReviews = reviews.filter((review) => review.is_approved);
  const pendingReviews = reviews.filter((review) => !review.is_approved);
  const visibleReviews =
    reviewFilter === "pending"
      ? pendingReviews
      : reviewFilter === "approved"
        ? approvedReviews
        : reviews;
  const imagesByCategory = CATEGORIES.map((category) => ({
    ...category,
    images: images.filter((image) => image.category === category.value),
  }));
  const tabs = [
    { value: "portfolio", label: "Portfolio", count: images.length },
    { value: "reviews", label: "Bewertungen", count: pendingReviews.length },
    { value: "settings", label: "Einstellungen" },
  ];

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

  const setReviewApproval = async (review, isApproved) => {
    setBusyId(review.id);
    setMessage("");

    const response = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: review.id,
        is_approved: isApproved,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(
        data.error || "Bewertungsstatus konnte nicht geaendert werden."
      );
      setBusyId(null);
      return;
    }

    setReviews((current) =>
      current.map((item) => (item.id === review.id ? data.review : item))
    );
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
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-5">
                <p className="text-sm text-neutral-400">Portfolio-Bilder</p>
                <p className="mt-2 text-3xl font-black">{images.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-yellow-400/20 bg-yellow-400/10 p-5">
                <p className="text-sm text-yellow-100">Warten auf Freigabe</p>
                <p className="mt-2 text-3xl font-black">
                  {pendingReviews.length}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-5">
                <p className="text-sm text-emerald-100">Oeffentlich sichtbar</p>
                <p className="mt-2 text-3xl font-black">
                  {approvedReviews.length}
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-2 overflow-x-auto rounded-full border border-white/10 bg-white/[0.06] p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition ${
                    activeTab === tab.value
                      ? "bg-white text-neutral-950"
                      : "text-neutral-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {tab.label}
                  {typeof tab.count === "number" && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        activeTab === tab.value
                          ? "bg-neutral-950 text-white"
                          : "bg-white/10 text-neutral-200"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === "portfolio" && (
              <div className="mt-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-neutral-400">
                      Portfolio
                    </p>
                    <h2 className="mt-3 text-3xl font-black">
                      Bilder verwalten
                    </h2>
                    <p className="mt-3 max-w-2xl text-neutral-300">
                      Hochgeladene Bilder erscheinen vorne in der passenden
                      Galerie. Die Portfolio-Titelbilder bleiben unveraendert.
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

                <div className="mt-8 space-y-8">
                  {images.length === 0 && (
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6 text-neutral-300">
                      Noch keine hochgeladenen Portfolio-Bilder vorhanden.
                    </div>
                  )}

                  {imagesByCategory.map((category) => (
                    <div key={category.value}>
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-black">{category.label}</h3>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-neutral-300">
                          {category.images.length} Bilder
                        </span>
                      </div>

                      {category.images.length === 0 ? (
                        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 text-sm text-neutral-400">
                          Noch keine Uploads in dieser Kategorie.
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {category.images.map((image) => (
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
                                  {category.label}
                                </div>
                                <button
                                  onClick={() => deleteImage(image)}
                                  disabled={busyImageId === image.id}
                                  className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-100 transition hover:bg-red-500/20 disabled:opacity-60"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  {busyImageId === image.id
                                    ? "Loescht..."
                                    : "Loeschen"}
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="mt-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-neutral-400">
                      Bewertungen
                    </p>
                    <h2 className="mt-3 text-3xl font-black">
                      Bewertungen moderieren
                    </h2>
                    <p className="mt-3 text-sm text-neutral-400">
                      {pendingReviews.length} wartet auf Freigabe ·{" "}
                      {approvedReviews.length} sichtbar
                    </p>
                  </div>

                  <button
                    onClick={loadReviews}
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Neu laden
                  </button>
                </div>

                <div className="mt-6 flex gap-2 overflow-x-auto">
                  {[
                    {
                      value: "pending",
                      label: "Wartet auf Freigabe",
                      count: pendingReviews.length,
                    },
                    {
                      value: "approved",
                      label: "Oeffentlich",
                      count: approvedReviews.length,
                    },
                    { value: "all", label: "Alle", count: reviews.length },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setReviewFilter(filter.value)}
                      className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                        reviewFilter === filter.value
                          ? "bg-white text-neutral-950"
                          : "border border-white/10 bg-white/10 text-neutral-300 hover:bg-white/15"
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>

                <div className="mt-6 grid gap-4">
                  {visibleReviews.length === 0 && (
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6 text-neutral-300">
                      In dieser Ansicht gibt es gerade keine Bewertungen.
                    </div>
                  )}

                  {visibleReviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6 backdrop-blur-md"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex gap-1">
                              {renderStars(review.stars)}
                            </div>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                review.is_approved
                                  ? "bg-emerald-400 text-neutral-950"
                                  : "bg-yellow-400 text-neutral-950"
                              }`}
                            >
                              {review.is_approved
                                ? "Oeffentlich"
                                : "Wartet auf Freigabe"}
                            </span>
                          </div>
                          <h3 className="mt-4 text-xl font-black">
                            {review.name}
                          </h3>
                          <p className="mt-3 leading-7 text-neutral-300">
                            "{review.text}"
                          </p>
                          <p className="mt-4 text-xs uppercase tracking-[0.22em] text-neutral-500">
                            {review.created_at
                              ? new Date(review.created_at).toLocaleString(
                                  "de-DE"
                                )
                              : "Ohne Datum"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 md:justify-end">
                          {review.is_approved ? (
                            <button
                              onClick={() => setReviewApproval(review, false)}
                              disabled={busyId === review.id}
                              className="inline-flex w-fit items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-100 transition hover:bg-yellow-500/20 disabled:opacity-60"
                            >
                              <EyeOff className="h-4 w-4" />
                              Ausblenden
                            </button>
                          ) : (
                            <button
                              onClick={() => setReviewApproval(review, true)}
                              disabled={busyId === review.id}
                              className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-100 transition hover:bg-emerald-500/20 disabled:opacity-60"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Freigeben
                            </button>
                          )}

                          <button
                            onClick={() => deleteReview(review)}
                            disabled={busyId === review.id}
                            className="inline-flex w-fit items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-100 transition hover:bg-red-500/20 disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" />
                            Loeschen
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6">
                <p className="text-sm uppercase tracking-[0.28em] text-neutral-400">
                  Einstellungen
                </p>
                <h2 className="mt-3 text-3xl font-black">
                  Vorbereitung fuer die naechsten Funktionen
                </h2>
                <p className="mt-4 max-w-2xl leading-7 text-neutral-300">
                  Hier koennen spaeter Portfolio-Titelbilder, Startseitenbilder,
                  Kontaktdaten und weitere Website-Inhalte verwaltet werden.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
