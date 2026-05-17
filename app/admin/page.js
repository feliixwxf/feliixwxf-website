"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  EyeOff,
  Eye,
  Image as ImageIcon,
  Images,
  Lock,
  LogOut,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { value: "car", label: "Car" },
  { value: "portrait", label: "Portrait" },
  { value: "nature", label: "Nature & Street" },
  { value: "event", label: "Event" },
];

const SITE_ASSET_GROUPS = [
  {
    title: "Startseite",
    description: "Diese Bilder steuern den Vorher/Nachher-Slider oben auf der Website.",
    assets: [
      { key: "hero_before", label: "Vorher-Bild" },
      { key: "hero_after", label: "Nachher-Bild" },
    ],
  },
  {
    title: "Portfolio-Titelbilder",
    description: "Diese Bilder sind nur die Kacheln im Portfolio. Die Galerie selbst bleibt getrennt.",
    assets: [
      { key: "cover_car", label: "Car" },
      { key: "cover_portrait", label: "Portrait" },
      { key: "cover_nature", label: "Nature & Street" },
      { key: "cover_event", label: "Event" },
    ],
  },
];

const SITE_ASSET_LABELS = Object.fromEntries(
  SITE_ASSET_GROUPS.flatMap((group) =>
    group.assets.map((asset) => [asset.key, asset.label])
  )
);

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

function formatDate(value) {
  if (!value) return "Ohne Datum";

  return new Date(value).toLocaleString("de-DE");
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [images, setImages] = useState([]);
  const [siteAssets, setSiteAssets] = useState({});
  const [imageCategory, setImageCategory] = useState("car");
  const [imageFile, setImageFile] = useState(null);
  const [siteAssetFiles, setSiteAssetFiles] = useState({});
  const [siteAssetPreviews, setSiteAssetPreviews] = useState({});
  const [activeTab, setActiveTab] = useState("portfolio");
  const [reviewFilter, setReviewFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [siteAssetUploadingKey, setSiteAssetUploadingKey] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [busyId, setBusyId] = useState(null);
  const [busyImageId, setBusyImageId] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

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
    images: images
      .filter((image) => image.category === category.value)
      .sort((a, b) => {
        const orderDifference =
          Number(a.sort_order || 0) - Number(b.sort_order || 0);

        if (orderDifference !== 0) return orderDifference;

        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }),
  }));
  const tabs = [
    {
      value: "portfolio",
      label: "Portfolio",
      description: "Galerie-Uploads und Reihenfolge",
      count: images.length,
      icon: Images,
    },
    {
      value: "covers",
      label: "Titelbilder",
      description: "Startseite und Portfolio-Kacheln",
      icon: ImageIcon,
    },
    {
      value: "reviews",
      label: "Bewertungen",
      description: "Freigeben, ausblenden, loeschen",
      count: pendingReviews.length,
      icon: MessageSquare,
    },
    {
      value: "settings",
      label: "Einstellungen",
      description: "Status und naechste Schritte",
      icon: ShieldCheck,
    },
  ];
  const latestReview = reviews[0];
  const latestImage = [...images].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  )[0];

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

  const loadReviews = async () => {
    setMessage("");

    const response = await fetch("/api/admin/reviews", {
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      showMessage(data.error || "Bewertungen konnten nicht geladen werden.", "error");
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
      showMessage(data.error || "Bilder konnten nicht geladen werden.", "error");
      return;
    }

    setImages(data.images || []);
  };

  const loadSiteAssets = async () => {
    setMessage("");

    const response = await fetch("/api/admin/site-assets", {
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      showMessage(
        data.error || "Titelbilder konnten nicht geladen werden.",
        "error"
      );
      return;
    }

    setSiteAssets(data.assets || {});
  };

  const refreshDashboard = async () => {
    setMessage("");
    await Promise.all([loadReviews(), loadImages(), loadSiteAssets()]);
    showMessage("Admin-Daten wurden neu geladen.", "success");
  };

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((response) => response.json())
      .then(async (data) => {
        setConfigured(data.configured);
        setAuthenticated(data.authenticated);

        if (data.authenticated) {
          await Promise.all([loadReviews(), loadImages(), loadSiteAssets()]);
        }
      })
      .catch(() => {
        showMessage("Admin-Status konnte nicht geladen werden.", "error");
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
      showMessage(data.error || "Login fehlgeschlagen.", "error");
      setLoading(false);
      return;
    }

    setPassword("");
    setAuthenticated(true);
    await Promise.all([loadReviews(), loadImages(), loadSiteAssets()]);
    setLoading(false);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setReviews([]);
    setImages([]);
    setSiteAssets({});
    showMessage("Du wurdest ausgeloggt.", "success");
  };

  const copyText = async (text, successMessage) => {
    try {
      await navigator.clipboard.writeText(text);
      showMessage(successMessage, "success");
    } catch {
      showMessage("Kopieren ist in diesem Browser gerade nicht moeglich.", "error");
    }
  };

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  useEffect(() => {
    const previewEntries = Object.entries(siteAssetFiles)
      .filter(([, file]) => file)
      .map(([key, file]) => [key, URL.createObjectURL(file)]);

    setSiteAssetPreviews(Object.fromEntries(previewEntries));

    return () => {
      previewEntries.forEach(([, previewUrl]) => URL.revokeObjectURL(previewUrl));
    };
  }, [siteAssetFiles]);

  const uploadImage = async (event) => {
    event.preventDefault();

    if (!imageFile) {
      showMessage("Bitte zuerst ein Bild auswaehlen.", "error");
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
      showMessage(data.error || "Bild konnte nicht hochgeladen werden.", "error");
      setImageUploading(false);
      return;
    }

    setImages((current) => [data.image, ...current]);
    setImageFile(null);
    event.currentTarget.reset();
    showMessage("Bild wurde hochgeladen und ist jetzt in der Galerie.", "success");
    setImageUploading(false);
  };

  const uploadSiteAsset = async (assetKey) => {
    const file = siteAssetFiles[assetKey];

    if (!file) {
      showMessage("Bitte zuerst ein Bild auswaehlen.", "error");
      return;
    }

    setSiteAssetUploadingKey(assetKey);
    setMessage("");

    const formData = new FormData();
    formData.append("key", assetKey);
    formData.append("file", file);

    const response = await fetch("/api/admin/site-assets", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (!response.ok) {
      showMessage(data.error || "Titelbild konnte nicht gespeichert werden.", "error");
      setSiteAssetUploadingKey(null);
      return;
    }

    setSiteAssets((current) => ({
      ...current,
      [assetKey]: data.asset,
    }));
    setSiteAssetFiles((current) => {
      const next = { ...current };
      delete next[assetKey];
      return next;
    });
    showMessage(
      `${SITE_ASSET_LABELS[assetKey] || "Titelbild"} wurde aktualisiert.`,
      "success"
    );
    setSiteAssetUploadingKey(null);
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
      showMessage(data.error || "Bewertung konnte nicht geloescht werden.", "error");
      setBusyId(null);
      return;
    }

    setReviews((current) => current.filter((item) => item.id !== review.id));
    showMessage("Bewertung wurde geloescht.", "success");
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
      showMessage(
        data.error || "Bewertungsstatus konnte nicht geaendert werden.",
        "error"
      );
      setBusyId(null);
      return;
    }

    setReviews((current) =>
      current.map((item) => (item.id === review.id ? data.review : item))
    );
    showMessage(
      isApproved
        ? "Bewertung wurde freigegeben."
        : "Bewertung wurde ausgeblendet.",
      "success"
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
      showMessage(data.error || "Bild konnte nicht geloescht werden.", "error");
      setBusyImageId(null);
      return;
    }

    setImages((current) => current.filter((item) => item.id !== image.id));
    showMessage("Bild wurde aus der Galerie geloescht.", "success");
    setBusyImageId(null);
  };

  const moveImage = async (categoryValue, imageId, direction) => {
    const categoryImages = images
      .filter((image) => image.category === categoryValue)
      .sort((a, b) => {
        const orderDifference =
          Number(a.sort_order || 0) - Number(b.sort_order || 0);

        if (orderDifference !== 0) return orderDifference;

        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
    const currentIndex = categoryImages.findIndex(
      (image) => image.id === imageId
    );
    const targetIndex = currentIndex + direction;

    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= categoryImages.length
    ) {
      return;
    }

    const nextCategoryImages = [...categoryImages];
    const [movedImage] = nextCategoryImages.splice(currentIndex, 1);
    nextCategoryImages.splice(targetIndex, 0, movedImage);

    setBusyImageId(imageId);
    setMessage("");

    setImages((current) =>
      current.map((image) => {
        const newIndex = nextCategoryImages.findIndex(
          (item) => item.id === image.id
        );

        return newIndex >= 0 ? { ...image, sort_order: newIndex } : image;
      })
    );

    const response = await fetch("/api/admin/images", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderedIds: nextCategoryImages.map((image) => image.id),
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      showMessage(
        data.error || "Sortierung konnte nicht gespeichert werden.",
        "error"
      );
      await loadImages();
    } else {
      showMessage("Sortierung wurde gespeichert.", "success");
    }

    setBusyImageId(null);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.11),transparent_28%),linear-gradient(135deg,#070707,#141416,#242427)] px-5 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
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
              Hier verwaltest du Portfolio-Bilder, Bildreihenfolge und
              Bewertungen fuer deine Website.
            </p>
          </div>

          {authenticated && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={refreshDashboard}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
              >
                <RefreshCw className="h-4 w-4" />
                Alles neu laden
              </button>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
              >
                <ExternalLink className="h-4 w-4" />
                Live ansehen
              </a>
              <button
                onClick={handleLogout}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
              >
                <LogOut className="h-4 w-4" />
                Ausloggen
              </button>
            </div>
          )}
        </div>
        </div>

        {message && (
          <div className={`mt-6 rounded-2xl border px-5 py-4 text-sm ${messageStyle}`}>
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
          <section className="mt-10 grid gap-6 lg:grid-cols-[300px_1fr]">
            <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">
                  Uebersicht
                </p>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm text-neutral-400">Portfolio-Bilder</p>
                      <Images className="h-5 w-5 text-neutral-300" />
                    </div>
                    <p className="mt-2 text-3xl font-black">{images.length}</p>
                    <p className="mt-2 line-clamp-1 text-xs text-neutral-500">
                      {latestImage
                        ? `Zuletzt: ${formatDate(latestImage.created_at)}`
                        : "Noch keine Uploads"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm text-yellow-100">Offen</p>
                      <Clock className="h-5 w-5 text-yellow-100" />
                    </div>
                    <p className="mt-2 text-3xl font-black">
                      {pendingReviews.length}
                    </p>
                    <p className="mt-2 text-xs text-yellow-100/70">
                      Bewertungen warten auf Freigabe.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm text-emerald-100">Sichtbar</p>
                      <MessageSquare className="h-5 w-5 text-emerald-100" />
                    </div>
                    <p className="mt-2 text-3xl font-black">
                      {approvedReviews.length}
                    </p>
                    <p className="mt-2 line-clamp-1 text-xs text-emerald-100/70">
                      {latestReview
                        ? `Neueste: ${latestReview.name}`
                        : "Noch keine Bewertungen"}
                    </p>
                  </div>
                </div>
              </div>

              <nav className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setActiveTab(tab.value)}
                      className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                        activeTab === tab.value
                          ? "bg-white text-neutral-950"
                          : "text-neutral-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          activeTab === tab.value
                            ? "bg-neutral-950 text-white"
                            : "bg-white/10"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 font-bold">
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
                        </span>
                        <span className="mt-0.5 block text-xs opacity-70">
                          {tab.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            <div className="min-w-0 rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-xl md:p-6">

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
                      onChange={(event) => {
                        setImageFile(event.target.files?.[0] || null);
                        setMessage("");
                      }}
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

                  {imagePreview && (
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3 md:col-span-3">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <img
                          src={imagePreview}
                          alt="Vorschau"
                          className="h-28 w-full rounded-xl object-cover sm:w-40"
                        />
                        <div>
                          <p className="text-sm font-bold text-white">
                            Ausgewaehltes Bild
                          </p>
                          <p className="mt-1 break-all text-sm text-neutral-300">
                            {imageFile?.name}
                          </p>
                          <p className="mt-1 text-xs text-neutral-500">
                            {imageFile
                              ? `${(imageFile.size / 1024 / 1024).toFixed(2)} MB`
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
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
                          {category.images.map((image, index) => (
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
                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-500">
                                  <span>Position {index + 1}</span>
                                  <span>·</span>
                                  <span>{formatDate(image.created_at)}</span>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedImage(image)}
                                    className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold text-neutral-100 transition hover:bg-white/15"
                                  >
                                    <Eye className="h-4 w-4" />
                                    Ansehen
                                  </button>

                                  <a
                                    href={image.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold text-neutral-100 transition hover:bg-white/15"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    Oeffnen
                                  </a>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyText(image.url, "Bild-URL wurde kopiert.")
                                    }
                                    className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold text-neutral-100 transition hover:bg-white/15"
                                  >
                                    <Copy className="h-4 w-4" />
                                    URL
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      moveImage(category.value, image.id, -1)
                                    }
                                    disabled={
                                      index === 0 || busyImageId === image.id
                                    }
                                    className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold text-neutral-100 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                    Hoch
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      moveImage(category.value, image.id, 1)
                                    }
                                    disabled={
                                      index === category.images.length - 1 ||
                                      busyImageId === image.id
                                    }
                                    className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold text-neutral-100 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                    Runter
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => deleteImage(image)}
                                    disabled={busyImageId === image.id}
                                    className="inline-flex w-fit items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-100 transition hover:bg-red-500/20 disabled:opacity-60"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Loeschen
                                  </button>
                                </div>
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

            {activeTab === "covers" && (
              <div className="mt-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-neutral-400">
                      Titelbilder
                    </p>
                    <h2 className="mt-3 text-3xl font-black">
                      Startseite und Portfolio-Kacheln
                    </h2>
                    <p className="mt-3 max-w-2xl text-neutral-300">
                      Hier tauschst du die sichtbaren Titelbilder, ohne die
                      Galerie-Uploads zu veraendern.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadSiteAssets}
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Titelbilder neu laden
                  </button>
                </div>

                <div className="mt-8 space-y-8">
                  {SITE_ASSET_GROUPS.map((group) => (
                    <section
                      key={group.title}
                      className="rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-6"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                          <h3 className="text-2xl font-black">{group.title}</h3>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-300">
                            {group.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {group.assets.map((asset) => {
                          const currentAsset = siteAssets[asset.key];
                          const previewUrl = siteAssetPreviews[asset.key];
                          const displayUrl = previewUrl || currentAsset?.url;

                          return (
                            <article
                              key={asset.key}
                              className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/20"
                            >
                              <div className="aspect-[4/3] bg-black/35">
                                {displayUrl ? (
                                  <img
                                    src={displayUrl}
                                    alt={asset.label}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                                    Noch kein eigenes Bild gesetzt
                                  </div>
                                )}
                              </div>

                              <div className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h4 className="text-lg font-black">
                                      {asset.label}
                                    </h4>
                                    <p className="mt-1 text-xs text-neutral-500">
                                      {currentAsset?.updated_at
                                        ? `Aktualisiert: ${formatDate(currentAsset.updated_at)}`
                                        : "Verwendet aktuell den Standardwert aus dem Code"}
                                    </p>
                                  </div>
                                  {currentAsset?.url && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        copyText(
                                          currentAsset.url,
                                          "Titelbild-URL wurde kopiert."
                                        )
                                      }
                                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/15"
                                      aria-label="Titelbild-URL kopieren"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>

                                <label className="mt-4 block">
                                  <span className="text-sm font-semibold text-neutral-300">
                                    Neues Bild auswaehlen
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                      setSiteAssetFiles((current) => ({
                                        ...current,
                                        [asset.key]:
                                          event.target.files?.[0] || null,
                                      }));
                                      setMessage("");
                                    }}
                                    className="mt-3 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-neutral-950 file:mr-4 file:rounded-full file:border-0 file:bg-neutral-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                                  />
                                </label>

                                <button
                                  type="button"
                                  onClick={() => uploadSiteAsset(asset.key)}
                                  disabled={
                                    !siteAssetFiles[asset.key] ||
                                    siteAssetUploadingKey === asset.key
                                  }
                                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Upload className="h-4 w-4" />
                                  {siteAssetUploadingKey === asset.key
                                    ? "Speichert..."
                                    : "Titelbild speichern"}
                                </button>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
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
                            {formatDate(review.created_at)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 md:justify-end">
                          {review.is_approved ? (
                            <button
                              type="button"
                              onClick={() => setReviewApproval(review, false)}
                              disabled={busyId === review.id}
                              className="inline-flex w-fit items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-100 transition hover:bg-yellow-500/20 disabled:opacity-60"
                            >
                              <EyeOff className="h-4 w-4" />
                              Ausblenden
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setReviewApproval(review, true)}
                              disabled={busyId === review.id}
                              className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-100 transition hover:bg-emerald-500/20 disabled:opacity-60"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Freigeben
                            </button>
                          )}

                          <button
                            type="button"
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
              <div className="mt-8">
                <p className="text-sm uppercase tracking-[0.28em] text-neutral-400">
                  Einstellungen
                </p>
                <h2 className="mt-3 text-3xl font-black">
                  Admin-Status und wichtige Hinweise
                </h2>

                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/15">
                      <ShieldCheck className="h-5 w-5 text-emerald-100" />
                    </div>
                    <h3 className="mt-5 text-xl font-black">Admin-Schutz</h3>
                    <p className="mt-3 text-sm leading-6 text-emerald-100/80">
                      Der Admin-Bereich ist mit Passwort und Session-Cookie
                      geschuetzt. Teile dein Admin-Passwort nicht weiter.
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                      <Upload className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-black">Uploads</h3>
                    <p className="mt-3 text-sm leading-6 text-neutral-300">
                      Bilder werden in Supabase Storage gespeichert. Erlaubt
                      sind JPG, PNG und WebP bis 10 MB pro Datei.
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-yellow-400/20 bg-yellow-400/10 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400/15">
                      <MessageSquare className="h-5 w-5 text-yellow-100" />
                    </div>
                    <h3 className="mt-5 text-xl font-black">Bewertungen</h3>
                    <p className="mt-3 text-sm leading-6 text-yellow-100/80">
                      Neue Bewertungen werden gespeichert, sind aber erst nach
                      deiner Freigabe fuer Besucher sichtbar.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6">
                  <h3 className="text-xl font-black">Naechste sinnvolle Admin-Funktionen</h3>
                  <div className="mt-4 grid gap-3 text-sm text-neutral-300 md:grid-cols-2">
                    <p className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      Startseitenbilder und Portfolio-Titelbilder sind jetzt
                      direkt im Admin pflegbar.
                    </p>
                    <p className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      Kontaktinfos ohne Code-Aenderung bearbeiten.
                    </p>
                    <p className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      Spaeter Kundenkonten und Download-Galerien anbinden.
                    </p>
                  </div>
                </div>
              </div>
            )}
            </div>
          </section>
        )}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5 backdrop-blur-lg">
          <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/15 bg-neutral-950 text-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">
                  Bildvorschau
                </p>
                <p className="mt-1 font-bold">
                  {CATEGORIES.find(
                    (category) => category.value === selectedImage.category
                  )?.label || selectedImage.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
                aria-label="Bildvorschau schliessen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <img
              src={selectedImage.url}
              alt=""
              className="max-h-[72vh] w-full object-contain bg-black"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 p-4">
              <p className="text-sm text-neutral-400">
                {formatDate(selectedImage.created_at)}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    copyText(selectedImage.url, "Bild-URL wurde kopiert.")
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/15"
                >
                  <Copy className="h-4 w-4" />
                  URL kopieren
                </button>
                <a
                  href={selectedImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/15"
                >
                  <ExternalLink className="h-4 w-4" />
                  Original oeffnen
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
