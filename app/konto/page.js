"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  Heart,
  Image as ImageIcon,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Moon,
  Phone,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  UserPlus,
  UserRound,
} from "lucide-react";
import ReportUserErrorButton from "@/components/report-user-error-button";

const LOUNGE_IMAGE = "/images/abititel.jpg";

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

function isPastDate(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date < new Date();
}

function getGalleryStatus(gallery) {
  if (isPastDate(gallery?.expires_at)) {
    return {
      label: "Abgelaufen",
      className: "border-red-300/25 bg-red-400/12 text-red-100",
    };
  }

  if (gallery?.downloads_enabled || gallery?.archive_download_url) {
    return {
      label: "Download verfügbar",
      className: "border-emerald-300/25 bg-emerald-400/12 text-emerald-100",
    };
  }

  if ((gallery?.favorite_count || 0) > 0) {
    return {
      label: "Auswahl offen",
      className: "border-yellow-300/25 bg-yellow-400/12 text-yellow-100",
    };
  }

  if (gallery?.status === "completed") {
    return {
      label: "Abgeschlossen",
      className: "border-sky-300/25 bg-sky-400/12 text-sky-100",
    };
  }

  return {
    label: "Neu",
    className: "border-white/10 bg-white/8 text-neutral-200",
  };
}

function GalleryImage({ src, alt = "", className = "", sizes = "100vw" }) {
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
      sizes={sizes}
      unoptimized={String(src).startsWith("http")}
      className={className}
    />
  );
}

function MessageBox({ message, type, page, source }) {
  if (!message) return null;

  const style =
    type === "success"
      ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-50"
      : type === "error"
        ? "border-red-300/25 bg-red-500/10 text-red-50"
        : "border-yellow-300/25 bg-yellow-400/10 text-yellow-50";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      role="status"
      aria-live="polite"
      className={`rounded-2xl border px-4 py-3 text-sm shadow-lg shadow-black/10 ${style}`}
    >
      <p className="leading-6">{message}</p>
      {type === "error" && (
        <ReportUserErrorButton page={page} source={source} message={message} />
      )}
    </motion.div>
  );
}

function SkeletonGalleryCard() {
  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.05]">
      <div className="h-48 animate-pulse bg-white/[0.07]" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/[0.08]" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/[0.08]" />
        <div className="h-10 animate-pulse rounded-2xl bg-white/[0.08]" />
      </div>
    </div>
  );
}

export default function AccountPage() {
  const accountFormStartedAtRef = useRef(0);
  const prefersReducedMotion = useReducedMotion();
  const [mode, setMode] = useState("login");
  const [user, setUser] = useState(null);
  const [galleries, setGalleries] = useState([]);
  const [galleryCode, setGalleryCode] = useState("");
  const [galleryFilter, setGalleryFilter] = useState("all");
  const [accountSection, setAccountSection] = useState("galleries");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
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
  const [profilePhone, setProfilePhone] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [linkingGallery, setLinkingGallery] = useState(false);
  const [deletePanelOpen, setDeletePanelOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteDataAccepted, setDeleteDataAccepted] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const dark = theme === "dark";

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
  };

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
    accountFormStartedAtRef.current = Date.now();
  };

  const toggleTheme = () => {
    const nextTheme = dark ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("feliix-theme", nextTheme);
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

    if (response.status === 409) {
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
      showMessage("Galerien konnten gerade nicht geladen werden.", "error");
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
      setProfilePhone(data.user?.phone || "");
      setAvatarPreview(data.user?.avatar_url || "");
      await linkSavedGalleryCode();
      await loadGalleries();
    } else {
      setUser(null);
      setProfileName("");
      setProfilePhone("");
      setAvatarPreview("");
      setGalleries([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("feliix-theme");
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const confirmed = params.get("verified") === "1";
    const resetRequested = params.get("reset") === "1";
    const recoveryType = params.get("type") || hashParams.get("type");
    const accessToken = hashParams.get("access_token") || "";
    const refreshToken = hashParams.get("refresh_token") || "";
    const error =
      params.get("error_description") || hashParams.get("error_description");

    queueMicrotask(() => {
      accountFormStartedAtRef.current = Date.now();

      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      }

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
    });
  }, []);

  const submitAccount = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

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
        body: JSON.stringify({
          ...form,
          website: formData.get("website") || "",
          startedAt: accountFormStartedAtRef.current || Date.now(),
        }),
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
      accountFormStartedAtRef.current = Date.now();
      setSubmitting(false);
      return;
    }

    setUser(data.user);
    setProfileName(data.user?.name || form.name || "");
    setProfilePhone(data.user?.phone || form.phone || "");
    setAvatarPreview(data.user?.avatar_url || "");
    const linkedGallery = await linkSavedGalleryCode();
    if (!linkedGallery) {
      showMessage(
        mode === "register" ? "Konto wurde erstellt." : "Du bist eingeloggt.",
        "success"
      );
    }
    await loadGalleries();
    accountFormStartedAtRef.current = Date.now();
    setSubmitting(false);
  };

  const openGalleryCode = (event) => {
    event.preventDefault();
    const code = normalizeCode(galleryCode);

    if (!code) {
      showMessage("Bitte gib deinen Galeriecode ein.", "error");
      return;
    }

    localStorage.setItem("feliix-client-gallery-code", code);
    window.location.assign(`/kunden?code=${encodeURIComponent(code)}`);
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
    setProfilePhone(data.user?.phone || "");
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
    setProfilePhone("");
    setAvatarPreview("");
    setGalleries([]);
    setProfileMenuOpen(false);
    setAccountSection("galleries");
    showMessage("Du wurdest ausgeloggt.", "success");
  };

  const deleteAccount = async () => {
    if (deleteConfirmText !== "LÖSCHEN") {
      showMessage("Bitte gib LÖSCHEN ein, um dein Konto zu löschen.", "error");
      return;
    }

    if (!deleteDataAccepted) {
      showMessage(
        "Bitte bestätige per Haken, dass deine Kontodaten gelöscht werden sollen.",
        "error"
      );
      return;
    }

    setDeletingAccount(true);
    setMessage("");

    const response = await fetch("/api/account/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        confirm: deleteConfirmText,
        deleteDataAccepted,
      }),
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
    setProfilePhone("");
    setAvatarPreview("");
    setGalleryCode("");
    setDeleteConfirmText("");
    setDeleteDataAccepted(false);
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
      body: JSON.stringify({ name: profileName, phone: profilePhone }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      showMessage(data.error || "Benutzername konnte nicht gespeichert werden.", "error");
      setProfileSaving(false);
      return;
    }

    setUser(data.user);
    setProfileName(data.user?.name || "");
    setProfilePhone(data.user?.phone || "");
    setAvatarPreview(data.user?.avatar_url || "");
    showMessage("Profil wurde gespeichert.", "success");
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
      showMessage("Bitte einen Galeriecode eingeben.", "error");
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
    window.location.assign(
      `/kunden?code=${encodeURIComponent(gallery.access_code)}`
    );
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
  const visibleGalleries = galleries.filter((gallery) => {
    if (galleryFilter === "active") return gallery.status !== "completed";
    if (galleryFilter === "completed") return gallery.status === "completed";
    if (galleryFilter === "downloads") return gallery.downloads_enabled;
    return true;
  });
  const galleryFilters = [
    { key: "all", label: "Alle", count: galleries.length },
    { key: "active", label: "Aktiv", count: activeGalleries.length },
    {
      key: "completed",
      label: "Fertig",
      count: completedGalleries.length,
    },
    { key: "downloads", label: "Downloads", count: downloadableGalleries.length },
  ];
  const accountDisplayName =
    String(user?.name || "").trim() ||
    String(galleries.find((gallery) => gallery.client_name)?.client_name || "").trim() ||
    String(user?.email || "")
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .trim();
  const accountGreeting = accountDisplayName
    ? `Hallo, ${accountDisplayName}.`
    : "Hallo.";
  const inputClass =
    "mt-2 h-14 w-full rounded-2xl border border-white/10 bg-[#202020] px-4 text-[0.95rem] text-white outline-none transition placeholder:text-neutral-600 focus:border-yellow-400 focus:bg-[#242424] focus:ring-2 focus:ring-yellow-400/15";
  const iconInputClass =
    "h-14 w-full rounded-2xl border border-white/10 bg-[#202020] py-3 pl-12 pr-14 text-[0.95rem] text-white outline-none transition placeholder:text-neutral-600 focus:border-yellow-400 focus:bg-[#242424] focus:ring-2 focus:ring-yellow-400/15";
  const primaryButtonClass =
    "inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 text-sm font-black text-black shadow-[0_18px_60px_rgba(250,204,21,0.16)] transition hover:-translate-y-0.5 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60";
  const secondaryButtonClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-bold text-neutral-200 transition hover:border-white/18 hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-yellow-300/60 disabled:cursor-not-allowed disabled:opacity-60";

  const renderLoginForm = () => (
    <form method="post" onSubmit={submitAccount} className="grid gap-4">
      <label className="sr-only" aria-hidden="true">
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-neutral-300">E-Mail</span>
        <div className="relative mt-2">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateForm("email", event.target.value)}
            placeholder="kunde@example.com"
            autoComplete="email"
            className={iconInputClass}
          />
        </div>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-neutral-300">Passwort</span>
        <div className="relative mt-2">
          <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
          <input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(event) => updateForm("password", event.target.value)}
            autoComplete="current-password"
            placeholder="Dein Passwort"
            className={iconInputClass}
          />
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-300/60"
            aria-pressed={showPassword}
            aria-label={showPassword ? "Passwort ausblenden" : "Passwort anzeigen"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </label>

      <button
        type="button"
        onClick={showPasswordResetRequest}
        className="w-fit text-sm font-bold text-neutral-400 underline decoration-white/20 underline-offset-4 transition hover:text-white hover:decoration-white focus:outline-none focus:ring-2 focus:ring-yellow-300/60"
      >
        Passwort vergessen?
      </button>

      <button type="submit" disabled={submitting} className={primaryButtonClass}>
        {submitting ? (
          <RefreshCw className="h-5 w-5 animate-spin" />
        ) : (
          <Lock className="h-5 w-5" />
        )}
        {submitting ? "Bitte warten..." : "Zu meinen Galerien"}
      </button>

      <p className="text-center text-sm text-neutral-400">
        Noch kein Konto?{" "}
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setMessage("");
            accountFormStartedAtRef.current = Date.now();
          }}
          className="font-black text-yellow-300 underline decoration-yellow-300/30 underline-offset-4 transition hover:text-yellow-200"
        >
          Konto erstellen
        </button>
      </p>
    </form>
  );

  const renderCodeForm = (variant = "public") => (
    <form
      method="post"
      onSubmit={variant === "account" ? linkGalleryByCode : openGalleryCode}
      className="grid gap-4"
    >
      <label className="block">
        <span className="text-sm font-semibold text-neutral-300">Galeriecode</span>
        <div className="relative mt-2">
          <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
          <input
            value={galleryCode}
            onChange={(event) => {
              setGalleryCode(event.target.value.toUpperCase());
              setMessage("");
            }}
            placeholder="z. B. GAL-ABC123"
            className={`${iconInputClass} font-black tracking-[0.08em]`}
          />
        </div>
      </label>
      <p className="text-sm leading-6 text-neutral-500">
        Den Code findest du in deiner persönlichen Nachricht.
      </p>
      <button
        type="submit"
        disabled={variant === "account" ? linkingGallery : false}
        className={primaryButtonClass}
      >
        {variant === "account" && linkingGallery ? (
          <RefreshCw className="h-5 w-5 animate-spin" />
        ) : (
          <ImageIcon className="h-5 w-5" />
        )}
        {variant === "account"
          ? linkingGallery
            ? "Verknüpfe..."
            : "Galerie hinzufügen"
          : "Private Galerie öffnen"}
      </button>
    </form>
  );

  const renderRegisterForm = () => (
    <form method="post" onSubmit={submitAccount} className="grid gap-4">
      <label className="sr-only" aria-hidden="true">
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-neutral-300">
          Name oder Benutzername
        </span>
        <input
          value={form.name}
          onChange={(event) => updateForm("name", event.target.value)}
          required
          placeholder="z. B. Felix"
          autoComplete="name"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-neutral-300">E-Mail</span>
        <div className="relative mt-2">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateForm("email", event.target.value)}
            placeholder="kunde@example.com"
            autoComplete="email"
            className={iconInputClass}
          />
        </div>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-neutral-300">Passwort</span>
        <div className="relative mt-2">
          <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
          <input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(event) => updateForm("password", event.target.value)}
            autoComplete="new-password"
            placeholder="Mindestens 8 Zeichen"
            className={iconInputClass}
          />
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-300/60"
            aria-pressed={showPassword}
            aria-label={showPassword ? "Passwort ausblenden" : "Passwort anzeigen"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-neutral-300">
          Telefonnummer optional
        </span>
        <div className="relative mt-2">
          <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
          <input
            type="tel"
            value={form.phone}
            onChange={(event) => updateForm("phone", event.target.value)}
            placeholder="+49 ..."
            autoComplete="tel"
            className={iconInputClass}
          />
        </div>
      </label>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm leading-6 text-neutral-300">
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
            href="/datenschutz"
            className="font-bold text-white underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
          >
            Datenschutzhinweise
          </Link>{" "}
          zur Kenntnis genommen.
        </span>
      </label>

      <button type="submit" disabled={submitting} className={primaryButtonClass}>
        {submitting ? (
          <RefreshCw className="h-5 w-5 animate-spin" />
        ) : (
          <UserPlus className="h-5 w-5" />
        )}
        {submitting ? "Bitte warten..." : "Konto erstellen"}
      </button>

      <button
        type="button"
        onClick={showLoginForm}
        className="text-sm font-bold text-neutral-400 underline decoration-white/20 underline-offset-4 transition hover:text-white hover:decoration-white focus:outline-none focus:ring-2 focus:ring-yellow-300/60"
      >
        Zurück zur Anmeldung
      </button>
    </form>
  );

  const renderResetRequest = () => (
    <form method="post" onSubmit={requestPasswordReset} className="grid gap-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-neutral-500">
          Passwort vergessen
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">
          Reset-Link per E-Mail
        </h2>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Gib deine E-Mail-Adresse ein. Wenn dein Konto existiert, bekommst du
          einen Link zum Zurücksetzen.
        </p>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-neutral-300">E-Mail</span>
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
            className={iconInputClass}
          />
        </div>
      </label>
      <button type="submit" disabled={submitting} className={primaryButtonClass}>
        {submitting ? (
          <RefreshCw className="h-5 w-5 animate-spin" />
        ) : (
          <Mail className="h-5 w-5" />
        )}
        {submitting ? "Sende..." : "Passwort zurücksetzen"}
      </button>
      <button
        type="button"
        onClick={showLoginForm}
        className="text-sm font-bold text-neutral-400 underline decoration-white/20 underline-offset-4 transition hover:text-white hover:decoration-white"
      >
        Zurück zum Login
      </button>
    </form>
  );

  const renderResetConfirm = () => (
    <form method="post" onSubmit={confirmPasswordReset} className="grid gap-4">
      <div className="rounded-2xl border border-yellow-300/20 bg-yellow-400/10 p-4">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-100/70">
          Passwort zurücksetzen
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">
          Neues Passwort vergeben
        </h2>
        <p className="mt-2 text-sm leading-6 text-yellow-50/75">
          Dein Reset-Link wurde erkannt. Gib jetzt dein neues Passwort ein.
        </p>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-neutral-300">
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
            autoComplete="new-password"
            placeholder="Mindestens 8 Zeichen"
            className={iconInputClass}
          />
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setShowNewPassword((current) => !current)}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-300/60"
            aria-pressed={showNewPassword}
            aria-label={
              showNewPassword ? "Passwort ausblenden" : "Passwort anzeigen"
            }
          >
            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </label>
      <button type="submit" disabled={submitting} className={primaryButtonClass}>
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
        className="text-sm font-bold text-neutral-400 underline decoration-white/20 underline-offset-4 transition hover:text-white hover:decoration-white"
      >
        Zurück zum Login
      </button>
    </form>
  );

  return (
    <main
      className={`min-h-screen overflow-x-hidden px-4 py-5 sm:px-6 sm:py-8 ${
        dark
          ? "bg-[#080808] text-white"
          : "bg-[linear-gradient(135deg,#8f98a5,#c2c7ce_48%,#949fac)] text-white"
      }`}
    >
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_8%,rgba(250,204,21,0.14),transparent_30%),radial-gradient(circle_at_86%_20%,rgba(255,255,255,0.09),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent)]" />

      <div className="mx-auto max-w-[1200px]">
        <motion.section
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#151515] shadow-[0_24px_80px_rgba(0,0,0,0.36)] md:rounded-[2rem] lg:grid lg:min-h-[720px] lg:grid-cols-[0.54fr_0.46fr]"
        >
          <aside className="relative min-h-[190px] overflow-hidden md:min-h-[230px] lg:min-h-full">
            <div className="absolute inset-0">
              <Image
                src={LOUNGE_IMAGE}
                alt="Private Kundengalerie von feliix.wxf"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 648px"
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20 lg:bg-gradient-to-br lg:from-black/92 lg:via-black/38 lg:to-black/12" />
            <div className="absolute inset-0 opacity-[0.10] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />

            <div className="relative flex h-full min-h-[190px] flex-col justify-end p-5 md:min-h-[230px] md:p-8 lg:min-h-full lg:p-10">
              <Link
                href="/"
                className="absolute left-5 top-5 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-black/45 px-4 text-sm font-bold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-300/70"
              >
                <ArrowLeft className="h-4 w-4" />
                Website
              </Link>

              <div className="max-w-md">
                <p className="text-xs font-black uppercase tracking-[0.32em] text-yellow-200/90">
                  Private Client Lounge
                </p>
                <h1 className="mt-4 text-3xl font-black leading-tight text-white md:text-5xl">
                  Deine Bilder.
                  <br />
                  Dein persönlicher Bereich.
                </h1>
                <p className="mt-4 max-w-sm text-sm leading-7 text-neutral-200 md:text-base">
                  Private Galerien, Favoriten und Downloads an einem Ort.
                </p>
                <div className="mt-6 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {[
                    [ShieldCheck, "Privat geschützt"],
                    [Heart, "Favoriten speichern"],
                    [Download, "Bilder herunterladen"],
                  ].map(([Icon, label]) => (
                    <div
                      key={label}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-black/35 px-3 text-xs font-bold text-white/90"
                    >
                      <Icon className="h-4 w-4 text-yellow-300" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="flex min-h-0 min-w-0 flex-col bg-[#111]/95 p-5 sm:p-8 lg:min-h-[720px] lg:p-10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-neutral-500">
                  Kundenbereich
                </p>
                <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
                  {user ? accountGreeting : "Schön, dass du da bist."}
                </h2>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-neutral-200 transition hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-yellow-300/60"
                aria-label="Dark- oder Whitemode wechseln"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>

            <p className="mt-4 max-w-md text-sm leading-7 text-neutral-400">
              {user
                ? "Hier findest du deine privaten Shootings, Favoriten und freigegebenen Downloads."
                : "Melde dich an oder öffne deine Galerie direkt mit deinem persönlichen Code."}
            </p>

            <div className="mt-6">
              <AnimatePresence mode="wait">
                {message && (
                  <MessageBox
                    key={`${messageType}-${message}`}
                    message={message}
                    type={messageType}
                    page="/konto"
                    source="Kundenkonto"
                  />
                )}
              </AnimatePresence>
            </div>

            {loading ? (
              <div className="mt-8 grid gap-4" aria-live="polite">
                <SkeletonGalleryCard />
                <SkeletonGalleryCard />
              </div>
            ) : user ? (
              <div className="mt-7 flex flex-1 flex-col">
                <header className="flex min-w-0 flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07]">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserRound className="h-5 w-5 text-neutral-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-white">feliix.wxf</p>
                      <p className="truncate text-sm text-neutral-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid w-full grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:w-auto sm:flex sm:flex-wrap">
                    <Link href="/" className={`${secondaryButtonClass} w-full sm:w-auto`}>
                      Zur Website
                    </Link>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setProfileMenuOpen((current) => !current)}
                        className={`${secondaryButtonClass} w-full`}
                        aria-expanded={profileMenuOpen}
                      >
                        <UserRound className="h-4 w-4" />
                        Profil
                      </button>
                      <AnimatePresence>
                        {profileMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            className="absolute right-0 z-20 mt-2 w-[min(13rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#1b1b1b] p-2 shadow-2xl"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setAccountSection("profile");
                                setProfileMenuOpen(false);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-neutral-200 hover:bg-white/8"
                            >
                              <UserRound className="h-4 w-4" />
                              Konto bearbeiten
                            </button>
                            <button
                              type="button"
                              onClick={logout}
                              className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-neutral-200 hover:bg-white/8"
                            >
                              <LogOut className="h-4 w-4" />
                              Abmelden
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </header>

                <div className="mt-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
                      {galleries.length} Galerie{galleries.length === 1 ? "" : "n"}
                    </p>
                    <h2 className="mt-2 text-3xl font-black text-white">
                      Deine Galerien
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap">
                    <button
                      type="button"
                      onClick={() => setAccountSection("galleries")}
                      className={`${secondaryButtonClass} w-full sm:w-auto ${
                        accountSection === "galleries" ? "border-yellow-300/40 text-yellow-100" : ""
                      }`}
                    >
                      Galerien
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountSection("profile")}
                      className={`${secondaryButtonClass} w-full sm:w-auto ${
                        accountSection === "profile" ? "border-yellow-300/40 text-yellow-100" : ""
                      }`}
                    >
                      Profil
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {accountSection === "profile" ? (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="mt-6 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.78fr)]"
                    >
                      <section className="min-w-0 rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4 sm:p-5">
                        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                          <div className="min-w-0">
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
                              Profil
                            </p>
                            <h3 className="mt-2 text-2xl font-black text-white">
                              Deine Angaben
                            </h3>
                          </div>
                          <label className={`${secondaryButtonClass} w-full cursor-pointer sm:w-auto`}>
                            {avatarUploading ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            Profilbild
                            <input
                              type="file"
                              accept="image/*"
                              onChange={uploadAvatar}
                              disabled={avatarUploading}
                              className="hidden"
                            />
                          </label>
                        </div>

                        <div className="mt-5 grid min-w-0 gap-5 md:grid-cols-[112px_minmax(0,1fr)]">
                          <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/[0.06] md:mx-0">
                            {avatarPreview ? (
                              <img
                                src={avatarPreview}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserRound className="h-10 w-10 text-neutral-500" />
                            )}
                          </div>
                          <div className="grid min-w-0 gap-4">
                            <label className="block">
                              <span className="text-sm font-semibold text-neutral-300">
                                Benutzername
                              </span>
                              <input
                                value={profileName}
                                onChange={(event) => {
                                  setProfileName(event.target.value);
                                  setMessage("");
                                }}
                                placeholder="z. B. Felix"
                                className={inputClass}
                              />
                            </label>
                            <label className="block">
                              <span className="text-sm font-semibold text-neutral-300">
                                Telefonnummer optional
                              </span>
                              <input
                                type="tel"
                                value={profilePhone}
                                onChange={(event) => {
                                  setProfilePhone(event.target.value);
                                  setMessage("");
                                }}
                                placeholder="+49 ..."
                                className={inputClass}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={saveProfile}
                              disabled={profileSaving}
                              className={primaryButtonClass}
                            >
                              {profileSaving && (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              )}
                              Profil speichern
                            </button>
                          </div>
                        </div>
                      </section>

                      <section className="min-w-0 rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4 sm:p-5">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
                          Sicherheit
                        </p>
                        <h3 className="mt-2 text-2xl font-black text-white">
                          Konto
                        </h3>
                        <button
                          type="button"
                          onClick={requestCurrentAccountPasswordReset}
                          disabled={submitting}
                          className={`${primaryButtonClass} mt-5`}
                        >
                          {submitting ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Mail className="h-4 w-4" />
                          )}
                          Passwort zurücksetzen
                        </button>

                        <div className="mt-5 rounded-2xl border border-red-300/18 bg-red-500/8 p-4">
                          <div className="flex items-start gap-3">
                            <Trash2 className="mt-0.5 h-5 w-5 text-red-200" />
                            <div>
                              <h4 className="font-black text-red-50">Konto löschen</h4>
                              <p className="mt-1 text-sm leading-6 text-red-100/70">
                                Konto, Profilbild, Telefonnummer und Favoriten
                                werden gelöscht. Bewertungen bleiben bestehen.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletePanelOpen((current) => !current);
                              setDeleteDataAccepted(false);
                            }}
                            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-red-300/25 bg-red-300/10 px-4 text-sm font-black text-red-50 transition hover:bg-red-300/15"
                          >
                            {deletePanelOpen ? "Abbrechen" : "Löschen vorbereiten"}
                          </button>

                          <AnimatePresence>
                            {deletePanelOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-4 grid gap-3 rounded-2xl border border-red-300/20 bg-black/25 p-4">
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
                                      className="mt-2 h-12 w-full rounded-2xl border border-red-300/20 bg-white px-4 text-sm font-black text-neutral-950 outline-none focus:border-red-400"
                                    />
                                  </label>
                                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-red-300/20 bg-red-300/10 p-3 text-sm leading-6 text-red-50">
                                    <input
                                      type="checkbox"
                                      checked={deleteDataAccepted}
                                      onChange={(event) => {
                                        setDeleteDataAccepted(event.target.checked);
                                        setMessage("");
                                      }}
                                      className="mt-1 h-4 w-4 rounded border-red-200 accent-red-500"
                                    />
                                    <span>
                                      Ich bestätige, dass meine Kontodaten gelöscht
                                      werden sollen.
                                    </span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={deleteAccount}
                                    disabled={
                                      deletingAccount ||
                                      deleteConfirmText !== "LÖSCHEN" ||
                                      !deleteDataAccepted
                                    }
                                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 text-sm font-black text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {deletingAccount ? (
                                      <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                    Endgültig löschen
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </section>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="galleries"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="mt-6"
                    >
                      <section className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-4 sm:p-5">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
                              Galeriecode hinzufügen
                            </p>
                            <p className="mt-2 max-w-lg text-sm leading-6 text-neutral-400">
                              Wenn du einen neuen Code erhalten hast, kannst du
                              ihn hier dauerhaft mit deinem Konto verbinden.
                            </p>
                          </div>
                          <div className="w-full xl:max-w-md">{renderCodeForm("account")}</div>
                        </div>
                      </section>

                      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                        {galleryFilters.map((filter) => (
                          <button
                            key={filter.key}
                            type="button"
                            onClick={() => setGalleryFilter(filter.key)}
                            className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-yellow-300/60 ${
                              galleryFilter === filter.key
                                ? "border-yellow-300/40 bg-yellow-400 text-black"
                                : "border-white/10 bg-white/[0.06] text-neutral-300 hover:bg-white/[0.1]"
                            }`}
                          >
                            {filter.label}
                            <span className="rounded-full bg-black/15 px-2 py-0.5 text-xs">
                              {filter.count}
                            </span>
                          </button>
                        ))}
                      </div>

                      {galleries.length === 0 ? (
                        <div className="mt-5 rounded-[1.5rem] border border-dashed border-white/14 bg-white/[0.035] p-8 text-center">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 text-black">
                            <PlusCircle className="h-6 w-6" />
                          </div>
                          <h3 className="mt-5 text-2xl font-black text-white">
                            Noch keine Galerie verknüpft.
                          </h3>
                          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-neutral-400">
                            Gib deinen persönlichen Galeriecode ein, um deine
                            Bilder hinzuzufügen.
                          </p>
                        </div>
                      ) : visibleGalleries.length === 0 ? (
                        <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6 text-sm text-neutral-400">
                          Für diesen Filter gibt es aktuell keine Galerie.
                        </div>
                      ) : (
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          {visibleGalleries.map((gallery, index) => {
                            const status = getGalleryStatus(gallery);
                            const galleryDate =
                              gallery.shooting_date ||
                              gallery.date ||
                              gallery.created_at;
                            return (
                              <motion.article
                                key={gallery.id}
                                initial={
                                  prefersReducedMotion
                                    ? false
                                    : { opacity: 0, y: 18 }
                                }
                                animate={
                                  prefersReducedMotion
                                    ? undefined
                                    : { opacity: 1, y: 0 }
                                }
                                transition={{
                                  duration: 0.32,
                                  delay: Math.min(index * 0.04, 0.18),
                                }}
                                className="group overflow-hidden rounded-[1.45rem] border border-white/10 bg-[#181818] shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-white/18 focus-within:ring-2 focus-within:ring-yellow-300/60"
                              >
                                <button
                                  type="button"
                                  onClick={() => openGallery(gallery)}
                                  className="relative block aspect-[4/3] w-full overflow-hidden bg-[#101010] text-left focus:outline-none"
                                >
                                  <GalleryImage
                                    src={gallery.cover_url}
                                    alt={gallery.title || "Kundengalerie"}
                                    sizes="(max-width: 768px) 100vw, 360px"
                                    className="object-cover transition duration-700 group-hover:scale-[1.035]"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/12 to-transparent" />
                                  <span
                                    className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-xs font-black backdrop-blur ${status.className}`}
                                  >
                                    {status.label}
                                  </span>
                                  <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="line-clamp-2 text-xl font-black text-white">
                                      {gallery.title || "Privates Shooting"}
                                    </h3>
                                    <p className="mt-1 text-sm text-neutral-300">
                                      {gallery.client_name || accountDisplayName || "Kundengalerie"}
                                    </p>
                                  </div>
                                </button>

                                <div className="grid gap-4 p-4">
                                  <div className="grid grid-cols-2 gap-2 text-xs font-bold text-neutral-300">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-2">
                                      <Calendar className="h-3.5 w-3.5" />
                                      {formatDate(galleryDate) || "Datum offen"}
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-2">
                                      <Sparkles className="h-3.5 w-3.5" />
                                      {gallery.category || "Shooting"}
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-2">
                                      <ImageIcon className="h-3.5 w-3.5" />
                                      {gallery.image_count || 0} Bilder
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-full bg-yellow-400/10 px-3 py-2 text-yellow-100">
                                      <Heart className="h-3.5 w-3.5" />
                                      {gallery.favorite_count || 0} Favoriten
                                    </span>
                                  </div>

                                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                                    <button
                                      type="button"
                                      onClick={() => openGallery(gallery)}
                                      className={primaryButtonClass}
                                    >
                                      Galerie öffnen
                                      <ArrowRight className="h-4 w-4" />
                                    </button>
                                    {gallery.archive_download_url && (
                                      <a
                                        href={gallery.archive_download_url}
                                        download
                                        className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-sky-300/25 bg-sky-300/10 px-4 text-sm font-black text-sky-100 transition hover:bg-sky-300/15 focus:outline-none focus:ring-2 focus:ring-sky-200"
                                      >
                                        <Download className="h-4 w-4" />
                                        ZIP
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </motion.article>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <Link
                          href="/#kontakt"
                          className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4 text-sm font-bold text-neutral-300 transition hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-yellow-300/60"
                        >
                          Neues Shooting anfragen
                        </Link>
                        <Link
                          href="/#bewertung"
                          className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4 text-sm font-bold text-neutral-300 transition hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-yellow-300/60"
                        >
                          Erfahrung bewerten
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="mt-7 flex flex-1 flex-col justify-center">
                <div className="mx-auto w-full max-w-md">
                  {mode === "resetConfirm" ? (
                    renderResetConfirm()
                  ) : mode === "resetRequest" ? (
                    renderResetRequest()
                  ) : (
                    <>
                      <div className="relative mb-6 grid grid-cols-2 rounded-full border border-white/10 bg-white/[0.055] p-1">
                        <motion.div
                          layout
                          className={`absolute bottom-1 top-1 rounded-full bg-yellow-400 ${
                            mode === "galleryCode" ? "left-1/2 right-1" : "left-1 right-1/2"
                          }`}
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setMode("login");
                            setMessage("");
                            accountFormStartedAtRef.current = Date.now();
                          }}
                          className={`relative z-10 h-11 rounded-full text-sm font-black transition ${
                            mode === "login" || mode === "register"
                              ? "text-black"
                              : "text-neutral-300"
                          }`}
                        >
                          Anmelden
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMode("galleryCode");
                            setMessage("");
                          }}
                          className={`relative z-10 h-11 rounded-full text-sm font-black transition ${
                            mode === "galleryCode" ? "text-black" : "text-neutral-300"
                          }`}
                        >
                          Galeriecode
                        </button>
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={mode}
                          initial={{ opacity: 0, x: 18 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -18 }}
                          transition={{ duration: 0.24 }}
                        >
                          {mode === "galleryCode"
                            ? renderCodeForm("public")
                            : mode === "register"
                              ? renderRegisterForm()
                              : renderLoginForm()}
                        </motion.div>
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </div>
            )}
          </section>
        </motion.section>
      </div>
    </main>
  );
}
