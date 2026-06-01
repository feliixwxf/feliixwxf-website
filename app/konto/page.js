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
  Trash2,
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
  const [accountSection, setAccountSection] = useState("galleries");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    privacyAccepted: false,
  });
  const [resetEmail, setResetEmail] = useState("");
  const [resetTokens, setResetTokens] = useState({
    accessToken: "",
    refreshToken: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [profileName, setProfileName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [linkingGallery, setLinkingGallery] = useState(false);
  const [deletePanelOpen, setDeletePanelOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
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

  const showPasswordResetRequest = () => {
    setResetEmail(form.email || resetEmail);
    setMode("resetRequest");
    setMessage("");
  };

  const showLoginForm = () => {
    setMode("login");
    setResetTokens({ accessToken: "", refreshToken: "" });
    setNewPassword("");
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
    const resetRequested = params.get("reset") === "1";
    const recoveryType = params.get("type") || hashParams.get("type");
    const accessToken = hashParams.get("access_token") || "";
    const refreshToken = hashParams.get("refresh_token") || "";
    const error =
      params.get("error_description") || hashParams.get("error_description");

    if (recoveryType === "recovery" && accessToken) {
      setResetTokens({ accessToken, refreshToken });
      setMode("resetConfirm");
      showMessage("Bitte vergib jetzt dein neues Passwort.", "success");
      window.history.replaceState(null, "", "/konto?reset=1");
    } else if (confirmed) {
      showMessage("E-Mail wurde bestätigt. Du kannst dich jetzt einloggen.", "success");
      window.history.replaceState(null, "", "/konto");
    } else if (resetRequested) {
      setMode("resetRequest");
      showMessage("Gib deine E-Mail ein, um eine Reset-Mail zu erhalten.", "info");
    } else if (error) {
      showMessage(decodeURIComponent(error).replace(/\+/g, " "), "error");
      window.history.replaceState(null, "", "/konto");
    }

    loadSession();
  }, []);

  const submitAccount = async (event) => {
    event.preventDefault();

    if (mode === "register" && !form.name.trim()) {
      showMessage("Bitte gib einen Benutzernamen ein.", "error");
      return;
    }

    if (mode === "register" && !form.privacyAccepted) {
      showMessage(
        "Bitte bestätige die Datenschutzhinweise, um ein Konto zu erstellen.",
        "error"
      );
      return;
    }

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

  const requestPasswordReset = async (event) => {
    event.preventDefault();

    const email = String(resetEmail || form.email || "").trim().toLowerCase();

    if (!email) {
      showMessage("Bitte gib deine E-Mail-Adresse ein.", "error");
      return;
    }

    setSubmitting(true);
    setMessage("");

    const response = await fetch("/api/account/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      showMessage(data.error || "Reset-Mail konnte nicht gesendet werden.", "error");
      setSubmitting(false);
      return;
    }

    setResetEmail(email);
    setForm((current) => ({ ...current, email }));
    showMessage(
      data.message ||
        "Wenn ein Konto mit dieser E-Mail existiert, wurde eine Reset-Mail gesendet.",
      "success"
    );
    setSubmitting(false);
  };

  const requestCurrentAccountPasswordReset = async () => {
    const email = String(user?.email || "").trim().toLowerCase();

    if (!email) {
      showMessage("Für dein Konto ist keine E-Mail-Adresse verfügbar.", "error");
      return;
    }

    setSubmitting(true);
    setMessage("");

    const response = await fetch("/api/account/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      showMessage(data.error || "Reset-Mail konnte nicht gesendet werden.", "error");
      setSubmitting(false);
      return;
    }

    showMessage(
      data.message ||
        "Wenn ein Konto mit dieser E-Mail existiert, wurde eine Reset-Mail gesendet.",
      "success"
    );
    setSubmitting(false);
  };

  const confirmPasswordReset = async (event) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      showMessage("Das neue Passwort muss mindestens 8 Zeichen haben.", "error");
      return;
    }

    setSubmitting(true);
    setMessage("");

    const response = await fetch("/api/account/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: newPassword,
        accessToken: resetTokens.accessToken,
        refreshToken: resetTokens.refreshToken,
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      showMessage(data.error || "Passwort konnte nicht geändert werden.", "error");
      setSubmitting(false);
      return;
    }

    setUser(data.user);
    setProfileName(data.user?.name || "");
    setAvatarPreview(data.user?.avatar_url || "");
    setNewPassword("");
    setResetTokens({ accessToken: "", refreshToken: "" });
    setMode("login");
    window.history.replaceState(null, "", "/konto");
    await loadGalleries();
    showMessage(data.message || "Passwort wurde geändert.", "success");
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

  const deleteAccount = async () => {
    if (deleteConfirmText !== "LÖSCHEN") {
      showMessage("Bitte gib LÖSCHEN ein, um dein Konto zu löschen.", "error");
      return;
    }

    setDeletingAccount(true);
    setMessage("");

    const response = await fetch("/api/account/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: deleteConfirmText }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      showMessage(data.error || "Konto konnte nicht gelöscht werden.", "error");
      setDeletingAccount(false);
      return;
    }

    setUser(null);
    setGalleries([]);
    setProfileName("");
    setAvatarPreview("");
    setGalleryCode("");
    setDeleteConfirmText("");
    setDeletePanelOpen(false);
    setMode("login");
    showMessage("Dein Konto und die verknüpften Kontodaten wurden gelöscht.", "success");
    setDeletingAccount(false);
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
  const accountSections = [
    {
      key: "galleries",
      label: "Bilder & Galerien",
      helper: "Galerien, Favoriten und Downloads",
      icon: ImageIcon,
    },
    {
      key: "profile",
      label: "Konto bearbeiten",
      helper: "Profilbild, Benutzername und Löschen",
      icon: UserRound,
    },
  ];
  const accountHeroGallery =
    activeGalleries.find((gallery) => gallery.cover_url) ||
    completedGalleries.find((gallery) => gallery.cover_url);
  const nextGallery = activeGalleries[0] || completedGalleries[0];
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
    <main className="min-h-screen bg-[linear-gradient(135deg,#070707,#161616,#222)] px-3 py-3 text-white sm:px-5 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Zur Website
          </Link>

        </div>

        <section className="mt-3 overflow-hidden rounded-[1.15rem] border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl sm:mt-8 sm:rounded-[2rem]">
          <div className="grid gap-3 p-2 sm:gap-4 sm:p-4 md:p-5 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className={`relative overflow-hidden rounded-[1rem] border border-white/10 bg-black/30 p-3 sm:rounded-[1.5rem] sm:p-5 lg:sticky lg:top-6 lg:self-start ${user ? "hidden sm:block" : ""}`}>
              {accountHeroGallery?.cover_url && (
                <img
                  src={accountHeroGallery.cover_url}
                  alt=""
                  className="absolute inset-0 h-full w-full scale-105 object-cover opacity-10 blur-sm"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-black via-black/85 to-black/65" />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:h-12 sm:w-12 sm:rounded-2xl">
                    {user && avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
                      Kundenkonto
                    </p>
                    {user && (
                      <p className="mt-1 truncate text-sm text-neutral-300">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="mt-4 text-2xl font-black leading-tight sm:mt-6 sm:text-3xl"
                >
                  {accountGreeting}
                </motion.h1>
                <p className="mt-2 text-sm leading-6 text-neutral-400 sm:mt-3">
                  {accountIntro}
                </p>

                {user && nextGallery && (
                  <button
                    type="button"
                    onClick={() => openGallery(nextGallery)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl sm:mt-5"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Letzte Galerie öffnen
                  </button>
                )}
                {user && (
                  <>
                    <div className="mt-4 grid grid-cols-3 gap-1.5 sm:mt-5 sm:gap-2">
                      <div className="rounded-xl border border-white/10 bg-white/[0.07] p-2.5 sm:p-3">
                        <p className="text-lg font-black sm:text-xl">{galleries.length}</p>
                        <p className="mt-1 text-xs text-neutral-500">Galerien</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.07] p-2.5 sm:p-3">
                        <p className="text-lg font-black sm:text-xl">
                          {completedGalleries.length}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">fertig</p>
                      </div>
                      <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-2.5 text-yellow-100 sm:p-3">
                        <p className="text-lg font-black sm:text-xl">{totalFavoriteCount}</p>
                        <p className="mt-1 text-xs">Favoriten</p>
                      </div>
                    </div>

                    <div className="mt-5 hidden gap-2 sm:grid">
                      {accountSections.map((section) => {
                        const SectionIcon = section.icon;
                        const active = accountSection === section.key;

                        return (
                          <button
                            key={section.key}
                            type="button"
                            onClick={() => setAccountSection(section.key)}
                            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                              active
                                ? "bg-white text-neutral-950 shadow-xl"
                                : "bg-white/[0.06] text-neutral-300 hover:bg-white/10"
                            }`}
                          >
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                active
                                  ? "bg-neutral-950 text-white"
                                  : "bg-white/10"
                              }`}
                            >
                              <SectionIcon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-black">
                                {section.label}
                              </span>
                              <span
                                className={`mt-0.5 block truncate text-xs ${
                                  active ? "text-neutral-600" : "text-neutral-500"
                                }`}
                              >
                                {section.helper}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-[1rem] border-0 border-white/10 bg-transparent p-0 sm:border sm:bg-neutral-950/65 sm:p-4 md:p-5">
              {loading ? (
                <div className="flex min-h-64 items-center justify-center">
                  <RefreshCw className="h-7 w-7 animate-spin text-neutral-300" />
                </div>
              ) : user ? (
                <div>
                  <div className="mb-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-3 sm:hidden">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserRound className="h-6 w-6 text-neutral-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                          Kundenkonto
                        </p>
                        <h1 className="mt-1 text-xl font-black leading-tight">
                          {accountGreeting}
                        </h1>
                        <p className="mt-1 truncate text-xs text-neutral-400">
                          {user.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={logout}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-neutral-200"
                        aria-label="Ausloggen"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-1.5">
                      <div className="rounded-xl bg-black/25 p-2.5">
                        <p className="text-lg font-black">{galleries.length}</p>
                        <p className="mt-0.5 text-[0.68rem] text-neutral-500">
                          Galerien
                        </p>
                      </div>
                      <div className="rounded-xl bg-black/25 p-2.5">
                        <p className="text-lg font-black">
                          {completedGalleries.length}
                        </p>
                        <p className="mt-0.5 text-[0.68rem] text-neutral-500">
                          fertig
                        </p>
                      </div>
                      <div className="rounded-xl bg-yellow-400/10 p-2.5 text-yellow-100">
                        <p className="text-lg font-black">{totalFavoriteCount}</p>
                        <p className="mt-0.5 text-[0.68rem]">Favoriten</p>
                      </div>
                    </div>

                    {nextGallery && (
                      <button
                        type="button"
                        onClick={() => openGallery(nextGallery)}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-neutral-950"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Galerie öffnen
                      </button>
                    )}
                  </div>

                  <div className="hidden rounded-2xl border border-white/10 bg-white/[0.06] p-3 sm:block sm:p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
                          {accountSection === "galleries"
                            ? "Bilder & Galerien"
                            : "Konto bearbeiten"}
                        </p>
                        <h2 className="mt-1.5 text-xl font-black sm:mt-2 sm:text-2xl">
                          {accountSection === "galleries"
                            ? "Deine Shooting-Galerien"
                            : "Profil und Sicherheit"}
                        </h2>
                        <p className="mt-2 hidden max-w-2xl text-sm leading-6 text-neutral-400 sm:block">
                          {accountSection === "galleries"
                            ? "Öffne Galerien, prüfe Favoriten oder füge einen neuen Galerie-Code hinzu."
                            : "Ändere deinen Benutzernamen, dein Profilbild oder setze dein Passwort zurück."}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-fit rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-neutral-950">
                          Konto aktiv
                        </span>
                        <button
                          type="button"
                          onClick={logout}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black text-neutral-200 transition hover:bg-white/15"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Ausloggen
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="sticky top-2 z-20 rounded-2xl border border-white/10 bg-neutral-950/90 p-1.5 backdrop-blur-xl sm:hidden">
                    <div className="grid grid-cols-2 gap-2">
                      {accountSections.map((section) => {
                        const SectionIcon = section.icon;
                        const active = accountSection === section.key;

                        return (
                          <button
                            key={section.key}
                            type="button"
                            onClick={() => setAccountSection(section.key)}
                            className={`flex items-center justify-center gap-2 rounded-xl px-2.5 py-3 text-center transition ${
                              active
                                ? "bg-white text-neutral-950 shadow-xl"
                                : "bg-white/[0.06] text-neutral-300"
                            }`}
                          >
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                  active ? "bg-neutral-950 text-white" : "bg-white/10"
                              }`}
                            >
                              <SectionIcon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-black">
                                {section.label}
                              </span>
                              <span
                                className={`mt-0.5 block truncate text-xs ${
                                  active ? "text-neutral-600" : "text-neutral-500"
                                } hidden`}
                              >
                                {section.helper}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {accountSection === "profile" && (
                    <div className="mt-5 grid gap-4">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
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
                          <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-black transition hover:bg-white/15 sm:w-fit">
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

                      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="font-black text-white">
                              Passwort zurücksetzen
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-neutral-400">
                              Wir senden dir eine E-Mail, mit der du ein neues
                              Passwort festlegen kannst.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={requestCurrentAccountPasswordReset}
                            disabled={submitting}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white px-4 py-3 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 disabled:opacity-60 sm:w-fit"
                          >
                            {submitting ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Mail className="h-4 w-4" />
                            )}
                            Reset-Mail senden
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {accountSection === "galleries" && (
                    <div className="mt-4 sm:mt-5">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black sm:text-xl">Meine Galerien</h3>
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
                  </div>

                  {galleries.length > 0 && (
                    <div className="mt-3 hidden grid-cols-2 gap-2 sm:mt-4 sm:grid sm:grid-cols-4">
                      <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3 sm:rounded-2xl">
                        <p className="text-xl font-black sm:text-2xl">
                          {totalImageCount}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">Bilder</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3 sm:rounded-2xl">
                        <p className="text-xl font-black sm:text-2xl">
                          {completedGalleries.length}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          Abgeschlossen
                        </p>
                      </div>
                      <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-yellow-100 sm:rounded-2xl">
                        <p className="text-xl font-black sm:text-2xl">
                          {totalFavoriteCount}
                        </p>
                        <p className="mt-1 text-xs">Favoriten</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3 sm:rounded-2xl">
                        <p className="text-xl font-black sm:text-2xl">
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
                    className="mt-3 rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.08] p-3 sm:mt-5 sm:p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                      <label className="min-w-0 flex-1">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-100/75">
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
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 disabled:opacity-60 lg:w-fit"
                      >
                        {linkingGallery ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <KeyRound className="h-4 w-4" />
                        )}
                        Verknüpfen
                      </button>
                    </div>
                    <p className="mt-3 hidden text-xs leading-5 text-yellow-50/70 sm:block">
                      Wenn du einen QR-Code oder Galerie-Code bekommen hast,
                      kannst du ihn hier direkt deinem Konto hinzufügen.
                    </p>
                  </form>

                  <div className="mt-4 grid gap-3 sm:mt-5">
                    {galleries.length === 0 && (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 sm:p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
                              Noch keine Galerie
                            </p>
                            <h4 className="mt-2 text-xl font-black">
                              Verbinde dein erstes Shooting
                            </h4>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-300">
                              Sobald eine Galerie mit deiner E-Mail verbunden
                              ist oder du einen Code eingibst, erscheint sie
                              hier automatisch.
                            </p>
                          </div>
                          <Link
                            href="/kunden"
                            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 sm:w-fit"
                          >
                            <KeyRound className="h-4 w-4" />
                            Code-Seite öffnen
                          </Link>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                          {[
                            {
                              title: "Code bekommen",
                              text: "QR-Code scannen oder Galerie-Code kopieren.",
                            },
                            {
                              title: "Hier eintragen",
                              text: "Code oben einfügen und mit deinem Konto verknüpfen.",
                            },
                            {
                              title: "Galerie öffnen",
                              text: "Danach findest du Bilder, Favoriten und Downloads hier.",
                            },
                          ].map((item, index) => (
                            <div
                              key={item.title}
                              className="rounded-2xl border border-white/10 bg-black/20 p-4"
                            >
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-black text-neutral-950">
                                {index + 1}
                              </span>
                              <p className="mt-3 font-black text-white">
                                {item.title}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-neutral-400">
                                {item.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {galleries.length > 0 && (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-2 sm:p-3">
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:grid-cols-4">
                          {galleryFilters.map((filter) => (
                            <button
                              key={filter.key}
                              type="button"
                              onClick={() => setGalleryFilter(filter.key)}
                              className={`rounded-xl px-2 py-2 text-xs font-black transition sm:px-3 sm:text-sm ${
                                galleryFilter === filter.key
                                  ? "bg-white text-neutral-950"
                                  : "bg-white/5 text-neutral-300 hover:bg-white/10"
                              }`}
                            >
                              {filter.label}
                              <span className="ml-1 rounded-full bg-black/10 px-1.5 py-0.5 text-[0.65rem] sm:ml-2 sm:px-2 sm:text-xs">
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
                                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.09]"
                              >
                                <div className="grid gap-0 sm:grid-cols-[180px_minmax(0,1fr)]">
                                  <button
                                    type="button"
                                    onClick={() => openGallery(gallery)}
                                    className="relative aspect-[16/10] overflow-hidden bg-black/30 sm:aspect-auto"
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

                                  <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:p-5">
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
                                      <h4 className="mt-3 text-base font-black sm:text-lg">
                                        {gallery.title}
                                      </h4>
                                      <p className="mt-1 text-sm text-neutral-400">
                                        {gallery.client_name || "Kundengalerie"}
                                      </p>
                                      {gallery.welcome_message && (
                                        <div className="mt-3 rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-sm leading-6 text-yellow-50 sm:rounded-2xl">
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
                                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-neutral-300 sm:mt-4">
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
                                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-fit sm:rounded-full sm:py-2"
                                    >
                                      <ImageIcon className="h-4 w-4" />
                                      Galerie öffnen
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
                  )}

                  {accountSection === "profile" && (
                    <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-black text-red-50">
                          Konto löschen
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-red-100/75">
                          Löscht dein Kundenkonto, Profilbild, Favoriten und
                          die Verknüpfung zu Kundengalerien. Bewertungen
                          bleiben ohne Konto-Verknüpfung bestehen. Wenn eine
                          Bewertung gelöscht werden soll, schreibe bitte an
                          felixwolff411@gmail.com.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDeletePanelOpen((current) => !current)
                        }
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-300/30 bg-red-300/10 px-4 py-2 text-sm font-black text-red-50 transition hover:bg-red-300/20 sm:w-fit"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletePanelOpen ? "Schließen" : "Löschen"}
                      </button>
                    </div>

                    {deletePanelOpen && (
                      <div className="mt-4 rounded-xl border border-red-300/20 bg-black/25 p-4">
                        <label className="block">
                          <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-100/70">
                            Zur Bestätigung LÖSCHEN eingeben
                          </span>
                          <input
                            value={deleteConfirmText}
                            onChange={(event) => {
                              setDeleteConfirmText(event.target.value);
                              setMessage("");
                            }}
                            placeholder="LÖSCHEN"
                            className="mt-2 w-full rounded-xl border border-red-300/20 bg-white px-3 py-2 text-sm font-black text-neutral-950 outline-none focus:border-red-400"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={deleteAccount}
                          disabled={
                            deletingAccount || deleteConfirmText !== "LÖSCHEN"
                          }
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-black text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingAccount ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Konto endgültig löschen
                        </button>
                      </div>
                    )}
                  </div>
                  )}
                </div>
              ) : mode === "resetConfirm" ? (
                <form onSubmit={confirmPasswordReset}>
                  <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-100/70">
                      Passwort zurücksetzen
                    </p>
                    <h2 className="mt-3 text-2xl font-black">
                      Neues Passwort vergeben
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-yellow-50/75">
                      Dein Reset-Link wurde erkannt. Gib jetzt dein neues
                      Passwort ein.
                    </p>
                  </div>

                  <div className="mt-6 grid gap-4">
                    <label className="block">
                      <span className="text-sm font-bold text-neutral-200">
                        Neues Passwort
                      </span>
                      <div className="relative mt-2">
                        <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(event) => {
                            setNewPassword(event.target.value);
                            setMessage("");
                          }}
                          placeholder="Mindestens 8 Zeichen"
                          className="w-full rounded-2xl border border-white/10 bg-white py-3 pl-12 pr-14 text-neutral-950 outline-none focus:border-yellow-400"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword((current) => !current)
                          }
                          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-neutral-600 transition hover:bg-neutral-100"
                          aria-label={
                            showNewPassword
                              ? "Passwort ausblenden"
                              : "Passwort anzeigen"
                          }
                        >
                          {showNewPassword ? (
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
                      ) : (
                        <KeyRound className="h-5 w-5" />
                      )}
                      {submitting ? "Bitte warten..." : "Passwort speichern"}
                    </button>

                    <button
                      type="button"
                      onClick={showLoginForm}
                      className="text-sm font-bold text-neutral-300 underline decoration-white/20 underline-offset-4 transition hover:text-white hover:decoration-white"
                    >
                      Zurück zum Login
                    </button>
                  </div>
                </form>
              ) : mode === "resetRequest" ? (
                <form onSubmit={requestPasswordReset}>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-neutral-500">
                      Passwort vergessen
                    </p>
                    <h2 className="mt-3 text-2xl font-black">
                      Reset-Link per E-Mail
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-neutral-300">
                      Gib die E-Mail-Adresse deines Kundenkontos ein. Du bekommst
                      dann einen Link, mit dem du ein neues Passwort festlegen
                      kannst.
                    </p>
                  </div>

                  <div className="mt-6 grid gap-4">
                    <label className="block">
                      <span className="text-sm font-bold text-neutral-200">
                        E-Mail
                      </span>
                      <div className="relative mt-2">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(event) => {
                            setResetEmail(event.target.value);
                            setMessage("");
                          }}
                          placeholder="kunde@example.com"
                          className="w-full rounded-2xl border border-white/10 bg-white py-3 pl-12 pr-4 text-neutral-950 outline-none focus:border-yellow-400"
                        />
                      </div>
                    </label>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-black text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
                    >
                      {submitting ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : (
                        <Mail className="h-5 w-5" />
                      )}
                      {submitting ? "Sende..." : "Reset-Mail senden"}
                    </button>

                    <button
                      type="button"
                      onClick={showLoginForm}
                      className="text-sm font-bold text-neutral-300 underline decoration-white/20 underline-offset-4 transition hover:text-white hover:decoration-white"
                    >
                      Zurück zum Login
                    </button>
                  </div>
                </form>
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
                          required
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

                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={showPasswordResetRequest}
                        className="w-fit text-sm font-bold text-neutral-300 underline decoration-white/20 underline-offset-4 transition hover:text-white hover:decoration-white"
                      >
                        Passwort vergessen?
                      </button>
                    )}

                    {mode === "register" && (
                      <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.08] p-4 text-sm leading-6 text-neutral-300">
                        <input
                          type="checkbox"
                          checked={form.privacyAccepted}
                          onChange={(event) =>
                            updateForm("privacyAccepted", event.target.checked)
                          }
                          className="mt-1 h-4 w-4 rounded border-white/20 accent-yellow-400"
                        />
                        <span>
                          Ich habe die{" "}
                          <Link
                            href="/?datenschutz=1"
                            className="font-bold text-white underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
                          >
                            Datenschutzhinweise
                          </Link>{" "}
                          gelesen und stimme der Verarbeitung meiner Daten für
                          Kundenkonto und Kundengalerien zu.
                        </span>
                      </label>
                    )}

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
