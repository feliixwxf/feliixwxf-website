"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Eye,
  EyeOff,
  Heart,
  Image as ImageIcon,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  RefreshCw,
  Upload,
  UserRound,
  UserPlus,
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

function getGalleryStatus(gallery) {
  if (gallery?.status === "completed") {
    return {
      label: "Abgeschlossen",
      className: "bg-sky-300 text-neutral-950",
    };
  }

  return {
    label: "Aktiv",
    className: "bg-emerald-400 text-neutral-950",
  };
}

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 32);
}

export default function AccountPage() {
  const [mode, setMode] = useState("login");
  const [user, setUser] = useState(null);
  const [galleries, setGalleries] = useState([]);
  const [galleryCode, setGalleryCode] = useState("");
  const [galleryFilter, setGalleryFilter] = useState("all");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [profileName, setProfileName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [linkingGallery, setLinkingGallery] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

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

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
  };

  const linkSavedGalleryCode = async () => {
    const savedCode = localStorage.getItem("feliix-client-gallery-code");

    if (!savedCode) return false;

    const response = await fetch("/api/account/galleries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessCode: savedCode }),
    });
    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      localStorage.removeItem("feliix-client-gallery-code");

      if (data.linked) {
        showMessage(
          "Galerie wurde automatisch deinem Konto hinzugefügt.",
          "success"
        );
        return true;
      }

      return false;
    }

    if (!response.ok && response.status === 409) {
      showMessage(data.error || "Galerie ist bereits anders verknüpft.", "error");
    }

    return false;
  };

  const loadGalleries = async () => {
    const response = await fetch("/api/account/galleries", {
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setGalleries([]);
      showMessage(data.error || "Galerien konnten nicht geladen werden.", "error");
      return;
    }

    setGalleries(data.galleries || []);
  };

  const loadSession = async () => {
    setLoading(true);
    const response = await fetch("/api/account/session", {
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));

    if (data.authenticated) {
      setUser(data.user);
      setProfileName(data.user?.name || "");
      setAvatarPreview(data.user?.avatar_url || "");
      await linkSavedGalleryCode();
      await loadGalleries();
    } else {
      setUser(null);
      setProfileName("");
      setAvatarPreview("");
      setGalleries([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const confirmed = params.get("verified") === "1";
    const error =
      params.get("error_description") || hashParams.get("error_description");

    if (confirmed) {
      showMessage("E-Mail wurde bestätigt. Du kannst dich jetzt einloggen.", "success");
      window.history.replaceState(null, "", "/konto");
    } else if (error) {
      showMessage(decodeURIComponent(error).replace(/\+/g, " "), "error");
      window.history.replaceState(null, "", "/konto");
    }

    loadSession();
  }, []);

  const submitAccount = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const response = await fetch(
      mode === "register" ? "/api/account/register" : "/api/account/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      showMessage(data.error || "Aktion konnte nicht ausgeführt werden.", "error");
      setSubmitting(false);
      return;
    }

    if (data.needsEmailConfirmation) {
      showMessage(data.message, "success");
      setMode("login");
      setSubmitting(false);
      return;
    }

    setUser(data.user);
    setProfileName(data.user?.name || form.name || "");
    setAvatarPreview(data.user?.avatar_url || "");
    const linkedGallery = await linkSavedGalleryCode();
    if (!linkedGallery) {
      showMessage(
        mode === "register" ? "Konto wurde erstellt." : "Du bist eingeloggt.",
        "success"
      );
    }
    await loadGalleries();
    setSubmitting(false);
  };

  const logout = async () => {
    await fetch("/api/account/logout", { method: "POST" });
    setUser(null);
    setProfileName("");
    setAvatarPreview("");
    setGalleries([]);
    showMessage("Du wurdest ausgeloggt.", "success");
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    setMessage("");

    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profileName }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      showMessage(data.error || "Benutzername konnte nicht gespeichert werden.", "error");
      setProfileSaving(false);
      return;
    }

    setUser(data.user);
    setProfileName(data.user?.name || "");
    setAvatarPreview(data.user?.avatar_url || "");
    showMessage("Benutzername wurde gespeichert.", "success");
    setProfileSaving(false);
  };

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setAvatarUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/account/avatar", {
      method: "POST",
      body: formData,
    });
    const data = await response.json().catch(() => ({}));

    URL.revokeObjectURL(previewUrl);

    if (!response.ok) {
      setAvatarPreview(user?.avatar_url || "");
      showMessage(data.error || "Profilbild konnte nicht gespeichert werden.", "error");
      setAvatarUploading(false);
      return;
    }

    setUser(data.user);
    setAvatarPreview(data.user?.avatar_url || "");
    showMessage("Profilbild wurde gespeichert.", "success");
    setAvatarUploading(false);
  };

  const linkGalleryByCode = async (event) => {
    event.preventDefault();

    const code = normalizeCode(galleryCode);

    if (!code) {
      showMessage("Bitte einen Galerie-Code eingeben.", "error");
      return;
    }

    setLinkingGallery(true);
    setMessage("");

    const response = await fetch("/api/account/galleries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessCode: code }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      showMessage(data.error || "Galerie konnte nicht verknüpft werden.", "error");
      setLinkingGallery(false);
      return;
    }

    setGalleryCode("");
    await loadGalleries();
    showMessage(
      data.alreadyLinked
        ? "Diese Galerie ist bereits mit deinem Konto verknüpft."
        : "Galerie wurde deinem Konto hinzugefügt.",
      "success"
    );
    setLinkingGallery(false);
  };

  const openGallery = (gallery) => {
    localStorage.setItem("feliix-client-gallery-code", gallery.access_code);
    window.location.href = `/kunden?code=${encodeURIComponent(
      gallery.access_code
    )}`;
  };

  const activeGalleries = galleries.filter(
    (gallery) => gallery.status !== "completed"
  );
  const completedGalleries = galleries.filter(
    (gallery) => gallery.status === "completed"
  );
  const downloadableGalleries = galleries.filter(
    (gallery) => gallery.downloads_enabled
  );
  const visibleActiveGalleries = activeGalleries.filter((gallery) => {
    if (galleryFilter === "completed") return false;
    if (galleryFilter === "downloads") return gallery.downloads_enabled;
    return true;
  });
  const visibleCompletedGalleries = completedGalleries.filter((gallery) => {
    if (galleryFilter === "active") return false;
    if (galleryFilter === "downloads") return gallery.downloads_enabled;
    return true;
  });
  const visibleGalleryCount =
    visibleActiveGalleries.length + visibleCompletedGalleries.length;
  const galleryFilters = [
    { key: "all", label: "Alle", count: galleries.length },
    { key: "active", label: "Aktiv", count: activeGalleries.length },
    {
      key: "completed",
      label: "Abgeschlossen",
      count: completedGalleries.length,
    },
    { key: "downloads", label: "Downloads", count: downloadableGalleries.length },
  ];
  const accountHeroGallery =
    activeGalleries.find((gallery) => gallery.cover_url) ||
    completedGalleries.find((gallery) => gallery.cover_url);
  const accountDisplayName =
    String(user?.name || "").trim() ||
    String(galleries.find((gallery) => gallery.client_name)?.client_name || "").trim() ||
    String(user?.email || "")
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .trim();
  const accountGreeting = accountDisplayName
    ? `Hallo, ${accountDisplayName}.`
    : "Dein Konto.";
  const accountIntro = user
    ? "Hier findest du deine persönlichen Shooting-Galerien, Favoriten und freigegebenen Downloads gesammelt an einem Ort."
    : "Melde dich an, um deine freigegebenen Galerien gesammelt an einem Ort zu sehen.";
  const totalFavoriteCount = galleries.reduce(
    (sum, gallery) => sum + (gallery.favorite_count || 0),
    0
  );
  const totalImageCount = galleries.reduce(
    (sum, gallery) => sum + (gallery.image_count || 0),
    0
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_32%),linear-gradient(135deg,#070707,#151518,#262629)] px-5 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Zur Website
          </Link>

          {user && (
            <button
              type="button"
              onClick={logout}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
            >
              <LogOut className="h-4 w-4" />
              Ausloggen
            </button>
          )}
        </div>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] shadow-2xl backdrop-blur-xl">
          <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20 p-6 md:p-8">
              {accountHeroGallery?.cover_url && (
                <img
                  src={accountHeroGallery.cover_url}
                  alt=""
                  className="absolute inset-0 h-full w-full scale-105 object-cover opacity-20 blur-sm"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-black via-black/75 to-black/35" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                  <Lock className="h-6 w-6" />
                </div>
                <p className="mt-8 text-sm uppercase tracking-[0.3em] text-neutral-400">
                  Kundenkonto
                </p>
                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="mt-4 text-4xl font-black md:text-6xl"
                >
                  {accountGreeting}
                  <br />
                  Deine Galerien.
                </motion.h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-300">
                  {accountIntro}
                </p>
                {user && (
                  <div className="mt-6 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-3">
                      <p className="text-2xl font-black">{galleries.length}</p>
                      <p className="mt-1 text-xs text-neutral-400">
                        Galerien für dich
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-3">
                      <p className="text-2xl font-black">
                        {completedGalleries.length}
                      </p>
                      <p className="mt-1 text-xs text-neutral-400">
                        abgeschlossen
                      </p>
                    </div>
                    <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-yellow-100">
                      <p className="text-2xl font-black">{totalFavoriteCount}</p>
                      <p className="mt-1 text-xs">Favoriten markiert</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-6">
              {loading ? (
                <div className="flex min-h-64 items-center justify-center">
                  <RefreshCw className="h-7 w-7 animate-spin text-neutral-300" />
                </div>
              ) : user ? (
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">
                    Angemeldet als
                  </p>
                  <h2 className="mt-2 break-all text-2xl font-black">
                    {user.name || "Ohne Benutzername"}
                  </h2>
                  <p className="mt-1 break-all text-sm text-neutral-400">
                    {user.email}
                  </p>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserRound className="h-8 w-8 text-neutral-400" />
                        )}
                      </div>
                      <label className="inline-flex w-fit cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-black transition hover:bg-white/15">
                        {avatarUploading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Profilbild ändern
                        <input
                          type="file"
                          accept="image/*"
                          onChange={uploadAvatar}
                          disabled={avatarUploading}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                        Benutzername
                      </span>
                      <input
                        value={profileName}
                        onChange={(event) => {
                          setProfileName(event.target.value);
                          setMessage("");
                        }}
                        placeholder="z. B. Felix"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-yellow-400"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={saveProfile}
                      disabled={profileSaving}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 disabled:opacity-60"
                    >
                      {profileSaving && (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      )}
                      Benutzername speichern
                    </button>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black">Meine Galerien</h3>
                      <p className="mt-1 text-sm text-neutral-400">
                        {galleries.length} Galerie
                        {galleries.length === 1 ? "" : "n"} gefunden
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={loadGalleries}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 transition hover:bg-white/15"
                      aria-label="Galerien neu laden"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>

                  {galleries.length > 0 && (
                    <div className="mt-4 grid gap-2 sm:grid-cols-4">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                        <p className="text-2xl font-black">
                          {totalImageCount}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">Bilder</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                        <p className="text-2xl font-black">
                          {completedGalleries.length}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          Abgeschlossen
                        </p>
                      </div>
                      <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-yellow-100">
                        <p className="text-2xl font-black">
                          {totalFavoriteCount}
                        </p>
                        <p className="mt-1 text-xs">Favoriten</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                        <p className="text-2xl font-black">
                          {downloadableGalleries.length}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          Downloads
                        </p>
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={linkGalleryByCode}
                    className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                      <label className="min-w-0 flex-1">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                          Galerie-Code hinzufügen
                        </span>
                        <input
                          value={galleryCode}
                          onChange={(event) => {
                            setGalleryCode(normalizeCode(event.target.value));
                            setMessage("");
                          }}
                          placeholder="z. B. GAL-ABC123"
                          className="mt-2 w-full rounded-xl border border-white/10 bg-white px-3 py-3 text-sm font-black tracking-[0.12em] text-neutral-950 outline-none focus:border-yellow-400"
                        />
                      </label>

                      <button
                        type="submit"
                        disabled={linkingGallery}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 disabled:opacity-60"
                      >
                        {linkingGallery ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <KeyRound className="h-4 w-4" />
                        )}
                        Verknüpfen
                      </button>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-neutral-400">
                      Wenn du einen QR-Code oder Galerie-Code bekommen hast,
                      kannst du ihn hier direkt deinem Konto hinzufügen.
                    </p>
                  </form>

                  <div className="mt-5 grid gap-3">
                    {galleries.length === 0 && (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-sm leading-6 text-neutral-300">
                        Noch keine Galerie gefunden. Wichtig: Die Galerie muss
                        im Admin mit genau deiner Konto-E-Mail verknüpft sein.
                        Alternativ kannst du oben einen Galerie-Code direkt
                        hinzufügen.
                        <Link
                          href="/kunden"
                          className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5"
                        >
                          <KeyRound className="h-4 w-4" />
                          Galerie-Code eingeben
                        </Link>
                      </div>
                    )}

                    {galleries.length > 0 && (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {galleryFilters.map((filter) => (
                            <button
                              key={filter.key}
                              type="button"
                              onClick={() => setGalleryFilter(filter.key)}
                              className={`rounded-xl px-3 py-2 text-sm font-black transition ${
                                galleryFilter === filter.key
                                  ? "bg-white text-neutral-950"
                                  : "bg-white/5 text-neutral-300 hover:bg-white/10"
                              }`}
                            >
                              {filter.label}
                              <span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-xs">
                                {filter.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {galleries.length > 0 && visibleGalleryCount === 0 && (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-sm leading-6 text-neutral-300">
                        Für diesen Filter gibt es aktuell keine Galerien.
                      </div>
                    )}

                    {[
                      {
                        title: "Aktive Galerien",
                        description: "Hier liegen die Galerien, an denen du gerade arbeitest.",
                        items: visibleActiveGalleries,
                      },
                      {
                        title: "Abgeschlossen",
                        description: "Fertige Projekte bleiben hier gesammelt sichtbar.",
                        items: visibleCompletedGalleries,
                      },
                    ].map((section) => {
                      if (section.items.length === 0) return null;

                      return (
                        <section key={section.title} className="grid gap-3">
                          <div className="flex items-end justify-between gap-3 px-1">
                            <div>
                              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-300">
                                {section.title}
                              </h4>
                              <p className="mt-1 text-xs text-neutral-500">
                                {section.description}
                              </p>
                            </div>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-neutral-300">
                              {section.items.length}
                            </span>
                          </div>

                          {section.items.map((gallery) => {
                            const status = getGalleryStatus(gallery);

                            return (
                              <article
                                key={gallery.id}
                                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]"
                              >
                                <div className="grid gap-0 sm:grid-cols-[150px_minmax(0,1fr)]">
                                  <button
                                    type="button"
                                    onClick={() => openGallery(gallery)}
                                    className="relative aspect-[4/3] overflow-hidden bg-black/30 sm:aspect-auto"
                                    aria-label="Galerie öffnen"
                                  >
                                    {gallery.cover_url ? (
                                      <img
                                        src={gallery.cover_url}
                                        alt=""
                                        loading="lazy"
                                        decoding="async"
                                        className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                                      />
                                    ) : (
                                      <div className="flex h-full min-h-32 items-center justify-center">
                                        <ImageIcon className="h-8 w-8 text-neutral-500" />
                                      </div>
                                    )}
                                    <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-black text-white backdrop-blur">
                                      Code {gallery.access_code}
                                    </span>
                                  </button>

                                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span
                                          className={`rounded-full px-3 py-1 text-xs font-black ${status.className}`}
                                        >
                                          {status.label}
                                        </span>
                                        {gallery.downloads_enabled && (
                                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-100">
                                            <Download className="h-3.5 w-3.5" />
                                            Downloads
                                          </span>
                                        )}
                                        {gallery.status === "completed" &&
                                          !gallery.downloads_enabled && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-black text-neutral-300">
                                              Downloads gesperrt
                                            </span>
                                          )}
                                      </div>
                                      <h4 className="mt-3 text-lg font-black">
                                        {gallery.title}
                                      </h4>
                                      <p className="mt-1 text-sm text-neutral-400">
                                        {gallery.client_name || "Kundengalerie"}
                                      </p>
                                      {gallery.welcome_message && (
                                        <div className="mt-3 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-sm leading-6 text-yellow-50">
                                          <p className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-yellow-100/70">
                                            Persönliche Nachricht
                                          </p>
                                          <p className="mt-1 line-clamp-3">
                                            {gallery.welcome_message}
                                          </p>
                                        </div>
                                      )}
                                      {gallery.expires_at && (
                                        <p className="mt-2 text-xs text-neutral-500">
                                          bis {formatDate(gallery.expires_at)}
                                        </p>
                                      )}
                                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-neutral-300">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-3 py-1">
                                          <ImageIcon className="h-3.5 w-3.5" />
                                          {gallery.image_count || 0} Bilder
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400/10 px-3 py-1 text-yellow-100">
                                          <Heart className="h-3.5 w-3.5" />
                                          {gallery.favorite_count || 0} Favoriten
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => openGallery(gallery)}
                                      className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl"
                                    >
                                      <ImageIcon className="h-4 w-4" />
                                      Öffnen
                                    </button>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </section>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <form onSubmit={submitAccount}>
                  <div className="grid grid-cols-2 rounded-full border border-white/10 bg-white/10 p-1">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className={`rounded-full px-4 py-2 text-sm font-black transition ${
                        mode === "login"
                          ? "bg-white text-neutral-950"
                          : "text-neutral-300"
                      }`}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className={`rounded-full px-4 py-2 text-sm font-black transition ${
                        mode === "register"
                          ? "bg-white text-neutral-950"
                          : "text-neutral-300"
                      }`}
                    >
                      Konto erstellen
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4">
                    {mode === "register" && (
                      <label className="block">
                        <span className="text-sm font-bold text-neutral-200">
                          Benutzername
                        </span>
                        <input
                          value={form.name}
                          onChange={(event) =>
                            updateForm("name", event.target.value)
                          }
                          placeholder="z. B. Felix"
                          className="mt-2 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-yellow-400"
                        />
                      </label>
                    )}

                    <label className="block">
                      <span className="text-sm font-bold text-neutral-200">
                        E-Mail
                      </span>
                      <div className="relative mt-2">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(event) =>
                            updateForm("email", event.target.value)
                          }
                          placeholder="kunde@example.com"
                          className="w-full rounded-2xl border border-white/10 bg-white py-3 pl-12 pr-4 text-neutral-950 outline-none focus:border-yellow-400"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="text-sm font-bold text-neutral-200">
                        Passwort
                      </span>
                      <div className="relative mt-2">
                        <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={(event) =>
                            updateForm("password", event.target.value)
                          }
                          placeholder="Mindestens 8 Zeichen"
                          className="w-full rounded-2xl border border-white/10 bg-white py-3 pl-12 pr-14 text-neutral-950 outline-none focus:border-yellow-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-neutral-600 transition hover:bg-neutral-100"
                          aria-label={
                            showPassword
                              ? "Passwort ausblenden"
                              : "Passwort anzeigen"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </label>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-black text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
                    >
                      {submitting ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : mode === "register" ? (
                        <UserPlus className="h-5 w-5" />
                      ) : (
                        <Lock className="h-5 w-5" />
                      )}
                      {submitting
                        ? "Bitte warten..."
                        : mode === "register"
                          ? "Konto erstellen"
                          : "Einloggen"}
                    </button>
                  </div>
                </form>
              )}

              {message && (
                <div
                  className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${messageStyle}`}
                >
                  {message}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
