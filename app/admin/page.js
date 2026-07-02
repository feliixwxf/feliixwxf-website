"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Bug,
  CheckCircle2,
  CircleHelp,
  Clock,
  Copy,
  Download,
  ExternalLink,
  EyeOff,
  Eye,
  Heart,
  Image as ImageIcon,
  Images,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Star,
  Settings,
  Trash2,
  Type,
  Upload,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";

const CATEGORIES = [
  { value: "car", label: "Car" },
  { value: "portrait", label: "Portrait" },
  { value: "nature", label: "Nature & Street" },
  { value: "event", label: "Event" },
];

const PORTFOLIO_UPLOAD_MAX_EDGE = 2200;
const PORTFOLIO_UPLOAD_QUALITY = 0.92;
const PORTFOLIO_UPLOAD_TARGET_SIZE = 3.8 * 1024 * 1024;

const CLIENT_GALLERY_STATUSES = {
  active: {
    label: "Aktiv",
    badge: "bg-emerald-400 text-neutral-950",
  },
  paused: {
    label: "Pausiert",
    badge: "bg-neutral-700 text-neutral-200",
  },
  completed: {
    label: "Abgeschlossen",
    badge: "bg-sky-300 text-neutral-950",
  },
};

const CLIENT_GALLERY_CHECKLIST = [
  { key: "favorites_reviewed", label: "Favoriten geprüft" },
  { key: "finals_exported", label: "Finale Bilder exportiert" },
  { key: "archive_prepared", label: "ZIP vorbereitet" },
  { key: "client_informed", label: "Kunde informiert" },
];

const REVIEW_AVATARS = [
  { label: "Avatar 1", url: "/images/review-avatars/avatar-1.svg" },
  { label: "Avatar 2", url: "/images/review-avatars/avatar-2.svg" },
  { label: "Avatar 3", url: "/images/review-avatars/avatar-3.svg" },
  { label: "Avatar 4", url: "/images/review-avatars/avatar-4.svg" },
  { label: "Avatar 5", url: "/images/review-avatars/avatar-5.svg" },
  { label: "Avatar 6", url: "/images/review-avatars/avatar-6.svg" },
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
  {
    title: "Info-Bereich",
    description: "Bild rechts neben deinem kurzen Über-mich-Text.",
    assets: [{ key: "info_image", label: "Info-Bild" }],
  },
];

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const previewUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(previewUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      reject(new Error(`${file.name} konnte nicht im Browser vorbereitet werden.`));
    };

    image.src = previewUrl;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

async function compressPortfolioFile(file) {
  if (!file.type?.startsWith("image/")) return file;

  const image = await loadImageFromFile(file);
  const originalWidth = image.naturalWidth || image.width;
  const originalHeight = image.naturalHeight || image.height;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error(`${file.name} konnte nicht für den Upload vorbereitet werden.`);
  }

  let outputType = "image/webp";
  let extension = "webp";
  let blob = null;
  const attempts = [
    { maxEdge: PORTFOLIO_UPLOAD_MAX_EDGE, quality: PORTFOLIO_UPLOAD_QUALITY },
    { maxEdge: 2000, quality: 0.9 },
    { maxEdge: 1800, quality: 0.88 },
    { maxEdge: 1600, quality: 0.86 },
  ];

  for (const attempt of attempts) {
    const scale = Math.min(
      1,
      attempt.maxEdge / Math.max(originalWidth, originalHeight)
    );
    const width = Math.max(1, Math.round(originalWidth * scale));
    const height = Math.max(1, Math.round(originalHeight * scale));

    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    blob = await canvasToBlob(canvas, outputType, attempt.quality);

    if (blob && blob.size <= PORTFOLIO_UPLOAD_TARGET_SIZE) break;
  }

  if (!blob) {
    outputType = "image/jpeg";
    extension = "jpg";
    blob = await canvasToBlob(canvas, outputType, 0.9);
  }

  if (!blob) {
    throw new Error(`${file.name} konnte nicht komprimiert werden.`);
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "portfolio";

  return new File([blob], `${baseName}.${extension}`, {
    type: outputType,
    lastModified: Date.now(),
  });
}

async function cropImageFile(file, options) {
  if (!file.type?.startsWith("image/")) return file;

  const image = await loadImageFromFile(file);
  const originalWidth = image.naturalWidth || image.width;
  const originalHeight = image.naturalHeight || image.height;
  const aspect = options.aspect || 1;
  const zoom = Math.max(1, Number(options.zoom) || 1);
  const xPercent = Math.min(100, Math.max(0, Number(options.xPercent) || 50));
  const yPercent = Math.min(100, Math.max(0, Number(options.yPercent) || 50));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error(`${file.name} konnte nicht zugeschnitten werden.`);
  }

  let cropWidth = originalWidth;
  let cropHeight = originalWidth / aspect;

  if (cropHeight > originalHeight) {
    cropHeight = originalHeight;
    cropWidth = originalHeight * aspect;
  }

  cropWidth = Math.max(1, cropWidth / zoom);
  cropHeight = Math.max(1, cropHeight / zoom);

  const maxX = Math.max(0, originalWidth - cropWidth);
  const maxY = Math.max(0, originalHeight - cropHeight);
  const sourceX = maxX * (xPercent / 100);
  const sourceY = maxY * (yPercent / 100);
  const outputWidth = options.outputWidth || Math.round(cropWidth);
  const outputHeight = options.outputHeight || Math.round(outputWidth / aspect);

  canvas.width = outputWidth;
  canvas.height = outputHeight;
  context.clearRect(0, 0, outputWidth, outputHeight);
  context.drawImage(
    image,
    sourceX,
    sourceY,
    cropWidth,
    cropHeight,
    0,
    0,
    outputWidth,
    outputHeight
  );

  const keepPng = file.type === "image/png";
  const outputType = keepPng ? "image/png" : "image/jpeg";
  const extension = keepPng ? "png" : "jpg";
  const blob = await canvasToBlob(canvas, outputType, keepPng ? undefined : 0.96);

  if (!blob) {
    throw new Error(`${file.name} konnte nicht zugeschnitten werden.`);
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "bild";

  return new File([blob], `${baseName}-zuschnitt.${extension}`, {
    type: outputType,
    lastModified: Date.now(),
  });
}

const SITE_ASSET_LABELS = Object.fromEntries(
  SITE_ASSET_GROUPS.flatMap((group) =>
    group.assets.map((asset) => [asset.key, asset.label])
  )
);

const BUSINESS_CARD_URL = "https://www.feliixwxf.de";
const DEFAULT_ARCHIVED_PORTFOLIO_KEYS = "portrait,nature";

const DEFAULT_SITE_SETTINGS = {
  hero_eyebrow: "Fotografie & Editing",
  hero_title_line_1: "Bilder mit Charakter.",
  hero_title_line_2: "Bearbeitung mit Stil.",
  hero_intro:
    "Willkommen bei feliix.wxf. Moderne Fotografie, kreative Bearbeitung und visuelle Inhalte mit starkem Look.",
  info_eyebrow: "Info",
  info_heading: "Über feliix.wxf",
  info_text:
    "Hinter feliix.wxf steckt viel Erfahrung in Fotografie und Bildbearbeitung. Mein Fokus liegt auf klaren Looks, sauberer Retusche, starken Kontrasten und Bildern, die natürlich wirken, aber trotzdem einen professionellen Wiedererkennungswert haben.",
  portfolio_eyebrow: "Portfolio",
  portfolio_heading: "Ausgewählte Arbeiten",
  portfolio_archived_keys: DEFAULT_ARCHIVED_PORTFOLIO_KEYS,
  reviews_eyebrow: "Bewertung",
  reviews_heading: "Kundenstimmen",
  review_form_eyebrow: "Deine Meinung",
  review_form_heading: "Wie war dein Shooting?",
  review_form_text:
    "Hinterlasse eine kurze Bewertung. Deine Rückmeldung hilft anderen, einen echten Eindruck von meiner Arbeit zu bekommen.",
  contact_heading: "Lass uns dein Shooting planen.",
  contact_intro: "Schreib mir direkt über das Formular.",
  contact_email: "felixwolff411@gmail.com",
  contact_phone: "+49 15259105754",
  instagram_url: "https://www.instagram.com/feliix.wxf",
  instagram_label: "@feliix.wxf",
  form_action: "https://formspree.io/f/xqennvyy",
  maintenance_mode: "false",
};

function parseArchivedPortfolioKeys(value) {
  return String(value || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
}

const TEXT_FIELD_GROUPS = [
  {
    title: "Startseite",
    description: "Texte im ersten sichtbaren Bereich deiner Website.",
    fields: [
      {
        key: "hero_eyebrow",
        label: "Kleine Zeile",
        placeholder: "Fotografie & Editing",
      },
      {
        key: "hero_title_line_1",
        label: "Headline Zeile 1",
        placeholder: "Bilder mit Charakter.",
      },
      {
        key: "hero_title_line_2",
        label: "Headline Zeile 2",
        placeholder: "Bearbeitung mit Stil.",
      },
      {
        key: "hero_intro",
        label: "Untertext",
        placeholder: "Willkommen bei feliix.wxf...",
        multiline: true,
      },
    ],
  },
  {
    title: "Info & Portfolio",
    description: "Texte für den Info-Block und die Portfolio-Überschrift.",
    fields: [
      { key: "info_eyebrow", label: "Info kleine Zeile", placeholder: "Info" },
      {
        key: "info_heading",
        label: "Info Überschrift",
        placeholder: "Über feliix.wxf",
      },
      {
        key: "info_text",
        label: "Info Text",
        placeholder: "Hinter feliix.wxf steckt...",
        multiline: true,
      },
      {
        key: "portfolio_eyebrow",
        label: "Portfolio kleine Zeile",
        placeholder: "Portfolio",
      },
      {
        key: "portfolio_heading",
        label: "Portfolio Überschrift",
        placeholder: "Ausgewählte Arbeiten",
      },
    ],
  },
  {
    title: "Bewertungen",
    description: "Überschriften und Erklärung im Bewertungsbereich.",
    fields: [
      {
        key: "reviews_eyebrow",
        label: "Bewertung kleine Zeile",
        placeholder: "Bewertung",
      },
      {
        key: "reviews_heading",
        label: "Bewertung Überschrift",
        placeholder: "Kundenstimmen",
      },
      {
        key: "review_form_eyebrow",
        label: "Formular kleine Zeile",
        placeholder: "Deine Meinung",
      },
      {
        key: "review_form_heading",
        label: "Formular Überschrift",
        placeholder: "Wie war dein Shooting?",
      },
      {
        key: "review_form_text",
        label: "Formular Text",
        placeholder: "Hinterlasse eine kurze Bewertung...",
        multiline: true,
      },
    ],
  },
];

const CONTACT_FIELDS = [
  {
    key: "contact_heading",
    label: "Kontakt-Überschrift",
    helper: "Große Überschrift im Kontaktbereich.",
    placeholder: "Lass uns dein Shooting planen.",
    icon: Type,
  },
  {
    key: "contact_intro",
    label: "Kontakt-Text",
    helper: "Kurzer Satz direkt unter der Überschrift.",
    placeholder: "Schreib mir direkt über das Formular.",
    icon: MessageSquare,
    multiline: true,
  },
  {
    key: "contact_email",
    label: "E-Mail",
    helper: "Wird im Kontaktbereich und Impressum angezeigt.",
    placeholder: "name@example.com",
    icon: Mail,
  },
  {
    key: "contact_phone",
    label: "Telefon",
    helper: "Wird im Kontaktbereich und Impressum angezeigt.",
    placeholder: "+49 ...",
    icon: Phone,
  },
  {
    key: "instagram_url",
    label: "Instagram-Link",
    helper: "Vollständiger Link zum Profil.",
    placeholder: "https://www.instagram.com/feliix.wxf",
    icon: ExternalLink,
  },
  {
    key: "instagram_label",
    label: "Instagram-Name",
    helper: "Text, der auf der Website angezeigt wird.",
    placeholder: "@feliix.wxf",
    icon: Type,
  },
  {
    key: "form_action",
    label: "Formular-Ziel",
    helper: "Formspree-Link für das Kontaktformular.",
    placeholder: "https://formspree.io/f/...",
    icon: ExternalLink,
  },
];

const DEFAULT_CLIENT_GALLERY_FORM = {
  title: "",
  client_name: "",
  client_email: "",
  access_code: "",
  downloads_enabled: false,
};

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

function createImageDrafts(items) {
  return Object.fromEntries(
    items.map((image) => [
      image.id,
      {
        title: image.title || "",
        note: image.note || "",
      },
    ])
  );
}

function sortImages(items, mode = "manual") {
  return [...items].sort((a, b) => {
    if (mode === "newest") {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    }

    if (mode === "oldest") {
      return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    }

    const orderDifference =
      Number(a.sort_order || 0) - Number(b.sort_order || 0);

    if (orderDifference !== 0) return orderDifference;

    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });
}

function getClientGalleryStatus(gallery) {
  if (gallery?.status && CLIENT_GALLERY_STATUSES[gallery.status]) {
    return gallery.status;
  }

  return gallery?.is_active ? "active" : "paused";
}

function getClientChecklistDone(gallery) {
  if (!gallery) return 0;

  return CLIENT_GALLERY_CHECKLIST.filter((item) => gallery[item.key]).length;
}

function getClientProjectStep(gallery) {
  const status = getClientGalleryStatus(gallery);

  if (status === "completed") {
    return {
      label: "Abgeschlossen",
      helper: "Projekt ist fertig und bleibt archiviert sichtbar.",
      tone: "border-sky-300/25 bg-sky-300/10 text-sky-100",
    };
  }

  if ((gallery?.image_count || 0) === 0) {
    return {
      label: "Bilder hochladen",
      helper: "Noch keine Kundenbilder in dieser Galerie.",
      tone: "border-yellow-400/25 bg-yellow-400/10 text-yellow-100",
    };
  }

  if ((gallery?.favorite_count || 0) === 0) {
    return {
      label: "Auswahl offen",
      helper: "Kunde hat noch keine Favoriten markiert.",
      tone: "border-white/10 bg-white/[0.06] text-neutral-200",
    };
  }

  if (!gallery?.favorites_reviewed) {
    return {
      label: "Favoriten prüfen",
      helper: "Kundenauswahl kontrollieren und final bearbeiten.",
      tone: "border-yellow-400/25 bg-yellow-400/10 text-yellow-100",
    };
  }

  if (!gallery?.finals_exported) {
    return {
      label: "Finale Bilder exportieren",
      helper: "Bearbeitete Enddateien vorbereiten.",
      tone: "border-yellow-400/25 bg-yellow-400/10 text-yellow-100",
    };
  }

  if (!gallery?.archive_prepared) {
    return {
      label: "Archiv vorbereiten",
      helper: "ZIP oder finale Dateien vorbereiten.",
      tone: "border-yellow-400/25 bg-yellow-400/10 text-yellow-100",
    };
  }

  if (!gallery?.client_informed) {
    return {
      label: "Kunde informieren",
      helper: "Galerie ist bereit zur Rückmeldung an den Kunden.",
      tone: "border-emerald-400/25 bg-emerald-400/10 text-emerald-100",
    };
  }

  return {
    label: "Bereit zum Abschliessen",
    helper: "Alle Workflow-Punkte sind erledigt.",
    tone: "border-emerald-400/25 bg-emerald-400/10 text-emerald-100",
  };
}

function getClientAccountState(gallery) {
  if (gallery?.account_status === "linked" || gallery?.account_exists) {
    return {
      label: "Kundenkonto verknüpft",
      helper: "Kunde kann die Galerie im Konto sehen.",
      tone: "border-emerald-400/25 bg-emerald-400/10 text-emerald-100",
    };
  }

  if (gallery?.client_email) {
    return {
      label: "E-Mail hinterlegt",
      helper:
        "Galerie erscheint automatisch, sobald sich der Kunde mit dieser E-Mail anmeldet.",
      tone: "border-sky-300/25 bg-sky-300/10 text-sky-100",
    };
  }

  return {
    label: "Noch nicht verknüpft",
    helper: "Kunde kann die Galerie nach QR-Scan und Login automatisch verbinden.",
    tone: "border-yellow-400/25 bg-yellow-400/10 text-yellow-100",
  };
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [images, setImages] = useState([]);
  const [clientGalleries, setClientGalleries] = useState([]);
  const [siteAssets, setSiteAssets] = useState({});
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [settingsDraft, setSettingsDraft] = useState(DEFAULT_SITE_SETTINGS);
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);
  const [clientGalleryForm, setClientGalleryForm] = useState(
    DEFAULT_CLIENT_GALLERY_FORM
  );
  const [showClientGalleryForm, setShowClientGalleryForm] = useState(false);
  const [activeClientGalleryId, setActiveClientGalleryId] = useState("");
  const [clientGallerySearch, setClientGallerySearch] = useState("");
  const [customerAccountSearch, setCustomerAccountSearch] = useState("");
  const [customerAccounts, setCustomerAccounts] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [securityChecks, setSecurityChecks] = useState([]);
  const [userErrors, setUserErrors] = useState([]);
  const [userErrorsLoadError, setUserErrorsLoadError] = useState("");
  const [customerAccountLoading, setCustomerAccountLoading] = useState(false);
  const [customerAccountSearched, setCustomerAccountSearched] = useState(false);
  const [selectedCustomerAccount, setSelectedCustomerAccount] = useState(null);
  const [clientGalleryStatusFilter, setClientGalleryStatusFilter] =
    useState("all");
  const [clientGallerySortMode, setClientGallerySortMode] = useState("newest");
  const [activeClientPanel, setActiveClientPanel] = useState("overview");
  const [publicOrigin, setPublicOrigin] = useState("");
  const [activeClientGalleryQrUrl, setActiveClientGalleryQrUrl] = useState("");
  const [businessCardQrUrl, setBusinessCardQrUrl] = useState("");
  const [clientGalleryFile, setClientGalleryFile] = useState(null);
  const [clientGalleryFiles, setClientGalleryFiles] = useState([]);
  const [imageCategory, setImageCategory] = useState("car");
  const [imageFile, setImageFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageDrafts, setImageDrafts] = useState({});
  const [imageSearch, setImageSearch] = useState("");
  const [imageCategoryFilter, setImageCategoryFilter] = useState("all");
  const [imageSortMode, setImageSortMode] = useState("manual");
  const [selectedImageIds, setSelectedImageIds] = useState([]);
  const [collapsedPortfolioCategories, setCollapsedPortfolioCategories] =
    useState({});
  const [siteAssetFiles, setSiteAssetFiles] = useState({});
  const [siteAssetPreviews, setSiteAssetPreviews] = useState({});
  const [activeTab, setActiveTab] = useState("dashboard");
  const [reviewFilter, setReviewFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [clientGalleryUploading, setClientGalleryUploading] = useState(false);
  const [siteAssetUploadingKey, setSiteAssetUploadingKey] = useState(null);
  const [portfolioVisibilitySaving, setPortfolioVisibilitySaving] =
    useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [busyId, setBusyId] = useState(null);
  const [busyImageId, setBusyImageId] = useState(null);
  const [busyClientGalleryId, setBusyClientGalleryId] = useState(null);
  const [busyClientImageId, setBusyClientImageId] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imagePreviewSize, setImagePreviewSize] = useState(null);
  const [clientGalleryPreview, setClientGalleryPreview] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [cropSession, setCropSession] = useState(null);
  const [cropPreview, setCropPreview] = useState("");
  const [cropImageSize, setCropImageSize] = useState(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);
  const [cropBusy, setCropBusy] = useState(false);
  const cropFrameRef = useRef(null);
  const cropInteractionRef = useRef({
    pointers: new Map(),
    lastX: 0,
    lastY: 0,
    pinchDistance: 0,
    zoom: 1,
  });

  const approvedReviews = reviews.filter((review) => review.is_approved);
  const pendingReviews = reviews.filter((review) => !review.is_approved);
  const visibleReviews =
    reviewFilter === "pending"
      ? pendingReviews
      : reviewFilter === "approved"
        ? approvedReviews
        : reviews;
  const normalizedImageSearch = imageSearch.trim().toLowerCase();
  const imagesByCategory = CATEGORIES.map((category) => ({
    ...category,
    images: sortImages(
      images
        .filter((image) => image.category === category.value)
        .filter((image) => {
          if (
            imageCategoryFilter !== "all" &&
            image.category !== imageCategoryFilter
          ) {
            return false;
          }

          if (!normalizedImageSearch) return true;

          return [
            image.title,
            image.note,
            image.path,
            category.label,
            formatDate(image.created_at),
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedImageSearch);
        }),
      imageSortMode
    ),
  }));
  const visibleImageCount = imagesByCategory.reduce(
    (total, category) => total + category.images.length,
    0
  );
  const displayedImageCategories = imagesByCategory.filter(
    (category) =>
      imageCategoryFilter === "all" || category.value === imageCategoryFilter
  );
  const visibleImageIds = imagesByCategory.flatMap((category) =>
    category.images.map((image) => image.id)
  );
  const selectedImages = images.filter((image) =>
    selectedImageIds.includes(image.id)
  );
  const allVisibleImagesSelected =
    visibleImageIds.length > 0 &&
    visibleImageIds.every((id) => selectedImageIds.includes(id));
  const missingCoverAssets = SITE_ASSET_GROUPS.flatMap((group) =>
    group.assets.filter((asset) => !siteAssets[asset.key])
  );
  const archivedPortfolioKeys = parseArchivedPortfolioKeys(
    settingsDraft.portfolio_archived_keys
  );
  const tabs = [
    {
      value: "dashboard",
      label: "Start",
      description: "Was jetzt wichtig ist",
      icon: LayoutDashboard,
    },
    {
      value: "portfolio",
      label: "Portfolio",
      description: "Galerie-Bilder",
      count: images.length,
      icon: Images,
    },
    {
      value: "covers",
      label: "Titelbilder",
      description: "Startseite & Kacheln",
      icon: ImageIcon,
    },
    {
      value: "clients",
      label: "Kunden",
      description: "Galerien & Codes",
      count: clientGalleries.length,
      icon: Users,
    },
    {
      value: "texts",
      label: "Texte",
      description: "Website-Texte",
      icon: Type,
    },
    {
      value: "contact",
      label: "Kontakt",
      description: "Daten & Links",
      icon: Mail,
    },
    {
      value: "reviews",
      label: "Bewertungen",
      description: "Moderation",
      count: pendingReviews.length,
      icon: MessageSquare,
    },
    {
      value: "settings",
      label: "Einstellungen",
      description: "Werkzeuge",
      icon: ShieldCheck,
    },
    {
      value: "system",
      label: "Protokoll",
      description: "Sicherheit & Verlauf",
      icon: Clock,
    },
    {
      value: "user-errors",
      label: "Nutzerfehler",
      description: "Fehler von Besuchern",
      icon: Bug,
    },
  ];
  const tabGroups = [
    {
      title: "Alltag",
      values: ["dashboard", "clients", "reviews"],
    },
    {
      title: "Website",
      values: ["portfolio", "covers", "texts", "contact"],
    },
    {
      title: "System",
      values: ["settings", "system", "user-errors"],
    },
  ].map((group) => ({
    ...group,
    tabs: group.values
      .map((value) => tabs.find((tab) => tab.value === value))
      .filter(Boolean),
  }));
  const activeTabDetails =
    tabs.find((tab) => tab.value === activeTab) || tabs[0];
  const latestImage = [...images].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  )[0];
  const activeClientGallery =
    clientGalleries.find((gallery) => gallery.id === activeClientGalleryId) ||
    clientGalleries[0];
  const activeClientChecklistDone = getClientChecklistDone(activeClientGallery);
  const activeClientProjectStep = getClientProjectStep(activeClientGallery);
  const activeClientAccountState = getClientAccountState(activeClientGallery);
  const activeClientImages = activeClientGallery?.images || [];
  const activeClientCoverImage =
    activeClientImages.find(
      (image) => image.id === activeClientGallery?.cover_image_id
    ) || activeClientImages[0];
  const activeClientGalleryUrl =
    activeClientGallery && publicOrigin
      ? `${publicOrigin}/kunden?code=${encodeURIComponent(
          activeClientGallery.access_code
        )}`
      : "";
  const activeClientFavoriteImages = activeClientGallery
    ? (activeClientGallery.favorites || [])
        .map((favorite) => {
          const image = (activeClientGallery.images || []).find(
            (item) => item.id === favorite.image_id
          );

          if (!image) return null;

          return {
            ...image,
            favorite_created_at: favorite.created_at,
          };
        })
        .filter(Boolean)
        .sort(
          (a, b) =>
            new Date(b.favorite_created_at || 0) -
            new Date(a.favorite_created_at || 0)
        )
    : [];
  const activeClientSuggestedPanel =
    activeClientImages.length === 0
      ? "upload"
      : activeClientFavoriteImages.length > 0 &&
          !activeClientGallery?.favorites_reviewed
        ? "favorites"
        : "overview";
  const clientDetailPanels = [
    {
      value: "overview",
      label: "Details",
      helper: "Kunde & Status",
      icon: LayoutDashboard,
    },
    {
      value: "share",
      label: "Freigabe",
      helper: "Code & QR",
      icon: QrCode,
    },
    {
      value: "upload",
      label: "Upload",
      helper: "Bilder dazu",
      icon: Upload,
    },
    {
      value: "favorites",
      label: "Auswahl",
      helper: `${activeClientFavoriteImages.length} markiert`,
      icon: Heart,
    },
    {
      value: "images",
      label: "Archiv",
      helper: `${activeClientImages.length} Dateien`,
      icon: Images,
    },
  ];
  const clientGalleryStats = {
    active: clientGalleries.filter(
      (gallery) => getClientGalleryStatus(gallery) === "active"
    ).length,
    paused: clientGalleries.filter(
      (gallery) => getClientGalleryStatus(gallery) === "paused"
    ).length,
    completed: clientGalleries.filter(
      (gallery) => getClientGalleryStatus(gallery) === "completed"
    ).length,
  };
  const clientProjectQueue = clientGalleries.filter(
    (gallery) => getClientGalleryStatus(gallery) !== "completed"
  );
  const clientProjectsNeedingReview = clientProjectQueue.filter(
    (gallery) => (gallery.favorite_count || 0) > 0 && !gallery.favorites_reviewed
  );
  const clientProjectsReadyToFinish = clientProjectQueue.filter(
    (gallery) =>
      getClientChecklistDone(gallery) === CLIENT_GALLERY_CHECKLIST.length
  );
  const clientProjectPipeline = [
    {
      label: "Laufend",
      value: clientProjectQueue.length,
      helper: "aktive oder pausierte Projekte",
      icon: Users,
    },
    {
      label: "Favoriten prüfen",
      value: clientProjectsNeedingReview.length,
      helper: "Kundenauswahl ist da",
      icon: Heart,
    },
    {
      label: "Bereit",
      value: clientProjectsReadyToFinish.length,
      helper: "Checkliste komplett",
      icon: CheckCircle2,
    },
  ];
  const clientProjectFocus = [...clientProjectQueue]
    .sort((a, b) => {
      const doneA = getClientChecklistDone(a);
      const doneB = getClientChecklistDone(b);
      const favoritesA = a.favorite_count || 0;
      const favoritesB = b.favorite_count || 0;

      if (
        favoritesA > 0 &&
        !a.favorites_reviewed &&
        !(favoritesB > 0 && !b.favorites_reviewed)
      ) {
        return -1;
      }
      if (
        favoritesB > 0 &&
        !b.favorites_reviewed &&
        !(favoritesA > 0 && !a.favorites_reviewed)
      ) {
        return 1;
      }
      if (doneA !== doneB) return doneB - doneA;

      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    })
    .slice(0, 3);
  const normalizedClientGallerySearch = clientGallerySearch.trim().toLowerCase();
  const visibleClientGalleries = [...clientGalleries]
    .filter((gallery) => {
      if (
        clientGalleryStatusFilter !== "all" &&
        getClientGalleryStatus(gallery) !== clientGalleryStatusFilter
      ) {
        return false;
      }

      if (!normalizedClientGallerySearch) return true;

      return [
        gallery.title,
        gallery.client_name,
        gallery.client_email,
        gallery.access_code,
        formatDate(gallery.created_at),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedClientGallerySearch);
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);

      return clientGallerySortMode === "oldest"
        ? dateA - dateB
        : dateB - dateA;
    });
  const latestClientGallery = clientGalleries[0];
  const activeCropFile = cropSession?.files?.[cropSession.index] || null;
  const cropAspectWidth = cropSession?.aspectWidth || 3;
  const cropAspectHeight = cropSession?.aspectHeight || 4;
  const cropConfirmationText = cropSession
    ? `${cropSession.index + 1}/${cropSession.files.length}`
    : "";
  const confirmationRequired = Boolean(
    confirmAction && confirmAction.requiresConfirmation !== false
  );

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  const requestConfirmation = (action) => {
    setConfirmChecked(false);
    setConfirmAction({
      title: "Aktion bestätigen",
      description: "Diese Aktion kann nicht automatisch rückgängig gemacht werden.",
      confirmLabel: "Bestätigen",
      cancelLabel: "Abbrechen",
      requiresConfirmation: true,
      ...action,
    });
  };

  const runConfirmedAction = async () => {
    if (!confirmAction?.onConfirm) return;
    if (confirmationRequired && !confirmChecked) {
      showMessage("Bitte bestätige die Aktion mit dem Haken.", "error");
      return;
    }

    setConfirmBusy(true);
    try {
      await confirmAction.onConfirm();
      setConfirmAction(null);
    } finally {
      setConfirmBusy(false);
    }
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

    const nextImages = data.images || [];
    setImages(nextImages);
    setImageDrafts(createImageDrafts(nextImages));
    setSelectedImageIds((current) =>
      current.filter((id) => nextImages.some((image) => image.id === id))
    );
  };

  const loadClientGalleries = async () => {
    setMessage("");

    const response = await fetch("/api/admin/client-galleries", {
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      showMessage(
        data.error || "Kundengalerien konnten nicht geladen werden.",
        "error"
      );
      return;
    }

    const galleries = data.galleries || [];
    setClientGalleries(galleries);
    setActiveClientGalleryId((current) =>
      current && galleries.some((gallery) => gallery.id === current)
        ? current
        : galleries[0]?.id || ""
    );
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

  const loadSiteSettings = async () => {
    setMessage("");

    const response = await fetch("/api/admin/site-settings", {
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      showMessage(
        data.error || "Kontaktinfos konnten nicht geladen werden.",
        "error"
      );
      return;
    }

    const nextSettings = {
      ...DEFAULT_SITE_SETTINGS,
      ...(data.settings || {}),
    };

    setSiteSettings(nextSettings);
    setSettingsDraft(nextSettings);
  };

  const loadActivityLogs = async () => {
    const response = await fetch("/api/admin/activity", {
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      setActivityLogs([]);
      return;
    }

    setActivityLogs(data.logs || []);
  };

  const clearActivityLogs = () => {
    requestConfirmation({
      title: "Aktivitätsverlauf leeren?",
      description:
        "Alle gespeicherten Admin-Aktionen werden aus dem Protokoll entfernt. Das spart Speicher und betrifft keine Bilder, Kunden, Bewertungen oder Einstellungen.",
      confirmLabel: "Verlauf leeren",
      onConfirm: async () => {
        const response = await fetch("/api/admin/activity", {
          method: "DELETE",
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          showMessage(
            data.error || "Aktivitätsverlauf konnte nicht geleert werden.",
            "error"
          );
          return;
        }

        setActivityLogs([]);
        showMessage("Aktivitätsverlauf wurde geleert.", "success");
      },
    });
  };

  const loadSecurityChecks = async () => {
    const response = await fetch("/api/admin/security-check", {
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      setSecurityChecks([
        {
          key: "security-check",
          label: "Sicherheitscheck",
          ok: false,
          detail: data.error || "Konnte nicht geladen werden.",
        },
      ]);
      return;
    }

    setSecurityChecks(data.checks || []);
  };

  const loadUserErrors = async () => {
    setUserErrorsLoadError("");

    const response = await fetch("/api/admin/user-errors", {
      cache: "no-store",
    }).catch(() => null);
    const data = await response?.json().catch(() => ({}));

    if (!response?.ok) {
      setUserErrors([]);
      const details = data?.details ? ` Details: ${data.details}` : "";
      setUserErrorsLoadError(
        `${data?.error || "Nutzerfehler konnten nicht geladen werden. Bitte Verbindung und Supabase-Tabelle prüfen."}${details}`
      );
      return;
    }

    setUserErrors(data.errors || []);
  };

  const setUserErrorResolved = async (errorLog, isResolved) => {
    const response = await fetch("/api/admin/user-errors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: errorLog.id, isResolved }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      showMessage(data.error || "Fehlerstatus konnte nicht gespeichert werden.", "error");
      return;
    }

    setUserErrors((current) =>
      current.map((item) =>
        item.id === errorLog.id
          ? { ...item, is_resolved: Boolean(isResolved) }
          : item
      )
    );
    showMessage(
      isResolved ? "Nutzerfehler wurde erledigt." : "Nutzerfehler wurde geöffnet.",
      "success"
    );
  };

  const deleteUserError = (errorLog) => {
    requestConfirmation({
      title: "Nutzerfehler löschen?",
      description:
        "Diese Meldung wird dauerhaft aus dem Adminbereich entfernt. Das ist sinnvoll, wenn der Fehler erledigt oder nur ein Test war.",
      confirmLabel: "Meldung löschen",
      onConfirm: async () => {
        const response = await fetch("/api/admin/user-errors", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: errorLog.id }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          showMessage(
            data.error || "Nutzerfehler konnte nicht gelöscht werden.",
            "error"
          );
          return;
        }

        setUserErrors((current) =>
          current.filter((item) => item.id !== errorLog.id)
        );
        showMessage("Nutzerfehler wurde gelöscht.", "success");
      },
    });
  };

  const refreshDashboard = async () => {
    setMessage("");
    await Promise.all([
      loadReviews(),
      loadImages(),
      loadClientGalleries(),
      loadSiteAssets(),
      loadSiteSettings(),
      loadActivityLogs(),
      loadSecurityChecks(),
      loadUserErrors(),
    ]);
    showMessage("Admin-Daten wurden neu geladen.", "success");
  };

  useEffect(() => {
    setPublicOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(BUSINESS_CARD_URL, {
      errorCorrectionLevel: "H",
      margin: 3,
      width: 1000,
      color: {
        dark: "#0a0a0a",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (!cancelled) setBusinessCardQrUrl(url);
      })
      .catch(() => {
        if (!cancelled) setBusinessCardQrUrl("");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!activeClientGalleryUrl) {
      setActiveClientGalleryQrUrl("");
      return;
    }

    QRCode.toDataURL(activeClientGalleryUrl, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 640,
      color: {
        dark: "#0a0a0a",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (!cancelled) setActiveClientGalleryQrUrl(url);
      })
      .catch(() => {
        if (!cancelled) setActiveClientGalleryQrUrl("");
      });

    return () => {
      cancelled = true;
    };
  }, [activeClientGalleryUrl]);

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((response) => response.json())
      .then(async (data) => {
        setConfigured(data.configured);
        setAuthenticated(data.authenticated);

        if (data.authenticated) {
          await Promise.all([
            loadReviews(),
            loadImages(),
            loadClientGalleries(),
            loadSiteAssets(),
            loadSiteSettings(),
            loadActivityLogs(),
            loadSecurityChecks(),
            loadUserErrors(),
          ]);
        }
      })
      .catch(() => {
        showMessage("Admin-Status konnte nicht geladen werden.", "error");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!authenticated || activeTab !== "user-errors") return;

    loadUserErrors();
  }, [authenticated, activeTab]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, accessCode }),
    });
    const data = await response.json();

    if (!response.ok) {
      showMessage(data.error || "Login fehlgeschlagen.", "error");
      setLoading(false);
      return;
    }

    setPassword("");
    setAccessCode("");
    setAuthenticated(true);
    await Promise.all([
      loadReviews(),
      loadImages(),
      loadClientGalleries(),
      loadSiteAssets(),
      loadSiteSettings(),
      loadActivityLogs(),
      loadSecurityChecks(),
      loadUserErrors(),
    ]);
    setLoading(false);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setReviews([]);
    setImages([]);
    setClientGalleries([]);
    setActiveClientGalleryId("");
    setClientGalleryForm(DEFAULT_CLIENT_GALLERY_FORM);
    setClientGalleryFile(null);
    setSiteAssets({});
    setSiteSettings(DEFAULT_SITE_SETTINGS);
    setSettingsDraft(DEFAULT_SITE_SETTINGS);
    setActivityLogs([]);
    setSecurityChecks([]);
    setUserErrors([]);
    showMessage("Du wurdest ausgeloggt.", "success");
  };

  const copyText = async (text, successMessage) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      showMessage(successMessage, "success");
    } catch {
      window.prompt("Text kopieren:", text);
      showMessage("Einladung wurde zum Kopieren geöffnet.", "success");
    }
  };

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      setImagePreviewSize(null);
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);
    setImagePreviewSize(null);

    const previewImage = new Image();
    previewImage.onload = () => {
      setImagePreviewSize({
        width: previewImage.naturalWidth,
        height: previewImage.naturalHeight,
      });
    };
    previewImage.src = previewUrl;

    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  useEffect(() => {
    if (!clientGalleryFile) {
      setClientGalleryPreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(clientGalleryFile);
    setClientGalleryPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [clientGalleryFile]);

  useEffect(() => {
    const previewEntries = Object.entries(siteAssetFiles)
      .filter(([, file]) => file)
      .map(([key, file]) => [key, URL.createObjectURL(file)]);

    setSiteAssetPreviews(Object.fromEntries(previewEntries));

    return () => {
      previewEntries.forEach(([, previewUrl]) => URL.revokeObjectURL(previewUrl));
    };
  }, [siteAssetFiles]);

  useEffect(() => {
    if (!activeCropFile) {
      setCropPreview("");
      setCropImageSize(null);
      return;
    }

    const previewUrl = URL.createObjectURL(activeCropFile);
    setCropPreview(previewUrl);
    setCropImageSize(null);

    const previewImage = new Image();
    previewImage.onload = () => {
      setCropImageSize({
        width: previewImage.naturalWidth,
        height: previewImage.naturalHeight,
      });
    };
    previewImage.src = previewUrl;

    return () => URL.revokeObjectURL(previewUrl);
  }, [activeCropFile]);

  useEffect(() => {
    cropInteractionRef.current.zoom = cropZoom;
  }, [cropZoom]);

  const clampCropValue = (value) => Math.min(100, Math.max(0, value));

  const moveCropPosition = (deltaX, deltaY) => {
    const frame = cropFrameRef.current;
    if (!frame) return;

    const rect = frame.getBoundingClientRect();
    const zoom = Math.max(1, cropInteractionRef.current.zoom || 1);
    const xChange = rect.width ? (deltaX / rect.width) * 100 / zoom : 0;
    const yChange = rect.height ? (deltaY / rect.height) * 100 / zoom : 0;

    setCropX((current) => clampCropValue(current - xChange));
    setCropY((current) => clampCropValue(current - yChange));
  };

  const getPointerDistance = (pointers) => {
    if (pointers.length < 2) return 0;

    const [first, second] = pointers;
    return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
  };

  const handleCropPointerDown = (event) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    cropInteractionRef.current.pointers.set(event.pointerId, {
      clientX: event.clientX,
      clientY: event.clientY,
    });
    cropInteractionRef.current.lastX = event.clientX;
    cropInteractionRef.current.lastY = event.clientY;

    const pointers = Array.from(cropInteractionRef.current.pointers.values());
    cropInteractionRef.current.pinchDistance = getPointerDistance(pointers);
  };

  const handleCropPointerMove = (event) => {
    const interaction = cropInteractionRef.current;

    if (!interaction.pointers.has(event.pointerId)) return;

    interaction.pointers.set(event.pointerId, {
      clientX: event.clientX,
      clientY: event.clientY,
    });

    const pointers = Array.from(interaction.pointers.values());

    if (pointers.length >= 2) {
      const nextDistance = getPointerDistance(pointers);

      if (interaction.pinchDistance > 0 && nextDistance > 0) {
        const scale = nextDistance / interaction.pinchDistance;
        setCropZoom((current) => {
          const nextZoom = Math.min(2.8, Math.max(1, current * scale));
          interaction.zoom = nextZoom;
          return nextZoom;
        });
      }

      interaction.pinchDistance = nextDistance;
      return;
    }

    moveCropPosition(
      event.clientX - interaction.lastX,
      event.clientY - interaction.lastY
    );
    interaction.lastX = event.clientX;
    interaction.lastY = event.clientY;
  };

  const handleCropPointerEnd = (event) => {
    const interaction = cropInteractionRef.current;

    interaction.pointers.delete(event.pointerId);

    const pointers = Array.from(interaction.pointers.values());
    interaction.pinchDistance = getPointerDistance(pointers);

    if (pointers[0]) {
      interaction.lastX = pointers[0].clientX;
      interaction.lastY = pointers[0].clientY;
    }
  };

  const handleCropWheel = (event) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;

    setCropZoom((current) => {
      const nextZoom = Math.min(2.8, Math.max(1, current + direction * 0.08));
      cropInteractionRef.current.zoom = nextZoom;
      return nextZoom;
    });
  };

  const getSiteAssetCropPreset = (assetKey) => {
    const isHeroAsset = assetKey === "hero_before" || assetKey === "hero_after";
    const isInfoAsset = assetKey === "info_image";

    return isHeroAsset || isInfoAsset
      ? {
          title: `${SITE_ASSET_LABELS[assetKey] || "Bild"} zuschneiden`,
          description: isInfoAsset
            ? "Passt zum rechten Bildfeld im Info-Bereich."
            : "Passt zum Vorher/Nachher-Fenster auf der Startseite.",
          aspectWidth: 4,
          aspectHeight: 5,
          outputWidth: 1800,
          outputHeight: 2250,
        }
      : {
          title: `${SITE_ASSET_LABELS[assetKey] || "Portfolio-Titelbild"} zuschneiden`,
          description: "Passt zur Portfolio-Kachel auf der Website.",
          aspectWidth: 3,
          aspectHeight: 4,
          outputWidth: 1800,
          outputHeight: 2400,
        };
  };

  const openCropSession = (files, options) => {
    const validFiles = files.filter((file) => file?.type?.startsWith("image/"));

    if (!validFiles.length) {
      showMessage("Bitte mindestens eine Bilddatei auswählen.", "error");
      return;
    }

    setCropSession({
      files: validFiles,
      index: 0,
      preparedFiles: [],
      ...options,
    });
    setCropZoom(1);
    setCropX(50);
    setCropY(50);
    setCropBusy(false);
    setMessage("");
  };

  const applyPreparedCropFiles = (session, files) => {
    if (session.target === "portfolio") {
      setImageFiles(files);
      setImageFile(files[0] || null);
    }

    if (session.target === "client-gallery") {
      setClientGalleryFiles(files);
      setClientGalleryFile(files[0] || null);
    }

    if (session.target === "site-asset" && session.assetKey) {
      setSiteAssetFiles((current) => ({
        ...current,
        [session.assetKey]: files[0] || null,
      }));
    }

    showMessage(
      files.length === 1
        ? "Bild wurde für den Upload vorbereitet."
        : `${files.length} Bilder wurden für den Upload vorbereitet.`,
      "success"
    );
  };

  const closeCropSession = () => {
    setCropSession(null);
    setCropZoom(1);
    setCropX(50);
    setCropY(50);
    setCropBusy(false);
  };

  const finishCropStep = async ({ useOriginal = false } = {}) => {
    if (!cropSession || !activeCropFile) return;

    setCropBusy(true);
    try {
      const preparedFile = useOriginal
        ? activeCropFile
        : await cropImageFile(activeCropFile, {
            aspect: cropSession.aspectWidth / cropSession.aspectHeight,
            outputWidth: cropSession.outputWidth,
            outputHeight: cropSession.outputHeight,
            zoom: cropZoom,
            xPercent: cropX,
            yPercent: cropY,
          });
      const preparedFiles = [...cropSession.preparedFiles, preparedFile];
      const isLastFile = cropSession.index >= cropSession.files.length - 1;

      if (isLastFile) {
        applyPreparedCropFiles(cropSession, preparedFiles);
        closeCropSession();
        return;
      }

      setCropSession((current) => ({
        ...current,
        index: current.index + 1,
        preparedFiles,
      }));
      setCropZoom(1);
      setCropX(50);
      setCropY(50);
    } catch (error) {
      showMessage(error.message || "Bild konnte nicht vorbereitet werden.", "error");
    } finally {
      setCropBusy(false);
    }
  };

  const uploadImage = async (event) => {
    event.preventDefault();

    if (imageUploading) return;

    const filesToUpload = imageFiles.length ? imageFiles : imageFile ? [imageFile] : [];

    if (!filesToUpload.length) {
      showMessage("Bitte zuerst mindestens ein Bild auswählen.", "error");
      return;
    }

    const form = event.currentTarget;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 180000);

    setImageUploading(true);
    showMessage("Bilder werden vorbereitet und hochgeladen...", "info");

    try {
      const uploadedImages = [];

      for (const file of filesToUpload) {
        const preparedFile = await compressPortfolioFile(file);
        const formData = new FormData();
        formData.append("category", imageCategory);
        formData.append("file", preparedFile);

        const response = await fetch("/api/admin/images", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.error || `${file.name} konnte nicht hochgeladen werden.`
          );
        }

        if (!data.image) {
          throw new Error("Upload war erfolgreich, aber die Bilddaten fehlen.");
        }

        uploadedImages.push(data.image);
      }

      setImages((current) => [...uploadedImages, ...current]);
      setImageDrafts((current) => ({
        ...current,
        ...Object.fromEntries(
          uploadedImages.map((image) => [
            image.id,
            {
              title: image.title || "",
              note: image.note || "",
            },
          ])
        ),
      }));
      setImageFile(null);
      setImageFiles([]);
      setImagePreviewSize(null);
      form.reset();
      showMessage(
        uploadedImages.length === 1
          ? "Bild wurde hochgeladen und ist jetzt in der Galerie."
          : `${uploadedImages.length} Bilder wurden hochgeladen und sind jetzt in der Galerie.`,
        "success"
      );
    } catch (error) {
      showMessage(
        error?.name === "AbortError"
          ? "Upload dauert zu lange. Bitte Internetverbindung prüfen oder Bild verkleinern."
          : error.message || "Bild konnte nicht hochgeladen werden.",
        "error"
      );
    } finally {
      window.clearTimeout(timeoutId);
      setImageUploading(false);
    }
  };

  const updateClientGalleryForm = (key, value) => {
    setClientGalleryForm((current) => ({
      ...current,
      [key]: value,
    }));
    setMessage("");
  };

  const generateClientGalleryCode = () => {
    updateClientGalleryForm(
      "access_code",
      `GAL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    );
  };

  const createClientGallery = async (event) => {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/admin/client-galleries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientGalleryForm),
    });
    const data = await response.json();

    if (!response.ok) {
      showMessage(
        data.error || "Kundengalerie konnte nicht erstellt werden.",
        "error"
      );
      return;
    }

    setClientGalleries((current) => [data.gallery, ...current]);
    setActiveClientGalleryId(data.gallery.id);
    setClientGalleryForm(DEFAULT_CLIENT_GALLERY_FORM);
    setShowClientGalleryForm(false);
    showMessage("Kundengalerie wurde erstellt.", "success");
  };

  const searchCustomerAccounts = async (event) => {
    event.preventDefault();

    const query = customerAccountSearch.trim().toLowerCase();

    if (!query) {
      setCustomerAccounts([]);
      setCustomerAccountSearched(false);
      showMessage("Bitte eine E-Mail-Adresse für die Kundensuche eingeben.", "error");
      return;
    }

    setCustomerAccountLoading(true);
    setCustomerAccountSearched(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/customer-accounts?email=${encodeURIComponent(query)}`,
        { cache: "no-store" }
      );
      const data = await response.json();

      if (!response.ok) {
        showMessage(
          data.error || "Kundenkonto konnte nicht gesucht werden.",
          "error"
        );
        setCustomerAccounts([]);
        return;
      }

      const accounts = data.accounts || [];
      setCustomerAccounts(accounts);
      setSelectedCustomerAccount(accounts[0] || null);
      showMessage(
        accounts.length === 1
          ? "1 Kundenkonto gefunden."
          : `${accounts.length} Kundenkonten gefunden.`,
        "success"
      );
    } catch (error) {
      showMessage(
        error.message || "Kundenkonto konnte nicht gesucht werden.",
        "error"
      );
      setCustomerAccounts([]);
    } finally {
      setCustomerAccountLoading(false);
    }
  };

  const focusClientAccountEmail = (account) => {
    setClientGallerySearch(account.email);
    setClientGalleryStatusFilter("all");

    const matchingGallery = clientGalleries.find(
      (gallery) =>
        String(gallery.client_email || "").trim().toLowerCase() === account.email
    );

    if (matchingGallery) {
      setActiveClientGalleryId(matchingGallery.id);
      showMessage("Passende Galerie wurde geöffnet.", "success");
      return;
    }

    showMessage("Keine Galerie mit dieser E-Mail gefunden.", "info");
  };

  const customerAccountGalleries = selectedCustomerAccount
    ? clientGalleries.filter(
        (gallery) =>
          String(gallery.client_email || "").trim().toLowerCase() ===
          selectedCustomerAccount.email
      )
    : [];

  const prepareGalleryForAccount = (account) => {
    setClientGalleryForm((current) => ({
      ...current,
      client_name: current.client_name || account.name || "",
      client_email: account.email,
    }));
    setShowClientGalleryForm(true);
    showMessage("E-Mail wurde ins Galerie-Formular übernommen.", "success");
  };

  const updateClientGallery = async (gallery, updates, successText) => {
    const previousGalleries = clientGalleries;

    setBusyClientGalleryId(gallery.id);
    setMessage("");
    setClientGalleries((current) =>
      current.map((item) =>
        item.id === gallery.id
          ? {
              ...item,
              ...updates,
              ...(updates.client_email !== undefined
                ? {
                    account_exists: false,
                    account_status: updates.client_email
                      ? "email_set"
                      : "missing_email",
                  }
                : {}),
            }
          : item
      )
    );

    try {
      const response = await fetch("/api/admin/client-galleries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: gallery.id, ...updates }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const details = String(data.details || "");
        const missingWorkflowField = [
          "internal_note",
          "client_email",
          "favorites_reviewed",
          "finals_exported",
          "archive_prepared",
          "archive_path",
          "archive_size",
          "archive_created",
          "client_informed",
          "cover_image_id",
          "welcome_message",
        ].some((field) => details.includes(field));

        setClientGalleries(previousGalleries);
        showMessage(
          missingWorkflowField
            ? "Bitte die aktualisierte supabase-client-galleries.sql in Supabase ausführen. Wichtig: Die letzte Zeile lädt den Supabase-Cache neu."
            : data.error || "Kundengalerie konnte nicht gespeichert werden.",
          "error"
        );
        return;
      }

      setClientGalleries((current) =>
        current.map((item) =>
          item.id === gallery.id
            ? {
                ...item,
                ...updates,
                ...(data.gallery || {}),
                ...(updates.client_email !== undefined
                  ? {
                      account_exists: false,
                      account_status: updates.client_email
                        ? "email_set"
                        : "missing_email",
                    }
                  : {}),
                images: item.images || [],
                favorites: item.favorites || [],
                image_count: item.image_count || 0,
                favorite_count: item.favorite_count || 0,
              }
            : item
        )
      );
      showMessage(successText || "Kundengalerie wurde gespeichert.", "success");
    } catch (error) {
      setClientGalleries(previousGalleries);
      showMessage(
        error.message || "Kundengalerie konnte nicht gespeichert werden.",
        "error"
      );
    } finally {
      setBusyClientGalleryId(null);
    }
  };

  const updateClientGalleryDraft = (updates) => {
    if (!activeClientGallery) return;

    setClientGalleries((current) =>
      current.map((gallery) =>
        gallery.id === activeClientGallery.id
          ? {
              ...gallery,
              ...updates,
            }
          : gallery
      )
    );
  };

  const prepareClientGalleryArchive = async (gallery) => {
    const previousGalleries = clientGalleries;

    setBusyClientGalleryId(gallery.id);
    setMessage("");
    showMessage("ZIP wird erstellt. Das kann je nach Bildanzahl kurz dauern.", "info");

    try {
      const response = await fetch("/api/admin/client-galleries/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: gallery.id }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const details = String(data.details || "");
        const missingArchiveField = [
          "archive_path",
          "archive_size",
          "archive_created",
          "schema cache",
        ].some((field) => details.toLowerCase().includes(field));

        showMessage(
          missingArchiveField
            ? `Bitte die aktualisierte supabase-client-galleries.sql in Supabase ausführen. Danach nochmal ZIP erstellen.${details ? ` Details: ${details}` : ""}`
            : `${data.error || "ZIP konnte nicht erstellt werden."}${details ? ` Details: ${details}` : ""}`,
          "error"
        );
        return;
      }

      setClientGalleries((current) =>
        current.map((item) =>
          item.id === gallery.id
            ? {
                ...item,
                ...(data.gallery || {}),
                images: item.images || [],
                favorites: item.favorites || [],
                image_count: item.image_count || 0,
                favorite_count: item.favorite_count || 0,
              }
            : item
        )
      );
      showMessage("Galerie wurde abgeschlossen und als ZIP vorbereitet.", "success");
    } catch (error) {
      setClientGalleries(previousGalleries);
      showMessage(error.message || "ZIP konnte nicht erstellt werden.", "error");
    } finally {
      setBusyClientGalleryId(null);
    }
  };

  const setClientGalleryCover = async (gallery, image) => {
    await updateClientGallery(
      gallery,
      { cover_image_id: image.id },
      "Coverbild wurde gespeichert."
    );
  };

  const deleteClientGallery = (gallery) => {
    requestConfirmation({
      title: `Kundengalerie "${gallery.title}" löschen?`,
      description:
        "Die Galerie wird aus dem Admin entfernt. Kundenbilder, Favoriten, QR-Zugriff und die Galerie-Verknüpfung werden gelöscht. Das Kundenkonto selbst bleibt bestehen. Nutze das nur, wenn das Projekt wirklich weg kann.",
      confirmLabel: "Galerie löschen",
      onConfirm: async () => {
        setBusyClientGalleryId(gallery.id);
        setMessage("");

        const response = await fetch("/api/admin/client-galleries", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: gallery.id }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          showMessage(
            data.error || "Kundengalerie konnte nicht gelöscht werden.",
            "error"
          );
          setBusyClientGalleryId(null);
          return;
        }

        const nextGalleries = clientGalleries.filter(
          (item) => item.id !== gallery.id
        );
        setClientGalleries(nextGalleries);
        setActiveClientGalleryId(nextGalleries[0]?.id || "");
        showMessage("Kundengalerie wurde gelöscht.", "success");
        setBusyClientGalleryId(null);
      },
    });
  };

  const deleteClientGalleryImage = (gallery, image) => {
    requestConfirmation({
      title: "Kundenbild löschen?",
      description:
        "Das Bild wird aus dieser Kundengalerie entfernt. Falls es als Cover oder Favorit genutzt wurde, werden diese Zuordnungen ebenfalls bereinigt. Andere Galerien bleiben unberührt.",
      confirmLabel: "Bild löschen",
      onConfirm: async () => {
        setBusyClientImageId(image.id);
        setMessage("");

        const response = await fetch("/api/admin/client-gallery-images", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: image.id }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          showMessage(
            data.error || "Kundenbild konnte nicht gelöscht werden.",
            "error"
          );
          setBusyClientImageId(null);
          return;
        }

        setClientGalleries((current) =>
          current.map((item) => {
            if (item.id !== gallery.id) return item;

            const nextImages = (item.images || []).filter(
              (entry) => entry.id !== image.id
            );
            const nextFavorites = (item.favorites || []).filter(
              (favorite) => favorite.image_id !== image.id
            );

            return {
              ...item,
              images: nextImages,
              favorites: nextFavorites,
              cover_image_id:
                item.cover_image_id === image.id ? null : item.cover_image_id,
              cover_url:
                item.cover_image_id === image.id
                  ? nextImages[0]?.url || ""
                  : item.cover_url,
              image_count: nextImages.length,
              favorite_count: nextFavorites.length,
            };
          })
        );
        showMessage("Kundenbild wurde gelöscht.", "success");
        setBusyClientImageId(null);
      },
    });
  };

  const uploadClientGalleryImage = async (event) => {
    event.preventDefault();

    if (clientGalleryUploading) return;

    if (!activeClientGallery) {
      showMessage("Bitte zuerst eine Kundengalerie erstellen.", "error");
      return;
    }

    const filesToUpload = clientGalleryFiles.length
      ? clientGalleryFiles
      : clientGalleryFile
        ? [clientGalleryFile]
        : [];

    if (!filesToUpload.length) {
      showMessage("Bitte zuerst mindestens ein Kundenbild auswählen.", "error");
      return;
    }

    const form = event.currentTarget;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 60000);

    setClientGalleryUploading(true);
    setMessage("");

    try {
      const uploadedImages = [];

      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append("galleryId", activeClientGallery.id);
        formData.append("file", file);

        const response = await fetch("/api/admin/client-gallery-images", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const details = data.details ? ` Details: ${data.details}` : "";

          throw new Error(
            `${data.error || `${file.name} konnte nicht hochgeladen werden.`}${details}`
          );
        }

        uploadedImages.push(data.image);
      }

      setClientGalleries((current) =>
        current.map((gallery) => {
          if (gallery.id !== activeClientGallery.id) return gallery;

          const nextImages = [...uploadedImages, ...(gallery.images || [])];

          return {
            ...gallery,
            images: nextImages,
            image_count: nextImages.length,
          };
        })
      );
      setClientGalleryFile(null);
      setClientGalleryFiles([]);
      form.reset();
      showMessage(
        uploadedImages.length === 1
          ? "Kundenbild wurde hochgeladen."
          : `${uploadedImages.length} Kundenbilder wurden hochgeladen.`,
        "success"
      );
    } catch (error) {
      showMessage(
        error?.name === "AbortError"
          ? "Upload dauert zu lange. Bitte Bild verkleinern und erneut versuchen."
          : error.message || "Kundenbild konnte nicht hochgeladen werden.",
        "error"
      );
    } finally {
      window.clearTimeout(timeoutId);
      setClientGalleryUploading(false);
    }
  };

  const copyClientFavoriteList = () => {
    if (!activeClientGallery || activeClientFavoriteImages.length === 0) {
      showMessage("Noch keine Favoriten in dieser Kundengalerie.", "error");
      return;
    }

    const favoriteList = [
      `Favoriten: ${activeClientGallery.title}`,
      activeClientGallery.client_name
        ? `Kunde: ${activeClientGallery.client_name}`
        : "",
      `Galerie-Code: ${activeClientGallery.access_code}`,
      "",
      ...activeClientFavoriteImages.map(
        (image, index) =>
          `${index + 1}. ${image.filename || "Kundenbild"} - ${image.url}`
      ),
    ]
      .filter(Boolean)
      .join("\n");

    copyText(favoriteList, "Favoritenliste wurde kopiert.");
  };

  const copyClientGalleryInvite = () => {
    if (!activeClientGallery) {
      showMessage("Bitte zuerst eine Kundengalerie auswählen.", "error");
      return;
    }

    const customerName = activeClientGallery.client_name?.trim();
    const origin = publicOrigin || window.location.origin;
    const galleryUrl = `${origin}/kunden?code=${encodeURIComponent(
      activeClientGallery.access_code
    )}`;
    const accountUrl = `${origin}/konto`;
    const accountHint = activeClientGallery.client_email
      ? "Wenn du dir ein Kundenkonto mit dieser E-Mail erstellst oder dich damit einloggst, wird die Galerie automatisch dort angezeigt."
      : "Wenn du nach dem Öffnen ein Kundenkonto erstellst oder dich einloggst, kann die Galerie automatisch mit deinem Konto verknüpft werden.";
    const inviteText = [
      `Hallo${customerName ? ` ${customerName}` : ""},`,
      "",
      `deine Galerie "${activeClientGallery.title}" ist bereit.`,
      "",
      `Direktlink: ${galleryUrl}`,
      `Galerie-Code: ${activeClientGallery.access_code}`,
      `Kundenkonto: ${accountUrl}`,
      "",
      accountHint,
      "",
      activeClientGallery.downloads_enabled
        ? "Downloads sind freigeschaltet, du kannst deine Bilder direkt herunterladen."
        : "Du kannst deine Favoriten markieren, damit ich die Auswahl sehen kann.",
      "",
      "Liebe Grüße",
      "Felix",
    ]
      .filter((line, index, lines) => line || lines[index - 1])
      .join("\n");

    copyText(inviteText, "Kunden-Einladung wurde kopiert.");
  };

  const uploadSiteAsset = async (assetKey) => {
    const file = siteAssetFiles[assetKey];

    if (!file) {
      showMessage("Bitte zuerst ein Bild auswählen.", "error");
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

  const updateSettingsDraft = (key, value) => {
    setSettingsDraft((current) => ({
      ...current,
      [key]: value,
    }));
    setMessage("");
  };

  const togglePortfolioArchive = (categoryKey) => {
    setSettingsDraft((current) => {
      const archived = new Set(
        parseArchivedPortfolioKeys(current.portfolio_archived_keys)
      );

      if (archived.has(categoryKey)) {
        archived.delete(categoryKey);
      } else {
        archived.add(categoryKey);
      }

      return {
        ...current,
        portfolio_archived_keys: Array.from(archived).join(","),
      };
    });
    setMessage("");
  };

  const savePortfolioArchiveSettings = async () => {
    setPortfolioVisibilitySaving(true);
    setMessage("");

    const response = await fetch("/api/admin/site-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        settings: {
          portfolio_archived_keys: settingsDraft.portfolio_archived_keys,
        },
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      showMessage(
        data.error || "Portfolio-Archiv konnte nicht gespeichert werden.",
        "error"
      );
      setPortfolioVisibilitySaving(false);
      return;
    }

    const nextSettings = {
      ...siteSettings,
      ...(data.settings || {}),
      portfolio_archived_keys: settingsDraft.portfolio_archived_keys,
    };

    setSiteSettings(nextSettings);
    setSettingsDraft((current) => ({
      ...current,
      portfolio_archived_keys: nextSettings.portfolio_archived_keys,
    }));
    showMessage("Portfolio-Archiv wurde gespeichert.", "success");
    setPortfolioVisibilitySaving(false);
  };

  const updateImageDraft = (imageId, key, value) => {
    setImageDrafts((current) => ({
      ...current,
      [imageId]: {
        title: "",
        note: "",
        ...(current[imageId] || {}),
        [key]: value,
      },
    }));
    setMessage("");
  };

  const saveImageDetails = async (image) => {
    const draft = imageDrafts[image.id] || {
      title: image.title || "",
      note: image.note || "",
    };

    setBusyImageId(image.id);
    setMessage("");

    const response = await fetch("/api/admin/images", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: image.id,
        title: draft.title,
        note: draft.note,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      showMessage(data.error || "Bilddetails konnten nicht gespeichert werden.", "error");
      setBusyImageId(null);
      return;
    }

    setImages((current) =>
      current.map((item) => (item.id === image.id ? data.image : item))
    );
    setSelectedImage((current) =>
      current?.id === image.id ? data.image : current
    );
    setImageDrafts((current) => ({
      ...current,
      [image.id]: {
        title: data.image.title || "",
        note: data.image.note || "",
      },
    }));
    showMessage("Bilddetails wurden gespeichert.", "success");
    setBusyImageId(null);
  };

  const saveSiteSettings = async (event) => {
    event.preventDefault();
    setSettingsSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/site-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: settingsDraft }),
    });
    const data = await response.json();

    if (!response.ok) {
      showMessage(
        data.error || "Kontaktinfos konnten nicht gespeichert werden.",
        "error"
      );
      setSettingsSaving(false);
      return;
    }

    const nextSettings = {
      ...DEFAULT_SITE_SETTINGS,
      ...settingsDraft,
      ...(data.settings || {}),
    };

    setSiteSettings(nextSettings);
    setSettingsDraft(nextSettings);
    showMessage("Kontaktinfos wurden gespeichert.", "success");
    setSettingsSaving(false);
  };

  const toggleMaintenanceMode = async () => {
    const nextValue =
      String(siteSettings.maintenance_mode) === "true" ? "false" : "true";

    setMaintenanceSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/site-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        settings: {
          maintenance_mode: nextValue,
        },
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      showMessage(
        data.error || "Wartungsmodus konnte nicht gespeichert werden.",
        "error"
      );
      setMaintenanceSaving(false);
      return;
    }

    const nextSettings = {
      ...siteSettings,
      ...(data.settings || {}),
      maintenance_mode: nextValue,
    };

    setSiteSettings(nextSettings);
    setSettingsDraft((current) => ({
      ...current,
      maintenance_mode: nextValue,
    }));
    showMessage(
      nextValue === "true"
        ? "Wartungsmodus ist aktiv."
        : "Wartungsmodus ist aus.",
      "success"
    );
    setMaintenanceSaving(false);
  };

  const deleteReview = (review) => {
    requestConfirmation({
      title: `Bewertung von ${review.name} löschen?`,
      description:
        "Die Bewertung wird dauerhaft aus der Moderation und von der öffentlichen Website entfernt. Das Kundenkonto bleibt bestehen.",
      confirmLabel: "Bewertung löschen",
      onConfirm: async () => {
        setBusyId(review.id);
        setMessage("");

        const response = await fetch("/api/admin/reviews", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: review.id }),
        });
        const data = await response.json();

        if (!response.ok) {
          showMessage(
            data.error || "Bewertung konnte nicht gelöscht werden.",
            "error"
          );
          setBusyId(null);
          return;
        }

        setReviews((current) => current.filter((item) => item.id !== review.id));
        showMessage("Bewertung wurde gelöscht.", "success");
        setBusyId(null);
      },
    });
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
        data.error || "Bewertungsstatus konnte nicht geändert werden.",
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

  const setReviewAvatar = async (review, avatarUrl) => {
    setBusyId(review.id);
    setMessage("");

    const response = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: review.id,
        avatar_url: avatarUrl || null,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      showMessage(
        data.error || "Avatar konnte nicht gespeichert werden.",
        "error"
      );
      setBusyId(null);
      return;
    }

    setReviews((current) =>
      current.map((item) => (item.id === review.id ? data.review : item))
    );
    showMessage("Bewertungs-Avatar wurde gespeichert.", "success");
    setBusyId(null);
  };

  const deleteImage = (image) => {
    requestConfirmation({
      title: "Portfolio-Bild löschen?",
      description:
        "Das Bild wird aus der öffentlichen Portfolio-Galerie entfernt. Titelbilder und Kundengalerien bleiben davon getrennt.",
      confirmLabel: "Bild löschen",
      onConfirm: async () => {
        setBusyImageId(image.id);
        setMessage("");

        const response = await fetch("/api/admin/images", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: image.id }),
        });
        const data = await response.json();

        if (!response.ok) {
          showMessage(data.error || "Bild konnte nicht gelöscht werden.", "error");
          setBusyImageId(null);
          return;
        }

        setImages((current) => current.filter((item) => item.id !== image.id));
        setSelectedImageIds((current) => current.filter((id) => id !== image.id));
        showMessage("Bild wurde aus der Galerie gelöscht.", "success");
        setBusyImageId(null);
      },
    });
  };

  const toggleImageSelection = (imageId) => {
    setSelectedImageIds((current) =>
      current.includes(imageId)
        ? current.filter((id) => id !== imageId)
        : [...current, imageId]
    );
  };

  const togglePortfolioCategory = (categoryKey) => {
    setCollapsedPortfolioCategories((current) => ({
      ...current,
      [categoryKey]: !current[categoryKey],
    }));
  };

  const toggleVisibleImageSelection = () => {
    setSelectedImageIds((current) => {
      if (allVisibleImagesSelected) {
        return current.filter((id) => !visibleImageIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleImageIds]));
    });
  };

  const deleteSelectedImages = () => {
    if (selectedImages.length === 0) return;

    requestConfirmation({
      title: `${selectedImages.length} Portfolio-Bilder löschen?`,
      description:
        "Alle aktuell ausgewählten Bilder werden aus der öffentlichen Portfolio-Galerie entfernt.",
      confirmLabel: "Auswahl löschen",
      onConfirm: async () => {
        setBusyImageId("bulk-delete");
        setMessage("");

        const responses = await Promise.all(
          selectedImages.map((image) =>
            fetch("/api/admin/images", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: image.id }),
            })
          )
        );
        const failedResponse = responses.find((response) => !response.ok);

        if (failedResponse) {
          const data = await failedResponse.json();
          showMessage(
            data.error || "Mindestens ein Bild konnte nicht gelöscht werden.",
            "error"
          );
          setBusyImageId(null);
          await loadImages();
          return;
        }

        const deletedIds = selectedImages.map((image) => image.id);
        setImages((current) =>
          current.filter((image) => !deletedIds.includes(image.id))
        );
        setSelectedImageIds([]);
        showMessage("Ausgewählte Bilder wurden gelöscht.", "success");
        setBusyImageId(null);
      },
    });
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
    <main
      className={`min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_26%),linear-gradient(135deg,#070707,#111113,#1f2023)] px-3 py-4 text-white sm:px-5 sm:py-6 ${
        authenticated ? "xl:h-screen xl:overflow-hidden" : ""
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] flex-col xl:h-full">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl backdrop-blur-xl sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:bg-white/15"
              >
                <ArrowLeft className="h-4 w-4" />
                Zur Website
              </Link>
              <h1 className="text-2xl font-black md:text-3xl">
                Admin Bereich
              </h1>
            </div>

            {authenticated && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={refreshDashboard}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
                >
                  <RefreshCw className="h-4 w-4" />
                  Neu laden
                </button>
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
                >
                  <ExternalLink className="h-4 w-4" />
                  Live
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
            ADMIN_PASSWORD oder ADMIN_ACCESS_CODE fehlt, oder ADMIN_SESSION_SECRET ist kürzer als 32 Zeichen.
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

            <label className="mt-5 block text-sm font-semibold text-neutral-300">
              Admin Code
            </label>
            <input
              type="password"
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-yellow-400"
              placeholder="Code eingeben"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-2xl bg-white px-5 py-3 font-bold text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
            >
              {loading ? "Prüfe..." : "Einloggen"}
            </button>
          </form>
        ) : (
          <section className="mt-4 grid gap-3 xl:min-h-0 xl:flex-1 xl:overflow-hidden xl:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="xl:min-h-0 xl:overflow-y-auto xl:pr-1">
              <nav className="rounded-[1.25rem] border border-white/10 bg-black/25 p-2">
                <div className="grid gap-2 xl:hidden">
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
                      Bereich
                    </span>
                    <select
                      value={activeTab}
                      onChange={(event) => setActiveTab(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-black text-neutral-950 outline-none focus:border-yellow-400"
                    >
                      {tabGroups.map((group) => (
                        <optgroup key={group.title} label={group.title}>
                          {group.tabs.map((tab) => (
                            <option key={tab.value} value={tab.value}>
                              {tab.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </label>

                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      {
                        label: "Kunden",
                        icon: Users,
                        tab: "clients",
                      },
                      {
                        label: "Bewertungen",
                        icon: MessageSquare,
                        tab: "reviews",
                      },
                      {
                        label: "Portfolio",
                        icon: Images,
                        tab: "portfolio",
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = activeTab === item.tab;

                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            setActiveTab(item.tab);
                            if (item.tab === "reviews") setReviewFilter("pending");
                          }}
                          className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-center text-xs font-black transition ${
                            active
                              ? "border-white bg-white text-neutral-950"
                              : "border-white/10 bg-white/[0.055] text-neutral-300 hover:bg-white/10"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="hidden xl:block">
                <div className="grid grid-cols-3 gap-1.5 p-1.5">
                  {[
                    {
                      label: "Kunden",
                      value: clientGalleries.length,
                      tab: "clients",
                    },
                    {
                      label: "Offen",
                      value: pendingReviews.length,
                      tab: "reviews",
                    },
                    {
                      label: "Bilder",
                      value: images.length,
                      tab: "portfolio",
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.tab);
                        if (item.tab === "reviews") setReviewFilter("pending");
                      }}
                      className="rounded-xl border border-white/10 bg-white/[0.055] px-2 py-2.5 text-center transition hover:bg-white/10"
                    >
                      <span className="block text-lg font-black">
                        {item.value}
                      </span>
                      <span className="mt-1 block truncate text-[11px] font-bold text-neutral-500">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>

                {tabGroups.map((group) => (
                  <div key={group.title} className="mt-2">
                    <div className="px-3 py-1.5">
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
                        {group.title}
                      </p>
                    </div>
                    <div className="grid gap-1">
                      {group.tabs.map((tab) => {
                        const Icon = tab.icon;

                        return (
                          <button
                            key={tab.value}
                            type="button"
                            onClick={() => setActiveTab(tab.value)}
                            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition ${
                              activeTab === tab.value
                                ? "bg-white text-neutral-950"
                                : "text-neutral-300 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                activeTab === tab.value
                                  ? "bg-neutral-950 text-white"
                                  : "bg-white/10"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
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
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                </div>
              </nav>
            </aside>

            <div className="min-w-0 rounded-[1.25rem] border border-white/10 bg-white/[0.045] p-3 shadow-xl backdrop-blur-xl sm:rounded-[1.5rem] sm:p-4 md:p-5 xl:min-h-0 xl:overflow-y-auto">
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 xl:hidden">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  {React.createElement(activeTabDetails.icon, {
                    className: "h-5 w-5",
                  })}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-black">
                    {activeTabDetails.label}
                  </span>
                  <span className="block truncate text-xs text-neutral-500">
                    {activeTabDetails.description}
                  </span>
                </span>
              </div>

            {activeTab === "dashboard" && (
              <div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-neutral-400">
                      Admin Start
                    </p>
                    <h2 className="mt-3 text-3xl font-black">
                      Was ist gerade wichtig?
                    </h2>
                  </div>

                  <button
                    onClick={refreshDashboard}
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Daten aktualisieren
                  </button>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("reviews");
                      setReviewFilter("pending");
                    }}
                    className="rounded-[1.5rem] border border-yellow-400/20 bg-yellow-400/10 p-6 text-left transition hover:-translate-y-1 hover:bg-yellow-400/15"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400/15">
                      <Clock className="h-5 w-5 text-yellow-100" />
                    </div>
                    <p className="mt-5 text-3xl font-black">
                      {pendingReviews.length}
                    </p>
                    <h3 className="mt-2 text-lg font-black">
                      Offene Bewertungen
                    </h3>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("portfolio")}
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6 text-left transition hover:-translate-y-1 hover:bg-white/[0.12]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                      <Images className="h-5 w-5" />
                    </div>
                    <p className="mt-5 text-3xl font-black">{images.length}</p>
                    <h3 className="mt-2 text-lg font-black">
                      Galerie-Bilder
                    </h3>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("covers")}
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6 text-left transition hover:-translate-y-1 hover:bg-white/[0.12]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <p className="mt-5 text-3xl font-black">
                      {SITE_ASSET_GROUPS.flatMap((group) => group.assets).length -
                        missingCoverAssets.length}
                    </p>
                    <h3 className="mt-2 text-lg font-black">Titelbilder</h3>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("clients")}
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6 text-left transition hover:-translate-y-1 hover:bg-white/[0.12]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                      <Users className="h-5 w-5" />
                    </div>
                    <p className="mt-5 text-3xl font-black">
                      {clientGalleries.length}
                    </p>
                    <h3 className="mt-2 text-lg font-black">
                      Kundengalerien
                    </h3>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("contact")}
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6 text-left transition hover:-translate-y-1 hover:bg-white/[0.12]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                      <Mail className="h-5 w-5" />
                    </div>
                    <p className="mt-5 text-lg font-black">
                      {siteSettings.contact_email}
                    </p>
                    <h3 className="mt-2 text-lg font-black">Kontaktinfos</h3>
                  </button>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab("texts")}
                    className="flex w-full flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6 text-left transition hover:-translate-y-1 hover:bg-white/[0.12] md:flex-row md:items-center md:justify-between"
                  >
                    <span>
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                        <Type className="h-5 w-5" />
                      </span>
                      <span className="mt-4 block text-xl font-black">
                        Website-Texte bearbeiten
                      </span>
                    </span>
                    <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-neutral-950">
                      Öffnen
                    </span>
                  </button>
                </div>

                <section className="hidden">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">
                        Kundenprojekte
                      </p>
                      <h3 className="mt-2 text-2xl font-black">
                        Projekt-Pipeline
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("clients")}
                      className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      <Users className="h-4 w-4" />
                      Kunden öffnen
                    </button>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {clientProjectPipeline.map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setActiveTab("clients")}
                          className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-left transition hover:bg-white/10"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                              <Icon className="h-5 w-5" />
                            </div>
                            <span className="text-3xl font-black">
                              {item.value}
                            </span>
                          </div>
                          <p className="mt-4 font-black">{item.label}</p>
                          <p className="mt-1 text-sm text-neutral-500">
                            {item.helper}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 grid gap-3">
                    {clientProjectFocus.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-neutral-400">
                        Keine offenen Kundenprojekte.
                      </div>
                    ) : (
                      clientProjectFocus.map((gallery) => {
                        const step = getClientProjectStep(gallery);
                        const accountState = getClientAccountState(gallery);

                        return (
                          <button
                            key={`project-focus-${gallery.id}`}
                            type="button"
                            onClick={() => {
                              setActiveClientGalleryId(gallery.id);
                              setActiveTab("clients");
                            }}
                            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-left transition hover:bg-white/10 md:flex-row md:items-center md:justify-between"
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-black">
                                {gallery.title}
                              </span>
                              <span className="mt-1 block text-sm text-neutral-500">
                                {gallery.client_name || "Ohne Kundennamen"} ·{" "}
                                {gallery.image_count || 0} Bilder ·{" "}
                                {gallery.favorite_count || 0} Favoriten
                              </span>
                            </span>
                            <span className="flex flex-wrap gap-2 md:justify-end">
                              <span
                                className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${step.tone}`}
                              >
                                {step.label}
                              </span>
                              <span
                                className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${accountState.tone}`}
                              >
                                {accountState.label}
                              </span>
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </section>

                <div className="hidden">
                  <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-black">
                          Portfolio nach Kategorien
                        </h3>
                        <p className="mt-2 text-sm text-neutral-400">
                          So siehst du sofort, wo noch Bilder fehlen.
                        </p>
                      </div>
                      <Images className="h-6 w-6 text-neutral-400" />
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {imagesByCategory.map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => {
                            setImageCategory(category.value);
                            setActiveTab("portfolio");
                          }}
                          className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:bg-white/10"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-bold">{category.label}</p>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-neutral-950">
                              {category.images.length}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-neutral-500">
                            Anklicken zum Bearbeiten
                          </p>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-black">Checkliste</h3>
                        <p className="mt-2 text-sm text-neutral-400">
                          Kleine Kontrolle vor dem Veröffentlichen.
                        </p>
                      </div>
                      <ShieldCheck className="h-6 w-6 text-neutral-400" />
                    </div>

                    <div className="mt-5 space-y-3">
                      {[
                        {
                          done: images.length > 0,
                          label: "Mindestens ein Portfolio-Bild ist online",
                        },
                        {
                          done: pendingReviews.length === 0,
                          label: "Keine offenen Bewertungen",
                        },
                        {
                          done: missingCoverAssets.length === 0,
                          label: "Alle eigenen Titelbilder gesetzt",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4"
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                              item.done
                                ? "bg-emerald-400 text-neutral-950"
                                : "bg-yellow-400 text-neutral-950"
                            }`}
                          >
                            {item.done ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <Clock className="h-5 w-5" />
                            )}
                          </span>
                          <p className="text-sm font-semibold text-neutral-200">
                            {item.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] xl:items-center">
                    <div className="min-w-0">
                      <h3 className="text-xl font-black">Schnellzugriff</h3>
                      <p className="mt-2 text-sm text-neutral-400">
                        Direkt testen, ob deine Änderungen vorne sichtbar sind.
                      </p>
                    </div>
                    <div className="grid min-w-0 gap-2 sm:grid-cols-3">
                      <a
                        href="/#portfolio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-w-0 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center text-sm font-bold leading-5 transition hover:bg-white/15"
                      >
                        <ExternalLink className="h-4 w-4 shrink-0" />
                        <span className="min-w-0 break-words">
                          Portfolio ansehen
                        </span>
                      </a>
                      <a
                        href="/#bewertung"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-w-0 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center text-sm font-bold leading-5 transition hover:bg-white/15"
                      >
                        <ExternalLink className="h-4 w-4 shrink-0" />
                        <span className="min-w-0 break-words">
                          Bewertungen ansehen
                        </span>
                      </a>
                      <a
                        href="/kunden"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-w-0 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center text-sm font-bold leading-5 transition hover:bg-white/15"
                      >
                        <ExternalLink className="h-4 w-4 shrink-0" />
                        <span className="min-w-0 break-words">
                          Kundengalerie testen
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                      Galerie. Die Portfolio-Titelbilder bleiben unverändert.
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
                      multiple
                      onChange={(event) => {
                        const selectedFiles = Array.from(
                          event.target.files || []
                        );
                        openCropSession(selectedFiles, {
                          target: "portfolio",
                          title: "Portfolio-Bilder zuschneiden",
                          description:
                            "Passe das Bild an die Portfolio-Kachel an. Danach bleibt die bestehende Upload-Komprimierung aktiv.",
                          aspectWidth: 3,
                          aspectHeight: 4,
                          outputWidth: 1800,
                          outputHeight: 2400,
                        });
                        event.target.value = "";
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
                    {imageUploading ? "Lädt hoch..." : "Hochladen"}
                  </button>

                  {imagePreview && (
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 md:col-span-3">
                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_230px] lg:items-start">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
                            Portfolio-Zuschnitt
                          </p>
                          <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]">
                            <img
                              src={imagePreview}
                              alt="Vorschau im Portfolio-Zuschnitt"
                              className="aspect-[3/4] w-full object-cover"
                            />
                          </div>
                          <p className="mt-2 text-xs leading-5 text-neutral-500">
                            So wird das Bild in der Galerie-Kachel angezeigt.
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
                            Komplettes Bild
                          </p>
                          <div className="mt-3 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]">
                            <img
                              src={imagePreview}
                              alt="Vorschau des kompletten Bildes"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <p className="mt-2 text-xs leading-5 text-neutral-500">
                            Hier siehst du, wie viel Rand beim Zuschnitt bleibt.
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                          <p className="text-sm font-bold text-white">
                            Ausgewähltes Bild
                          </p>
                          <p className="mt-2 break-all text-sm text-neutral-300">
                            {imageFile?.name}
                          </p>
                          {imageFiles.length > 1 && (
                            <p className="mt-2 rounded-full bg-yellow-400/15 px-3 py-1 text-xs font-bold text-yellow-100">
                              {imageFiles.length} Bilder ausgewählt. Vorschau
                              zeigt das erste Bild.
                            </p>
                          )}
                          <div className="mt-4 space-y-2 text-xs leading-5 text-neutral-400">
                            <p>
                              Dateigröße:{" "}
                              {imageFile
                                ? `${(imageFile.size / 1024 / 1024).toFixed(2)} MB`
                                : "-"}
                            </p>
                            <p>
                              Pixel:{" "}
                              {imagePreviewSize
                                ? `${imagePreviewSize.width} x ${imagePreviewSize.height}px`
                                : "wird gelesen..."}
                            </p>
                            <p>Empfohlen: Hochformat 3:4 oder genug Rand.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </form>

                <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <label className="relative block flex-1">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="search"
                        value={imageSearch}
                        onChange={(event) => setImageSearch(event.target.value)}
                        placeholder="Bild suchen nach Name, Notiz, Kategorie..."
                        className="w-full rounded-2xl border border-white/10 bg-white px-11 py-3 text-neutral-950 outline-none focus:border-yellow-400"
                      />
                    </label>

                    <label className="block min-w-[12rem]">
                      <span className="sr-only">Sortierung</span>
                      <select
                        value={imageSortMode}
                        onChange={(event) => setImageSortMode(event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-yellow-400"
                      >
                        <option value="manual">Eigene Reihenfolge</option>
                        <option value="newest">Neueste zuerst</option>
                        <option value="oldest">Älteste zuerst</option>
                      </select>
                    </label>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setImageCategoryFilter("all")}
                        className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                          imageCategoryFilter === "all"
                            ? "border-yellow-400 bg-yellow-400 text-black"
                            : "border-white/10 bg-white/10 text-neutral-200 hover:bg-white/15"
                        }`}
                      >
                        Alle
                      </button>
                      {CATEGORIES.map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => setImageCategoryFilter(category.value)}
                          className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                            imageCategoryFilter === category.value
                              ? "border-yellow-400 bg-yellow-400 text-black"
                              : "border-white/10 bg-white/10 text-neutral-200 hover:bg-white/15"
                          }`}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-neutral-400">
                    {visibleImageCount} von {images.length} Bildern werden angezeigt.
                  </p>

                  {imageSortMode !== "manual" && (
                    <p className="mt-2 text-xs text-neutral-500">
                      Hoch/Runter ist nur bei eigener Reihenfolge aktiv.
                    </p>
                  )}
                </div>

                {images.length > 0 && (
                  <div className="mt-4 flex flex-col gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex w-fit items-center gap-3 text-sm font-semibold text-neutral-200">
                      <input
                        type="checkbox"
                        checked={allVisibleImagesSelected}
                        onChange={toggleVisibleImageSelection}
                        disabled={visibleImageCount === 0}
                        className="h-4 w-4 rounded border-white/20 accent-yellow-400"
                      />
                      Sichtbare Bilder auswählen
                    </label>

                    {selectedImageIds.length > 0 && (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                          {selectedImageIds.length} ausgewählt
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedImageIds([])}
                          className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-neutral-100 transition hover:bg-white/15"
                        >
                          Auswahl leeren
                        </button>
                        <button
                          type="button"
                          onClick={deleteSelectedImages}
                          disabled={busyImageId === "bulk-delete"}
                          className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-100 transition hover:bg-red-500/20 disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" />
                          Ausgewählte löschen
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-8 space-y-8">
                  {images.length === 0 && (
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6 text-neutral-300">
                      Noch keine hochgeladenen Portfolio-Bilder vorhanden.
                    </div>
                  )}

                  {images.length > 0 && visibleImageCount === 0 && (
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6 text-neutral-300">
                      Keine Bilder zu deiner Suche gefunden.
                    </div>
                  )}

                  {displayedImageCategories.map((category) => {
                    const categoryCollapsed =
                      collapsedPortfolioCategories[category.value];

                    return (
                      <div
                        key={category.value}
                        className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4"
                      >
                        <button
                          type="button"
                          onClick={() => togglePortfolioCategory(category.value)}
                          className="flex w-full items-center justify-between gap-4 rounded-[1.1rem] px-1 py-1 text-left transition hover:bg-white/[0.04] sm:px-2"
                        >
                          <div>
                            <h3 className="text-xl font-black">
                              {category.label}
                            </h3>
                            <p className="mt-1 text-xs text-neutral-500">
                              {categoryCollapsed
                                ? "Eingeklappt"
                                : "Bilder sichtbar"}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-neutral-300">
                              {category.images.length} Bilder
                            </span>
                            <ArrowDown
                              className={`h-4 w-4 text-neutral-400 transition ${
                                categoryCollapsed ? "-rotate-90" : "rotate-0"
                              }`}
                            />
                          </div>
                        </button>

                        {!categoryCollapsed &&
                          (category.images.length === 0 ? (
                            <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-black/10 p-5 text-sm text-neutral-400">
                              Noch keine Uploads in dieser Kategorie.
                            </div>
                          ) : (
                            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {category.images.map((image, index) => (
                            <article
                              key={image.id}
                              className={`overflow-hidden rounded-[1.5rem] border bg-white/[0.08] backdrop-blur-md ${
                                selectedImageIds.includes(image.id)
                                  ? "border-yellow-400/70"
                                  : "border-white/10"
                              }`}
                            >
                              <div
                                className={`relative bg-black/30 ${
                                  Number(image.width || 0) >
                                  Number(image.height || 0)
                                    ? "aspect-[4/3]"
                                    : "aspect-[3/4]"
                                }`}
                              >
                                <label className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-3 py-2 text-xs font-bold text-white backdrop-blur-md">
                                  <input
                                    type="checkbox"
                                    checked={selectedImageIds.includes(image.id)}
                                    onChange={() => toggleImageSelection(image.id)}
                                    className="h-4 w-4 rounded border-white/20 accent-yellow-400"
                                  />
                                  Auswahl
                                </label>
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
                                  <span>
                                    {imageSortMode === "manual"
                                      ? `Position ${index + 1}`
                                      : `Anzeige ${index + 1}`}
                                  </span>
                                  <span>·</span>
                                  <span>{formatDate(image.created_at)}</span>
                                </div>
                                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                                  <div className="grid gap-3">
                                    <label className="block">
                                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                                        Bildname
                                      </span>
                                      <input
                                        value={
                                          imageDrafts[image.id]?.title ??
                                          image.title ??
                                          ""
                                        }
                                        onChange={(event) =>
                                          updateImageDraft(
                                            image.id,
                                            "title",
                                            event.target.value
                                          )
                                        }
                                        maxLength={80}
                                        placeholder="z. B. Porsche Abendshooting"
                                        className="mt-2 w-full rounded-xl border border-white/10 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-yellow-400"
                                      />
                                    </label>

                                    <label className="block">
                                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                                        Notiz
                                      </span>
                                      <textarea
                                        value={
                                          imageDrafts[image.id]?.note ??
                                          image.note ??
                                          ""
                                        }
                                        onChange={(event) =>
                                          updateImageDraft(
                                            image.id,
                                            "note",
                                            event.target.value
                                          )
                                        }
                                        maxLength={240}
                                        rows={2}
                                        placeholder="Interne Notiz, z. B. Kunde, Ort oder Serie"
                                        className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-yellow-400"
                                      />
                                    </label>

                                    <button
                                      type="button"
                                      onClick={() => saveImageDetails(image)}
                                      disabled={busyImageId === image.id}
                                      className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white px-3 py-2 text-sm font-bold text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
                                    >
                                      <Save className="h-4 w-4" />
                                      Details speichern
                                    </button>
                                  </div>
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
                                    Öffnen
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
                                      imageSortMode !== "manual" ||
                                      index === 0 ||
                                      busyImageId === image.id
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
                                      imageSortMode !== "manual" ||
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
                                    Löschen
                                  </button>
                                </div>
                              </div>
                            </article>
                          ))}
                            </div>
                          ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "clients" && (
              <div className="mt-8">
	                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
	                  <div>
	                    <p className="text-sm uppercase tracking-[0.28em] text-neutral-400">
	                      Kunden
	                    </p>
	                    <h2 className="mt-3 text-3xl font-black">
	                      Kunden & Galerien
	                    </h2>
	                    <p className="mt-3 max-w-2xl text-neutral-300">
	                      Suche Kundenkonten per E-Mail, öffne passende Galerien
	                      und verwalte Codes, Uploads und Favoriten an einem Ort.
	                    </p>
	                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setShowClientGalleryForm((current) => !current)
                      }
                      className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      <Plus className="h-4 w-4" />
                      {showClientGalleryForm ? "Formular schließen" : "Neue Galerie"}
                    </button>
                    <a
                      href="/kunden"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Kundenseite öffnen
                    </a>
                    <button
                      type="button"
                      onClick={loadClientGalleries}
                      className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Neu laden
                    </button>
	                  </div>
	                </div>

	                <section className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-5">
	                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
	                    <div className="min-w-0">
	                      <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
	                        Kundenkonto suchen
	                      </p>
	                      <h3 className="mt-2 text-xl font-black">
	                        Per E-Mail finden
	                      </h3>
	                    </div>
	                  </div>

	                  <form
	                    onSubmit={searchCustomerAccounts}
	                    className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]"
	                  >
	                    <label className="relative block min-w-0">
	                      <span className="sr-only">Kundenkonto per E-Mail suchen</span>
	                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
	                      <input
	                        type="email"
	                        value={customerAccountSearch}
	                        onChange={(event) =>
	                          setCustomerAccountSearch(event.target.value)
	                        }
	                        placeholder="kunde@email.de"
	                        className="w-full rounded-2xl border border-white/10 bg-black/25 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-yellow-400/70"
	                      />
	                    </label>

	                    <button
	                      type="submit"
	                      disabled={customerAccountLoading}
	                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 lg:w-fit"
	                    >
	                      <Search className="h-4 w-4" />
	                      {customerAccountLoading ? "Suche..." : "Konto suchen"}
	                    </button>
	                  </form>

	                  {customerAccountSearched && customerAccounts.length === 0 && (
	                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-400">
	                      Kein Kundenkonto mit dieser E-Mail gefunden.
	                    </div>
	                  )}

	                  {customerAccounts.length > 0 && (
	                    <div className="mt-4 grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
	                      <div className="grid gap-2">
	                        {customerAccounts.map((account) => {
	                          const active = selectedCustomerAccount?.id === account.id;

	                          return (
	                            <button
	                              key={account.id}
	                              type="button"
	                              onClick={() => setSelectedCustomerAccount(account)}
	                              className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
	                                active
	                                  ? "border-yellow-400/50 bg-yellow-400/10"
	                                  : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
	                              }`}
	                            >
	                              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10">
	                                {account.avatar_url ? (
	                                  <img
	                                    src={account.avatar_url}
	                                    alt=""
	                                    className="h-full w-full object-cover"
	                                  />
	                                ) : (
	                                  <UserRound className="h-5 w-5 text-neutral-400" />
	                                )}
	                              </div>
	                              <div className="min-w-0">
	                                <p className="truncate font-black text-white">
	                                  {account.name || "Ohne Namen"}
	                                </p>
	                                <p className="truncate text-sm text-neutral-400">
	                                  {account.email}
	                                </p>
	                              </div>
	                            </button>
	                          );
	                        })}
	                      </div>

	                      {selectedCustomerAccount && (
	                        <article className="rounded-2xl border border-white/10 bg-black/25 p-4">
	                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
	                            <div className="flex min-w-0 gap-4">
	                              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10">
	                                {selectedCustomerAccount.avatar_url ? (
	                                  <img
	                                    src={selectedCustomerAccount.avatar_url}
	                                    alt=""
	                                    className="h-full w-full object-cover"
	                                  />
	                                ) : (
	                                  <UserRound className="h-7 w-7 text-neutral-400" />
	                                )}
	                              </div>
	                              <div className="min-w-0">
	                                <h4 className="truncate text-xl font-black">
	                                  {selectedCustomerAccount.name || "Ohne Namen"}
	                                </h4>
	                                <a
	                                  href={`mailto:${selectedCustomerAccount.email}`}
	                                  className="mt-1 block break-all text-sm font-semibold text-sky-200 transition hover:text-sky-100"
	                                >
	                                  {selectedCustomerAccount.email}
	                                </a>
	                                {selectedCustomerAccount.phone ? (
	                                  <a
	                                    href={`tel:${selectedCustomerAccount.phone.replace(/[^\d+]/g, "")}`}
	                                    className="mt-1 inline-flex text-sm font-semibold text-emerald-200 transition hover:text-emerald-100"
	                                  >
	                                    {selectedCustomerAccount.phone}
	                                  </a>
	                                ) : (
	                                  <p className="mt-1 text-sm text-neutral-500">
	                                    Keine Telefonnummer
	                                  </p>
	                                )}
	                              </div>
	                            </div>

	                            <span
	                              className={`w-fit rounded-full px-3 py-1 text-xs font-black ${
	                                selectedCustomerAccount.email_confirmed_at
	                                  ? "bg-emerald-400/15 text-emerald-100"
	                                  : "bg-yellow-400/15 text-yellow-100"
	                              }`}
	                            >
	                              {selectedCustomerAccount.email_confirmed_at
	                                ? "Bestätigt"
	                                : "Offen"}
	                            </span>
	                          </div>

	                          <div className="mt-5 grid gap-3 sm:grid-cols-3">
	                            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
	                              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
	                                Erstellt
	                              </p>
	                              <p className="mt-2 font-black">
	                                {formatDate(selectedCustomerAccount.created_at)}
	                              </p>
	                            </div>
	                            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
	                              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
	                                Zuletzt aktiv
	                              </p>
	                              <p className="mt-2 font-black">
	                                {selectedCustomerAccount.last_sign_in_at
	                                  ? formatDate(selectedCustomerAccount.last_sign_in_at)
	                                  : "Noch nie"}
	                              </p>
	                            </div>
	                            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
	                              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
	                                Galerien
	                              </p>
	                              <p className="mt-2 font-black">
	                                {customerAccountGalleries.length}
	                              </p>
	                            </div>
	                          </div>

	                          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
	                            <button
	                              type="button"
	                              onClick={() => focusClientAccountEmail(selectedCustomerAccount)}
	                              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/15"
	                            >
	                              <Search className="h-4 w-4" />
	                              Galerien anzeigen
	                            </button>
	                            <button
	                              type="button"
	                              onClick={() => prepareGalleryForAccount(selectedCustomerAccount)}
	                              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl"
	                            >
	                              <Plus className="h-4 w-4" />
	                              Galerie vorbereiten
	                            </button>
	                          </div>
	                        </article>
	                      )}
	                    </div>
	                  )}
	                </section>

	                {showClientGalleryForm && (
                <form
                  onSubmit={createClientGallery}
                  className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6"
                >
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <label className="block min-w-0">
                      <span className="text-sm font-semibold text-neutral-300">
                        Galerie-Titel
                      </span>
                      <input
                        value={clientGalleryForm.title}
                        onChange={(event) =>
                          updateClientGalleryForm("title", event.target.value)
                        }
                        required
                        placeholder="z. B. Shooting Familie Meyer"
                        className="mt-3 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-yellow-400"
                      />
                    </label>

                    <label className="block min-w-0">
                      <span className="text-sm font-semibold text-neutral-300">
                        Kundenname
                      </span>
                      <input
                        value={clientGalleryForm.client_name}
                        onChange={(event) =>
                          updateClientGalleryForm(
                            "client_name",
                            event.target.value
                          )
                        }
                        placeholder="Optional"
                        className="mt-3 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-yellow-400"
                      />
                    </label>

                    <label className="block min-w-0">
                      <span className="text-sm font-semibold text-neutral-300">
                        Kunden-E-Mail
                      </span>
                      <input
                        type="email"
                        value={clientGalleryForm.client_email}
                        onChange={(event) =>
                          updateClientGalleryForm(
                            "client_email",
                            event.target.value
                          )
                        }
                        placeholder="Optional"
                        className="mt-3 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-yellow-400"
                      />
                    </label>

                    <label className="block min-w-0">
                      <span className="text-sm font-semibold text-neutral-300">
                        Zugangscode
                      </span>
                      <div className="mt-3 flex gap-2">
                        <input
                          value={clientGalleryForm.access_code}
                          onChange={(event) =>
                            updateClientGalleryForm(
                              "access_code",
                              event.target.value.toUpperCase()
                            )
                          }
                          placeholder="Leer = automatisch"
                          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-yellow-400"
                        />
                        <button
                          type="button"
                          onClick={generateClientGalleryCode}
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 transition hover:bg-white/15"
                          aria-label="Code erzeugen"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                      </div>
                    </label>

                    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:col-span-2 xl:col-span-4 xl:flex-row xl:items-center xl:justify-between">
                      <label className="flex min-w-0 items-center gap-3 text-sm font-semibold text-neutral-200">
                        <input
                          type="checkbox"
                          checked={clientGalleryForm.downloads_enabled}
                          onChange={(event) =>
                            updateClientGalleryForm(
                              "downloads_enabled",
                              event.target.checked
                            )
                          }
                          className="h-4 w-4 rounded border-white/20 accent-yellow-400"
                        />
                        Downloads erlauben
                      </label>
                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl xl:w-fit"
                      >
                        <Users className="h-4 w-4" />
                        Galerie erstellen
                      </button>
                    </div>
                  </div>
                </form>
                )}

                <div className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                  <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-black">Galerien</h3>
                        <p className="mt-1 text-sm text-neutral-400">
                          Code kopieren und an den Kunden senden.
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-neutral-950">
                        {visibleClientGalleries.length}/{clientGalleries.length}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3">
                      <label className="relative block">
                        <span className="sr-only">Galerie suchen</span>
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                        <input
                          value={clientGallerySearch}
                          onChange={(event) =>
                            setClientGallerySearch(event.target.value)
                          }
                          placeholder="Kunde, Titel oder Code suchen"
                          className="w-full rounded-2xl border border-white/10 bg-black/25 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-yellow-400/70"
                        />
                      </label>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="sr-only">Status filtern</span>
                          <select
                            value={clientGalleryStatusFilter}
                            onChange={(event) =>
                              setClientGalleryStatusFilter(event.target.value)
                            }
                            className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-yellow-400/70"
                          >
                            <option value="all">
                              Alle ({clientGalleries.length})
                            </option>
                            <option value="active">
                              Aktiv ({clientGalleryStats.active})
                            </option>
                            <option value="paused">
                              Pausiert ({clientGalleryStats.paused})
                            </option>
                            <option value="completed">
                              Abgeschlossen ({clientGalleryStats.completed})
                            </option>
                          </select>
                        </label>

                        <label className="block">
                          <span className="sr-only">Galerien sortieren</span>
                          <select
                            value={clientGallerySortMode}
                            onChange={(event) =>
                              setClientGallerySortMode(event.target.value)
                            }
                            className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-yellow-400/70"
                          >
                            <option value="newest">Neueste zuerst</option>
                            <option value="oldest">Älteste zuerst</option>
                          </select>
                        </label>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {clientGalleries.length === 0 && (
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-400">
                          Noch keine Kundengalerie vorhanden.
                        </div>
                      )}

                      {clientGalleries.length > 0 &&
                        visibleClientGalleries.length === 0 && (
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-400">
                            Keine Galerie passt zu Suche oder Filter.
                          </div>
                        )}

                      {visibleClientGalleries.map((gallery) => {
                        const step = getClientProjectStep(gallery);
                        const accountState = getClientAccountState(gallery);

                        return (
                          <button
                            key={gallery.id}
                            type="button"
                            onClick={() => setActiveClientGalleryId(gallery.id)}
                            className={`w-full rounded-2xl border p-4 text-left transition hover:bg-white/10 ${
                              activeClientGallery?.id === gallery.id
                                ? "border-yellow-400/70 bg-yellow-400/10"
                                : "border-white/10 bg-black/20"
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h4 className="font-black">{gallery.title}</h4>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-black ${
                                  CLIENT_GALLERY_STATUSES[
                                    getClientGalleryStatus(gallery)
                                  ].badge
                                }`}
                              >
                                {
                                  CLIENT_GALLERY_STATUSES[
                                    getClientGalleryStatus(gallery)
                                  ].label
                                }
                              </span>
                            </div>
                          <p className="mt-2 text-sm text-neutral-400">
                            {gallery.client_name || "Ohne Kundennamen"}
                          </p>
                          {gallery.client_email && (
                            <p className="mt-1 break-all text-xs text-neutral-500">
                              {gallery.client_email}
                            </p>
                          )}
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                              <span className="max-w-full break-all rounded-full bg-white/10 px-3 py-1 font-bold text-neutral-200">
                                Code: {gallery.access_code}
                              </span>
                              <span className="rounded-full bg-white/10 px-3 py-1 text-neutral-300">
                                {gallery.image_count || 0} Bilder
                              </span>
                              <span className="rounded-full bg-white/10 px-3 py-1 text-neutral-300">
                                {gallery.favorite_count || 0} Favoriten
                              </span>
                              <span
                                className={`rounded-full border px-3 py-1 font-bold ${step.tone}`}
                              >
                                {step.label}
                              </span>
                              <span
                                className={`rounded-full border px-3 py-1 font-bold ${accountState.tone}`}
                              >
                                {accountState.label}
                              </span>
                              {gallery.favorite_last_at && (
                                <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-yellow-100">
                                  Zuletzt: {formatDate(gallery.favorite_last_at)}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-5">
                    {!activeClientGallery ? (
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-neutral-300">
                        Erstelle links zuerst eine Kundengalerie.
                      </div>
                    ) : (
                      <>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex min-w-0 gap-4">
                              <div className="hidden h-24 w-32 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] sm:block">
                                {activeClientCoverImage?.url ? (
                                  <img
                                    src={activeClientCoverImage.url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <ImageIcon className="h-7 w-7 text-neutral-600" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
                                  Aktive Galerie
                                </p>
                                <h3 className="mt-2 text-2xl font-black">
                                  {activeClientGallery.title}
                                </h3>
                                <p className="mt-2 text-sm text-neutral-400">
                                  {activeClientGallery.client_name ||
                                    "Kein Kundenname hinterlegt"}
                                </p>
                                {activeClientGallery.client_email && (
                                  <p className="mt-1 break-all text-sm text-neutral-500">
                                    {activeClientGallery.client_email}
                                  </p>
                                )}
                                <p className="mt-2 text-xs text-neutral-500">
                                  Cover:{" "}
                                  {activeClientCoverImage?.filename ||
                                    "automatisch erstes Bild"}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 lg:justify-end">
                              <button
                                type="button"
                                onClick={() => setActiveClientPanel("share")}
                                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl"
                              >
                                <QrCode className="h-4 w-4" />
                                Teilen
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveClientPanel("upload")}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/15"
                              >
                                <Upload className="h-4 w-4" />
                                Bilder hochladen
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2 text-xs">
                            <span
                              className={`rounded-full px-3 py-1 font-black ${
                                CLIENT_GALLERY_STATUSES[
                                  getClientGalleryStatus(activeClientGallery)
                                ].badge
                              }`}
                            >
                              {
                                CLIENT_GALLERY_STATUSES[
                                  getClientGalleryStatus(activeClientGallery)
                                ].label
                              }
                            </span>
                            <span className="rounded-full bg-white/10 px-3 py-1 font-bold text-neutral-300">
                              {activeClientImages.length} Bilder
                            </span>
                            <span className="rounded-full bg-white/10 px-3 py-1 font-bold text-neutral-300">
                              {activeClientFavoriteImages.length} Favoriten
                            </span>
                            <span
                              className={`rounded-full border px-3 py-1 font-bold ${activeClientAccountState.tone}`}
                            >
                              {activeClientAccountState.label}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-bold ${
                                activeClientGallery.downloads_enabled
                                  ? "bg-emerald-400/15 text-emerald-100"
                                  : "bg-white/10 text-neutral-300"
                              }`}
                            >
                              <Download className="h-3.5 w-3.5" />
                              Downloads{" "}
                              {activeClientGallery.downloads_enabled
                                ? "an"
                                : "aus"}
                            </span>
                          </div>

                          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
                                  <CircleHelp className="h-3.5 w-3.5" />
                                  Nächster Schritt
                                </p>
                                <h4 className="mt-1 font-black text-neutral-100">
                                  {activeClientProjectStep.label}
                                </h4>
                                <p className="mt-1 text-sm leading-6 text-neutral-500">
                                  {activeClientProjectStep.helper}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveClientPanel(activeClientSuggestedPanel)
                                }
                                className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15 sm:w-fit"
                              >
                                Bereich öffnen
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-1.5">
                          <div className="flex min-w-max gap-1 xl:grid xl:min-w-0 xl:grid-cols-5">
                            {clientDetailPanels.map((panel) => {
                              const Icon = panel.icon;
                              const active = activeClientPanel === panel.value;

                              return (
                                <button
                                  key={panel.value}
                                  type="button"
                                  onClick={() => setActiveClientPanel(panel.value)}
                                  className={`inline-flex min-w-32 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-black transition xl:min-w-0 ${
                                    active
                                      ? "bg-white text-neutral-950"
                                      : "text-neutral-300 hover:bg-white/10 hover:text-white"
                                  }`}
                                >
                                  <Icon className="h-4 w-4" />
                                  {panel.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {activeClientPanel === "share" && (
                          <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                              <div className="flex items-start gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                                  <ExternalLink className="h-5 w-5" />
                                </span>
                                <div className="min-w-0">
                                  <h4 className="font-black">
                                    Galerie teilen
                                  </h4>
                                  <p className="mt-1 text-sm leading-6 text-neutral-500">
                                    Gib dem Kunden den Code oder sende direkt den
                                    Link. Der QR-Code führt zur gleichen
                                    Kundengalerie.
                                  </p>
                                </div>
                              </div>

                              <div className="mt-5 grid gap-3">
                                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                                  <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
                                    Galerie-Code
                                  </p>
                                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <code className="break-all rounded-xl bg-black/30 px-3 py-2 text-sm font-black text-white">
                                      {activeClientGallery.access_code}
                                    </code>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        copyText(
                                          activeClientGallery.access_code,
                                          "Galerie-Code wurde kopiert."
                                        )
                                      }
                                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/15"
                                    >
                                      <Copy className="h-4 w-4" />
                                      Code kopieren
                                    </button>
                                  </div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                                  <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
                                    Direktlink
                                  </p>
                                  <p className="mt-3 break-all rounded-xl bg-black/30 px-3 py-2 text-sm text-neutral-200">
                                    {activeClientGalleryUrl}
                                  </p>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        copyText(
                                          activeClientGalleryUrl,
                                          "Direktlink wurde kopiert."
                                        )
                                      }
                                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/15"
                                    >
                                      <Copy className="h-4 w-4" />
                                      Link kopieren
                                    </button>
                                    <button
                                      type="button"
                                      onClick={copyClientGalleryInvite}
                                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/15"
                                    >
                                      <Mail className="h-4 w-4" />
                                      Einladung kopieren
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                              <div className="flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white">
                                  <QrCode className="h-5 w-5" />
                                </span>
                                <div>
                                  <h4 className="font-black">QR-Code</h4>
                                  <p className="mt-1 text-sm text-neutral-500">
                                    Zum Scannen für den Kunden.
                                  </p>
                                </div>
                              </div>

                              {activeClientGalleryQrUrl ? (
                                <>
                                  <div className="mt-5 rounded-2xl bg-white p-4">
                                    <img
                                      src={activeClientGalleryQrUrl}
                                      alt={`QR-Code für ${activeClientGallery.title}`}
                                      className="mx-auto aspect-square w-full max-w-[220px]"
                                    />
                                  </div>
                                  <div className="mt-4 grid gap-2">
                                    <a
                                      href={activeClientGalleryQrUrl}
                                      download={`qr-${activeClientGallery.access_code}.png`}
                                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/15"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                      QR herunterladen
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        copyText(
                                          activeClientGalleryUrl,
                                          "QR-Ziel wurde kopiert."
                                        )
                                      }
                                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/15"
                                    >
                                      <Copy className="h-4 w-4" />
                                      Ziel-Link kopieren
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <p className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm text-neutral-400">
                                  QR-Code wird geladen, sobald die Website-URL
                                  verfügbar ist.
                                </p>
                              )}
                            </div>
                          </section>
                        )}

                        {activeClientPanel === "overview" && (
                        <section className="mt-6 space-y-4">
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <h4 className="font-black">Kundendaten</h4>
                                <p className="mt-1 text-sm text-neutral-500">
                                  Das Wichtigste zur Galerie und zur persönlichen Kundenansprache.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  updateClientGallery(
                                    activeClientGallery,
                                    {
                                      client_name:
                                        activeClientGallery.client_name || "",
                                      client_email:
                                        activeClientGallery.client_email || "",
                                      welcome_message:
                                        activeClientGallery.welcome_message || "",
                                    },
                                    "Kundendaten wurden gespeichert."
                                  )
                                }
                                disabled={
                                  busyClientGalleryId === activeClientGallery.id
                                }
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/15 disabled:opacity-60 sm:w-fit"
                              >
                                <Save className="h-4 w-4" />
                                Speichern
                              </button>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                              <label className="block min-w-0">
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                                  Kundenname
                                </span>
                                <input
                                  value={activeClientGallery.client_name || ""}
                                  onChange={(event) =>
                                    updateClientGalleryDraft({
                                      client_name: event.target.value,
                                    })
                                  }
                                  placeholder="Name oder Firma"
                                  className="mt-2 w-full rounded-xl border border-white/10 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-yellow-400"
                                />
                              </label>

                              <label className="block min-w-0">
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                                  Kunden-E-Mail
                                </span>
                                <input
                                  type="email"
                                  value={activeClientGallery.client_email || ""}
                                  onChange={(event) =>
                                    updateClientGalleryDraft({
                                      client_email: event.target.value,
                                    })
                                  }
                                  placeholder="kunde@example.com"
                                  className="mt-2 w-full rounded-xl border border-white/10 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-yellow-400"
                                />
                              </label>
                            </div>

                            <label className="mt-4 block min-w-0">
                              <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                                Persönliche Nachricht
                              </span>
                              <textarea
                                value={activeClientGallery.welcome_message || ""}
                                onChange={(event) =>
                                  updateClientGalleryDraft({
                                    welcome_message: event.target.value,
                                  })
                                }
                                rows="3"
                                placeholder="z. B. Schön, dass du da bist. Hier findest du deine Auswahl vom Shooting."
                                className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-white px-3 py-2 text-sm leading-6 text-neutral-950 outline-none focus:border-yellow-400"
                              />
                              <p className="mt-2 text-xs leading-5 text-neutral-500">
                                Dieser Text erscheint oben in der Kundengalerie.
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  updateClientGallery(
                                    activeClientGallery,
                                    {
                                      welcome_message:
                                        activeClientGallery.welcome_message || "",
                                    },
                                    "Persönliche Nachricht wurde gespeichert."
                                  )
                                }
                                disabled={
                                  busyClientGalleryId === activeClientGallery.id
                                }
                                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-yellow-400/25 bg-yellow-400/10 px-4 py-2 text-sm font-black text-yellow-100 transition hover:bg-yellow-400/15 disabled:opacity-60 sm:w-fit"
                              >
                                <Save className="h-4 w-4" />
                                Nachricht speichern
                              </button>
                            </label>
                          </div>

                          <details
                            open
                            className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                          >
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
                              <span>
                                <span className="block font-black">
                                  Projektstatus & Checkliste
                                </span>
                                <span className="mt-1 block text-sm text-neutral-500">
                                  Sichtbarkeit, Downloads und Abschluss nur bei Bedarf öffnen.
                                </span>
                              </span>
                              <span
                                className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
                                  CLIENT_GALLERY_STATUSES[
                                    getClientGalleryStatus(activeClientGallery)
                                  ].badge
                                }`}
                              >
                                {
                                  CLIENT_GALLERY_STATUSES[
                                    getClientGalleryStatus(activeClientGallery)
                                  ].label
                                }
                              </span>
                            </summary>

                            <div className="grid gap-4 border-t border-white/10 p-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
                              <div>
                                <h5 className="text-sm font-black text-neutral-200">
                                  Freigaben
                                </h5>
                                <div className="mt-3 grid gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateClientGallery(
                                        activeClientGallery,
                                        {
                                          is_active:
                                            !activeClientGallery.is_active,
                                          status: activeClientGallery.is_active
                                            ? "paused"
                                            : "active",
                                        },
                                        activeClientGallery.is_active
                                          ? "Kundengalerie wurde pausiert."
                                          : "Kundengalerie wurde aktiviert."
                                      )
                                    }
                                    disabled={
                                      busyClientGalleryId ===
                                      activeClientGallery.id
                                    }
                                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm font-bold transition hover:bg-white/10 disabled:opacity-60"
                                  >
                                    <span>
                                      {activeClientGallery.is_active
                                        ? "Galerie pausieren"
                                        : "Galerie aktivieren"}
                                    </span>
                                    {activeClientGallery.is_active ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateClientGallery(
                                        activeClientGallery,
                                        {
                                          downloads_enabled:
                                            !activeClientGallery.downloads_enabled,
                                        },
                                        activeClientGallery.downloads_enabled
                                          ? "Downloads wurden deaktiviert."
                                          : "Downloads wurden aktiviert."
                                      )
                                    }
                                    disabled={
                                      busyClientGalleryId ===
                                      activeClientGallery.id
                                    }
                                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm font-bold transition hover:bg-white/10 disabled:opacity-60"
                                  >
                                    <span>
                                      <Download className="mr-2 inline h-4 w-4" />
                                      Downloads{" "}
                                      {activeClientGallery.downloads_enabled
                                        ? "deaktivieren"
                                        : "aktivieren"}
                                    </span>
                                    <span
                                      className={`rounded-full px-2 py-1 text-xs ${
                                        activeClientGallery.downloads_enabled
                                          ? "bg-emerald-400 text-neutral-950"
                                          : "bg-neutral-700 text-neutral-200"
                                      }`}
                                    >
                                      {activeClientGallery.downloads_enabled
                                        ? "An"
                                        : "Aus"}
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (
                                        getClientGalleryStatus(
                                          activeClientGallery
                                        ) === "completed"
                                      ) {
                                        updateClientGallery(
                                          activeClientGallery,
                                          { status: "active", is_active: true },
                                          "Kundengalerie ist wieder aktiv."
                                        );
                                        return;
                                      }

                                      prepareClientGalleryArchive(
                                        activeClientGallery
                                      );
                                    }}
                                    disabled={
                                      busyClientGalleryId ===
                                      activeClientGallery.id
                                    }
                                    className="flex items-center justify-between rounded-xl border border-sky-300/25 bg-sky-300/10 px-3 py-3 text-sm font-bold text-sky-100 transition hover:bg-sky-300/20 disabled:opacity-60"
                                  >
                                    <span>
                                      {getClientGalleryStatus(
                                        activeClientGallery
                                      ) === "completed"
                                        ? "Wieder aktiv setzen"
                                        : "Abschließen & ZIP erstellen"}
                                    </span>
                                    <CheckCircle2 className="h-4 w-4" />
                                  </button>
                                  {activeClientGallery.archive_path && (
                                    <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold leading-5 text-emerald-100">
                                      ZIP ist vorbereitet
                                      {activeClientGallery.archive_size
                                        ? ` (${(
                                            activeClientGallery.archive_size /
                                            1024 /
                                            1024
                                          ).toFixed(1)} MB)`
                                        : ""}
                                      .
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div>
                                <div className="flex items-center justify-between gap-3">
                                  <h5 className="text-sm font-black text-neutral-200">
                                    Abschluss-Checkliste
                                  </h5>
                                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-neutral-300">
                                    {activeClientChecklistDone}/
                                    {CLIENT_GALLERY_CHECKLIST.length}
                                  </span>
                                </div>
                                <div className="mt-3 grid gap-2">
                                  {CLIENT_GALLERY_CHECKLIST.map((item) => {
                                    const checked = Boolean(
                                      activeClientGallery[item.key]
                                    );

                                    return (
                                      <button
                                        key={item.key}
                                        type="button"
                                        onClick={() =>
                                          updateClientGallery(
                                            activeClientGallery,
                                            { [item.key]: !checked },
                                            checked
                                              ? "Punkt wurde wieder geöffnet."
                                              : "Punkt wurde abgehakt."
                                          )
                                        }
                                        disabled={
                                          busyClientGalleryId ===
                                          activeClientGallery.id
                                        }
                                        className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left text-sm font-bold transition disabled:opacity-60 ${
                                          checked
                                            ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
                                            : "border-white/10 bg-white/[0.06] text-neutral-300 hover:bg-white/10"
                                        }`}
                                      >
                                        <span>{item.label}</span>
                                        <CheckCircle2
                                          className={`h-4 w-4 ${
                                            checked
                                              ? "fill-emerald-400 text-emerald-400"
                                              : "text-neutral-600"
                                          }`}
                                        />
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </details>

                          <details className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                            <summary className="cursor-pointer list-none px-5 py-4">
                              <span className="block font-black">
                                Interne Notiz
                              </span>
                              <span className="mt-1 block text-sm text-neutral-500">
                                Nur für dich sichtbar. Eingeklappt, damit die Übersicht ruhig bleibt.
                              </span>
                            </summary>

                            <div className="border-t border-white/10 p-5">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-neutral-500">
                                  Notizen zu Auswahl, Retusche oder Absprachen.
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateClientGallery(
                                      activeClientGallery,
                                      {
                                        internal_note:
                                          activeClientGallery.internal_note || "",
                                      },
                                      "Interne Notiz wurde gespeichert."
                                    )
                                  }
                                  disabled={
                                    busyClientGalleryId ===
                                    activeClientGallery.id
                                  }
                                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/15 disabled:opacity-60 sm:w-fit"
                                >
                                  <Save className="h-4 w-4" />
                                  Speichern
                                </button>
                              </div>
                              <textarea
                                value={activeClientGallery.internal_note || ""}
                                onChange={(event) =>
                                  updateClientGalleryDraft({
                                    internal_note: event.target.value,
                                  })
                                }
                                rows="5"
                                placeholder="z. B. Kunde möchte Bild 3 und 7 final retuschiert haben..."
                                className="mt-4 w-full resize-y rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm leading-6 text-neutral-950 outline-none focus:border-yellow-400"
                              />
                            </div>
                          </details>

                          <details className="overflow-hidden rounded-2xl border border-red-400/20 bg-red-500/10">
                            <summary className="cursor-pointer list-none px-5 py-4">
                              <span className="block font-black text-red-100">
                                Sicherheitsbereich
                              </span>
                              <span className="mt-1 block text-sm leading-6 text-red-100/65">
                                Löschen ist bewusst eingeklappt und fragt danach noch einmal per Haken nach.
                              </span>
                            </summary>

                            <div className="border-t border-red-400/20 p-5">
                              <p className="text-sm leading-6 text-red-100/65">
                                Löschen entfernt die Kundengalerie, die
                                zugeordneten Bilder, Favoriten und den QR-Zugriff.
                                Nutze das nur, wenn das Projekt wirklich weg kann.
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  deleteClientGallery(activeClientGallery)
                                }
                                disabled={
                                  busyClientGalleryId === activeClientGallery.id
                                }
                                className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/15 px-4 py-2 text-sm font-bold text-red-100 transition hover:bg-red-500/25 disabled:opacity-60"
                              >
                                <Trash2 className="h-4 w-4" />
                                Galerie löschen
                              </button>
                            </div>
                          </details>
                        </section>
                        )}

                        {activeClientPanel === "upload" && (
                        <form
                          onSubmit={uploadClientGalleryImage}
                          className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
                        >
                          <label className="block min-w-0">
                            <span className="text-sm font-semibold text-neutral-300">
                              Kundenbild hochladen
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-neutral-500">
                              Originaldatei bis 15 MB. Für flüssiges Laden sind
                              JPG/WebP mit ca. 2000-3000 px Kantenlänge ideal.
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(event) => {
                                const selectedFiles = Array.from(
                                  event.target.files || []
                                );
                                openCropSession(selectedFiles, {
                                  target: "client-gallery",
                                  title: "Kundenbilder vorbereiten",
                                  description:
                                    "Passe das Vorschauraster an oder übernimm das Original unverändert.",
                                  aspectWidth: 4,
                                  aspectHeight: 3,
                                  outputWidth: 2400,
                                  outputHeight: 1800,
                                });
                                event.target.value = "";
                                setMessage("");
                              }}
                              className="mt-3 w-full min-w-0 rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-neutral-950 file:mr-3 file:max-w-full file:rounded-full file:border-0 file:bg-neutral-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                            />
                          </label>
                          <button
                            type="submit"
                            disabled={clientGalleryUploading}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 lg:w-fit"
                          >
                            <Upload className="h-4 w-4" />
                            {clientGalleryUploading
                              ? "Lädt hoch..."
                              : "In Kundengalerie laden"}
                          </button>

                          {clientGalleryPreview && (
                            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 lg:col-span-2">
                              <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
                                <img
                                  src={clientGalleryPreview}
                                  alt="Vorschau Kundenbild"
                                  className="aspect-[4/3] w-full rounded-xl object-cover sm:w-40"
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-white">
                                    Ausgewähltes Kundenbild
                                  </p>
                                  <p className="mt-1 break-all text-sm text-neutral-300">
                                    {clientGalleryFile?.name}
                                  </p>
                                  {clientGalleryFiles.length > 1 && (
                                    <p className="mt-2 rounded-full bg-yellow-400/15 px-3 py-1 text-xs font-bold text-yellow-100">
                                      {clientGalleryFiles.length} Bilder
                                      ausgewählt. Vorschau zeigt das erste Bild.
                                    </p>
                                  )}
                                  <p className="mt-1 text-xs text-neutral-500">
                                    {clientGalleryFile
                                      ? `${(
                                          clientGalleryFile.size /
                                          1024 /
                                          1024
                                        ).toFixed(2)} MB`
                                      : ""}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </form>
                        )}

                        {activeClientPanel === "favorites" && (
                        <section className="mt-6 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="min-w-0">
                              <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                                <Heart className="h-3.5 w-3.5 fill-current" />
                                {activeClientFavoriteImages.length} Favorit
                                {activeClientFavoriteImages.length === 1
                                  ? ""
                                  : "en"}
                              </div>
                              <h4 className="mt-3 text-lg font-black text-white">
                                Favoriten des Kunden
                              </h4>
                              <p className="mt-1 text-sm leading-6 text-yellow-100/70">
                                Hier siehst du nur die Bilder, die der Kunde in
                                seiner Galerie markiert hat.
                              </p>
                              <p className="mt-2 text-xs text-yellow-100/55">
                                Zuletzt markiert:{" "}
                                {activeClientGallery.favorite_last_at
                                  ? formatDate(activeClientGallery.favorite_last_at)
                                  : "Noch keine Favoriten"}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={copyClientFavoriteList}
                              disabled={activeClientFavoriteImages.length === 0}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/15 px-4 py-2 text-sm font-bold text-yellow-50 transition hover:bg-yellow-400/25 disabled:cursor-not-allowed disabled:opacity-50 md:w-fit"
                            >
                              <Copy className="h-4 w-4" />
                              Favoritenliste kopieren
                            </button>
                          </div>

                          {activeClientFavoriteImages.length === 0 ? (
                            <div className="mt-4 rounded-xl border border-yellow-400/15 bg-black/20 p-4 text-sm text-yellow-100/60">
                              Noch keine Favoriten markiert.
                            </div>
                          ) : (
                            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                              {activeClientFavoriteImages.map((image, index) => (
                                <article
                                  key={`favorite-${image.id}`}
                                  className="grid grid-cols-[76px_minmax(0,1fr)] gap-3 rounded-xl border border-yellow-400/15 bg-black/25 p-3"
                                >
                                  <button
                                    type="button"
                                    onClick={() => setSelectedImage(image)}
                                    className="overflow-hidden rounded-lg bg-black/30"
                                    aria-label="Favoritenbild ansehen"
                                  >
                                    {image.url ? (
                                      <img
                                        src={image.url}
                                        alt=""
                                        loading="lazy"
                                        decoding="async"
                                        className="aspect-square h-full w-full object-cover"
                                      />
                                    ) : (
                                      <span className="flex aspect-square h-full w-full items-center justify-center px-2 text-center text-[10px] font-bold leading-4 text-neutral-500">
                                        Bildlink fehlt
                                      </span>
                                    )}
                                  </button>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-white">
                                      #{index + 1}{" "}
                                      {image.filename || "Kundenbild"}
                                    </p>
                                    <p className="mt-1 text-xs text-yellow-100/55">
                                      Markiert:{" "}
                                      {formatDate(image.favorite_created_at)}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedImage(image)}
                                        className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold transition hover:bg-white/15"
                                      >
                                        Ansehen
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          copyText(
                                            image.url,
                                            "Bild-URL wurde kopiert."
                                          )
                                        }
                                        className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold transition hover:bg-white/15"
                                      >
                                        URL
                                      </button>
                                    </div>
                                  </div>
                                </article>
                              ))}
                            </div>
                          )}
                        </section>
                        )}

                        {activeClientPanel === "images" && (
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {activeClientImages.length === 0 && (
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-neutral-400 sm:col-span-2 lg:col-span-3">
                              Noch keine Bilder in dieser Kundengalerie.
                            </div>
                          )}

                          {activeClientImages.map((image) => {
                            const favoriteCount = (
                              activeClientGallery.favorites || []
                            ).filter(
                              (favorite) => favorite.image_id === image.id
                            ).length;
                            const isCover =
                              image.id === activeClientGallery.cover_image_id ||
                              (!activeClientGallery.cover_image_id &&
                                image.id === activeClientImages[0]?.id);

                            return (
                              <article
                                key={image.id}
                                className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                              >
                                <div className="relative aspect-[4/3]">
                                  {image.url ? (
                                    <img
                                      src={image.url}
                                      alt=""
                                      loading="lazy"
                                      decoding="async"
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-black/30 px-4 text-center text-sm font-bold text-neutral-500">
                                      Bildlink konnte nicht erstellt werden
                                    </div>
                                  )}
                                  {favoriteCount > 0 && (
                                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                                      <Heart className="h-3.5 w-3.5 fill-current" />
                                      {favoriteCount}
                                    </span>
                                  )}
                                  {isCover && (
                                    <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-black text-neutral-950">
                                      Cover
                                    </span>
                                  )}
                                </div>
                                <div className="p-4">
                                  <p className="truncate text-sm font-bold">
                                    {image.filename || "Kundenbild"}
                                  </p>
                                  <p className="mt-1 text-xs text-neutral-500">
                                    {formatDate(image.created_at)}
                                  </p>
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    <a
                                      href={image.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold transition hover:bg-white/15"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                      Öffnen
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setClientGalleryCover(
                                          activeClientGallery,
                                          image
                                        )
                                      }
                                      disabled={
                                        busyClientGalleryId ===
                                          activeClientGallery.id || isCover
                                      }
                                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold transition hover:bg-white/15 disabled:opacity-50"
                                    >
                                      <ImageIcon className="h-4 w-4" />
                                      Als Cover
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        deleteClientGalleryImage(
                                          activeClientGallery,
                                          image
                                        )
                                      }
                                      disabled={busyClientImageId === image.id}
                                      className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-100 transition hover:bg-red-500/20 disabled:opacity-60"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Löschen
                                    </button>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                        )}
                      </>
                    )}
                  </section>
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
                      Galerie-Uploads zu verändern.
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
                  <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">
                          Archiv
                        </p>
                        <h3 className="mt-2 text-2xl font-black">
                          Portfolio-Reiter anzeigen
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={savePortfolioArchiveSettings}
                        disabled={portfolioVisibilitySaving}
                        className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        {portfolioVisibilitySaving
                          ? "Speichert..."
                          : "Archiv speichern"}
                      </button>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {CATEGORIES.map((category) => {
                        const isArchived = archivedPortfolioKeys.includes(
                          category.value
                        );

                        return (
                          <button
                            key={category.value}
                            type="button"
                            onClick={() =>
                              togglePortfolioArchive(category.value)
                            }
                            className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                              isArchived
                                ? "border-white/10 bg-black/25 text-neutral-400 hover:bg-white/10"
                                : "border-emerald-300/30 bg-emerald-400/10 text-white hover:bg-emerald-400/15"
                            }`}
                          >
                            <span>
                              <span className="block font-black">
                                {category.label}
                              </span>
                              <span className="mt-1 block text-xs">
                                {isArchived ? "Archiviert" : "Sichtbar"}
                              </span>
                            </span>
                            {isArchived ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5 text-emerald-300" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {SITE_ASSET_GROUPS.map((group) => (
                    <section
                      key={group.title}
                      className="rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-6"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                          <h3 className="text-2xl font-black">{group.title}</h3>
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
                                    Neues Bild auswählen
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                      const selectedFile =
                                        event.target.files?.[0] || null;

                                      if (selectedFile) {
                                        openCropSession([selectedFile], {
                                          target: "site-asset",
                                          assetKey: asset.key,
                                          ...getSiteAssetCropPreset(asset.key),
                                        });
                                      }

                                      event.target.value = "";
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

            {activeTab === "texts" && (
              <div className="mt-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-neutral-400">
                      Texte
                    </p>
                    <h2 className="mt-3 text-3xl font-black">
                      Website-Texte bearbeiten
                    </h2>
                    <p className="mt-3 max-w-2xl text-neutral-300">
                      Hier änderst du sichtbare Texte auf der Website, ohne in
                      den Code zu gehen.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadSiteSettings}
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Texte neu laden
                  </button>
                </div>

                <form onSubmit={saveSiteSettings} className="mt-8 space-y-6">
                  {TEXT_FIELD_GROUPS.map((group) => (
                    <section
                      key={group.title}
                      className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                          <h3 className="text-2xl font-black">{group.title}</h3>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-5 lg:grid-cols-2">
                        {group.fields.map((field) => {
                          const value = settingsDraft[field.key] || "";

                          return (
                            <label
                              key={field.key}
                              className={field.multiline ? "lg:col-span-2" : ""}
                            >
                              <span className="flex items-center gap-2 text-sm font-bold text-neutral-200">
                                <Type className="h-4 w-4 text-neutral-400" />
                                {field.label}
                              </span>

                              {field.multiline ? (
                                <textarea
                                  value={value}
                                  onChange={(event) =>
                                    updateSettingsDraft(
                                      field.key,
                                      event.target.value
                                    )
                                  }
                                  placeholder={field.placeholder}
                                  rows="4"
                                  className="mt-3 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-yellow-400"
                                />
                              ) : (
                                <input
                                  value={value}
                                  onChange={(event) =>
                                    updateSettingsDraft(
                                      field.key,
                                      event.target.value
                                    )
                                  }
                                  placeholder={field.placeholder}
                                  className="mt-3 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-yellow-400"
                                />
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </section>
                  ))}

                  <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold">Vorschau Startseite</p>
                      <p className="mt-1 text-sm text-neutral-400">
                        {settingsDraft.hero_title_line_1}{" "}
                        {settingsDraft.hero_title_line_2}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={settingsSaving}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {settingsSaving ? "Speichert..." : "Texte speichern"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="mt-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-neutral-400">
                      Kontakt
                    </p>
                    <h2 className="mt-3 text-3xl font-black">
                      Kontaktinfos bearbeiten
                    </h2>
                    <p className="mt-3 max-w-2xl text-neutral-300">
                      Diese Angaben erscheinen auf der Website im Kontaktbereich
                      und teilweise im Impressum.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadSiteSettings}
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Kontakt neu laden
                  </button>
                </div>

                <form
                  onSubmit={saveSiteSettings}
                  className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6"
                >
                  <div className="grid gap-5 lg:grid-cols-2">
                    {CONTACT_FIELDS.map((field) => {
                      const Icon = field.icon;
                      const value = settingsDraft[field.key] || "";

                      return (
                        <label
                          key={field.key}
                          className={field.multiline ? "lg:col-span-2" : ""}
                        >
                          <span className="flex items-center gap-2 text-sm font-bold text-neutral-200">
                            <Icon className="h-4 w-4 text-neutral-400" />
                            {field.label}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-neutral-500">
                            {field.helper}
                          </span>

                          {field.multiline ? (
                            <textarea
                              value={value}
                              onChange={(event) =>
                                updateSettingsDraft(field.key, event.target.value)
                              }
                              placeholder={field.placeholder}
                              rows="3"
                              className="mt-3 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-yellow-400"
                            />
                          ) : (
                            <input
                              value={value}
                              onChange={(event) =>
                                updateSettingsDraft(field.key, event.target.value)
                              }
                              placeholder={field.placeholder}
                              className="mt-3 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-yellow-400"
                            />
                          )}
                        </label>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold">Vorschau</p>
                      <p className="mt-1 break-all text-sm text-neutral-400">
                        {settingsDraft.contact_email} · {settingsDraft.contact_phone} ·{" "}
                        {settingsDraft.instagram_label}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={settingsSaving}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {settingsSaving ? "Speichert..." : "Kontakt speichern"}
                    </button>
                  </div>
                </form>

                <section className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                          <QrCode className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="text-xl font-black">
                            QR-Code für Visitenkarten
                          </h3>
                          <p className="mt-1 break-all text-sm text-neutral-400">
                            {BUSINESS_CARD_URL}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="w-full max-w-xs rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                      {businessCardQrUrl ? (
                        <>
                          <div className="rounded-2xl bg-white p-4">
                            <img
                              src={businessCardQrUrl}
                              alt="QR-Code für feliixwxf.de"
                              className="mx-auto aspect-square w-full"
                            />
                          </div>

                          <div className="mt-4 grid gap-2">
                            <a
                              href={businessCardQrUrl}
                              download="feliixwxf-website-qr.png"
                              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl"
                            >
                              <Download className="h-4 w-4" />
                              QR herunterladen
                            </a>

                            <button
                              type="button"
                              onClick={() =>
                                copyText(
                                  BUSINESS_CARD_URL,
                                  "Website-Link wurde kopiert."
                                )
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/15"
                            >
                              <Copy className="h-4 w-4" />
                              Link kopieren
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm text-neutral-400">
                          QR-Code wird geladen.
                        </div>
                      )}
                    </div>
                  </div>
                </section>
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
                      label: "Öffentlich",
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
                                ? "Öffentlich"
                                : "Wartet auf Freigabe"}
                            </span>

                            {review.account_deleted_at && (
                              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-neutral-300">
                                Konto gelöscht
                              </span>
                            )}
                          </div>
                          <div className="mt-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10">
                              {review.avatar_url ? (
                                <img
                                  src={review.avatar_url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Users className="h-5 w-5 text-neutral-400" />
                              )}
                            </div>
                            <h3 className="text-xl font-black">
                              {review.name}
                            </h3>
                          </div>
                          <p className="mt-3 leading-7 text-neutral-300">
                            "{review.text}"
                          </p>
                          <div className="mt-5 rounded-2xl border border-white/10 bg-black/15 p-3">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">
                              Avatar
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setReviewAvatar(review, "")}
                                disabled={busyId === review.id}
                                className={`flex h-11 w-11 items-center justify-center rounded-full border transition hover:scale-105 disabled:opacity-60 ${
                                  !review.avatar_url
                                    ? "border-white bg-white text-neutral-950"
                                    : "border-white/10 bg-white/10 text-neutral-400"
                                }`}
                                title="Kein Avatar"
                              >
                                <Users className="h-5 w-5" />
                              </button>

                              {REVIEW_AVATARS.map((avatar) => (
                                <button
                                  key={avatar.url}
                                  type="button"
                                  onClick={() =>
                                    setReviewAvatar(review, avatar.url)
                                  }
                                  disabled={busyId === review.id}
                                  className={`h-11 w-11 overflow-hidden rounded-full border transition hover:scale-105 disabled:opacity-60 ${
                                    review.avatar_url === avatar.url
                                      ? "border-white ring-2 ring-yellow-300"
                                      : "border-white/10"
                                  }`}
                                  title={avatar.label}
                                >
                                  <img
                                    src={avatar.url}
                                    alt={avatar.label}
                                    className="h-full w-full object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <p className="mt-4 text-xs uppercase tracking-[0.22em] text-neutral-500">
                            {formatDate(review.created_at)}
                          </p>
                          {review.account_deleted_at && (
                            <p className="mt-2 text-xs leading-5 text-neutral-500">
                              Kundenkonto gelöscht am{" "}
                              {formatDate(review.account_deleted_at)}.
                              Bewertung bleibt erhalten und kann bei Bedarf
                              manuell gelöscht werden.
                            </p>
                          )}
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
                            Löschen
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
                <h2 className="mt-3 text-3xl font-black">Schnellzugriff</h2>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <button
                    type="button"
                    onClick={toggleMaintenanceMode}
                    disabled={maintenanceSaving}
                    className={`group rounded-[1.5rem] border p-6 text-left transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60 ${
                      String(siteSettings.maintenance_mode) === "true"
                        ? "border-yellow-400/25 bg-yellow-400/10 text-yellow-50 hover:bg-yellow-400/15"
                        : "border-emerald-400/20 bg-emerald-400/10 text-emerald-50 hover:bg-emerald-400/15"
                    }`}
                  >
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                        String(siteSettings.maintenance_mode) === "true"
                          ? "bg-yellow-400/15"
                          : "bg-emerald-400/15"
                      }`}
                    >
                      <Settings
                        className={`h-5 w-5 ${
                          String(siteSettings.maintenance_mode) === "true"
                            ? "animate-spin"
                            : ""
                        }`}
                      />
                    </span>
                    <span className="mt-5 block text-xl font-black">
                      Wartungsmodus
                    </span>
                    <span className="mt-2 block text-sm opacity-75">
                      {maintenanceSaving
                        ? "Speichert..."
                        : String(siteSettings.maintenance_mode) === "true"
                          ? "Aktiv"
                          : "Aus"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={refreshDashboard}
                    className="group rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6 text-left transition hover:-translate-y-1 hover:bg-white/[0.12]"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition group-hover:bg-white/15">
                      <RefreshCw className="h-5 w-5" />
                    </span>
                    <span className="mt-5 block text-xl font-black">
                      Daten neu laden
                    </span>
                    <span className="mt-2 block text-sm text-neutral-400">
                      Inhalte aktualisieren
                    </span>
                  </button>

                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6 text-left transition hover:-translate-y-1 hover:bg-white/[0.12]"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition group-hover:bg-white/15">
                      <ExternalLink className="h-5 w-5" />
                    </span>
                    <span className="mt-5 block text-xl font-black">
                      Website öffnen
                    </span>
                    <span className="mt-2 block text-sm text-neutral-400">
                      Live-Ansicht
                    </span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setActiveTab("clients")}
                    className="group rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6 text-left transition hover:-translate-y-1 hover:bg-white/[0.12]"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition group-hover:bg-white/15">
                      <Users className="h-5 w-5" />
                    </span>
                    <span className="mt-5 block text-xl font-black">
                      Kunden öffnen
                    </span>
                    <span className="mt-2 block text-sm text-neutral-400">
                      Galerien verwalten
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("reviews")}
                    className="group rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6 text-left transition hover:-translate-y-1 hover:bg-white/[0.12]"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition group-hover:bg-white/15">
                      <MessageSquare className="h-5 w-5" />
                    </span>
                    <span className="mt-5 block text-xl font-black">
                      Bewertungen prüfen
                    </span>
                    <span className="mt-2 block text-sm text-neutral-400">
                      {pendingReviews.length} offene Bewertung
                      {pendingReviews.length === 1 ? "" : "en"}.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="group rounded-[1.5rem] border border-red-400/20 bg-red-500/10 p-6 text-left text-red-50 transition hover:-translate-y-1 hover:bg-red-500/15"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 transition group-hover:bg-red-500/20">
                      <LogOut className="h-5 w-5" />
                    </span>
                    <span className="mt-5 block text-xl font-black">
                      Ausloggen
                    </span>
                    <span className="mt-2 block text-sm text-red-100/70">
                      Admin-Sitzung beenden.
                    </span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === "system" && (
              <div className="mt-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-neutral-400">
                      Protokoll
                    </p>
                    <h2 className="mt-3 text-3xl font-black">
                      Sicherheit & Verlauf
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      await Promise.all([
                        loadActivityLogs(),
                        loadSecurityChecks(),
                      ]);
                      showMessage("Systemstatus wurde aktualisiert.", "success");
                    }}
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Aktualisieren
                  </button>
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                  <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-100">
                        <ShieldCheck className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-xl font-black">
                          Sicherheitscheck
                        </h3>
                        <p className="mt-1 text-sm text-neutral-400">
                          Supabase, Buckets und Tabellen.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3">
                      {securityChecks.length === 0 && (
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-400">
                          Noch keine Prüfung geladen.
                        </div>
                      )}

                      {securityChecks.map((check) => (
                        <div
                          key={check.key}
                          className={`rounded-2xl border p-4 ${
                            check.ok
                              ? "border-emerald-400/20 bg-emerald-400/10"
                              : "border-yellow-400/25 bg-yellow-400/10"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                check.ok
                                  ? "bg-emerald-400 text-neutral-950"
                                  : "bg-yellow-400 text-neutral-950"
                              }`}
                            >
                              {check.ok ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="font-black">{check.label}</p>
                              <p className="mt-1 text-sm leading-6 text-neutral-300">
                                {check.detail}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white">
                          <Clock className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="text-xl font-black">
                            Aktivitätsverlauf
                          </h3>
                          <p className="mt-1 text-sm text-neutral-400">
                            Die letzten Admin-Aktionen.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearActivityLogs}
                        disabled={activityLogs.length === 0}
                        className="inline-flex w-fit items-center justify-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                        Verlauf leeren
                      </button>
                    </div>

                    <div className="mt-5 max-h-[560px] space-y-3 overflow-y-auto pr-1">
                      {activityLogs.length === 0 && (
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-400">
                          Noch keine Einträge. Falls die Tabelle fehlt, die
                          aktuelle SQL-Datei in Supabase ausführen.
                        </div>
                      )}

                      {activityLogs.map((log) => (
                        <article
                          key={log.id}
                          className="rounded-2xl border border-white/10 bg-black/20 p-4"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="font-black">{log.action}</p>
                              {log.label && (
                                <p className="mt-1 truncate text-sm text-neutral-300">
                                  {log.label}
                                </p>
                              )}
                              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-neutral-500">
                                {log.target_type}
                                {log.target_id ? ` · ${log.target_id}` : ""}
                              </p>
                            </div>
                            <span className="shrink-0 text-sm text-neutral-500">
                              {formatDate(log.created_at)}
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {activeTab === "user-errors" && (
              <div className="mt-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-neutral-400">
                      Nutzerfehler
                    </p>
                    <h2 className="mt-3 text-3xl font-black">
                      Meldungen von Besuchern
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
                      Technische Fehler und sichtbare Fehlermeldungen aus der
                      Website. Inhalte aus Formularen werden nicht gespeichert.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadUserErrors}
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Neu laden
                  </button>
                </div>

                <div className="mt-6 grid gap-4">
                  {userErrorsLoadError && (
                    <div className="rounded-[1.5rem] border border-red-400/25 bg-red-500/10 p-6 text-red-100">
                      <p className="text-sm font-black uppercase tracking-[0.22em]">
                        Nutzerfehler konnten nicht geladen werden
                      </p>
                      <p className="mt-3 break-words text-sm leading-6 text-red-100/80">
                        {userErrorsLoadError}
                      </p>
                    </div>
                  )}

                  {!userErrorsLoadError && userErrors.length === 0 && (
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6 text-neutral-300">
                      Noch keine Nutzerfehler vorhanden.
                    </div>
                  )}

                  {userErrors.map((errorLog) => (
                    <article
                      key={errorLog.id}
                      className={`rounded-[1.5rem] border p-5 ${
                        errorLog.is_resolved
                          ? "border-white/10 bg-white/[0.05] opacity-70"
                          : "border-red-400/20 bg-red-500/10"
                      }`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black ${
                                errorLog.is_resolved
                                  ? "bg-neutral-700 text-neutral-200"
                                  : "bg-red-400 text-neutral-950"
                              }`}
                            >
                              {errorLog.is_resolved ? "Erledigt" : "Offen"}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-neutral-300">
                              {errorLog.type || "client"}
                            </span>
                            <span className="text-sm text-neutral-500">
                              {formatDate(errorLog.created_at)}
                            </span>
                          </div>

                          <h3 className="mt-4 text-xl font-black">
                            {errorLog.source || errorLog.page || "Website"}
                          </h3>
                          <p className="mt-2 break-words leading-7 text-neutral-200">
                            {errorLog.message}
                          </p>
                          {errorLog.page && (
                            <p className="mt-3 text-sm text-neutral-400">
                              Seite: {errorLog.page}
                            </p>
                          )}

                          {(errorLog.stack || errorLog.user_agent) && (
                            <details className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                              <summary className="cursor-pointer text-sm font-bold text-neutral-300">
                                Details anzeigen
                              </summary>
                              {errorLog.stack && (
                                <pre className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-black/30 p-3 text-xs leading-5 text-neutral-400">
                                  {errorLog.stack}
                                </pre>
                              )}
                              {errorLog.user_agent && (
                                <p className="mt-3 break-words text-xs leading-5 text-neutral-500">
                                  {errorLog.user_agent}
                                </p>
                              )}
                            </details>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setUserErrorResolved(
                                errorLog,
                                !errorLog.is_resolved
                              )
                            }
                            className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition ${
                              errorLog.is_resolved
                                ? "border border-white/10 bg-white/10 text-white hover:bg-white/15"
                                : "bg-white text-neutral-950 hover:-translate-y-0.5 hover:shadow-xl"
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {errorLog.is_resolved ? "Wieder öffnen" : "Erledigt"}
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteUserError(errorLog)}
                            className="inline-flex w-fit items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-black text-red-100 transition hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                            Löschen
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
            </div>
          </section>
        )}
      </div>

      {cropSession && activeCropFile && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/80 p-4 backdrop-blur-xl">
          <div className="mx-auto my-6 w-full max-w-5xl rounded-[2rem] border border-white/15 bg-neutral-950 p-5 text-white shadow-2xl sm:p-7">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-200/70">
                  Bild vorbereiten {cropConfirmationText}
                </p>
                <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                  {cropSession.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
                  {cropSession.description}
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
                  Ziehen zum Verschieben · Mausrad oder Pinch zum Zoomen
                </p>
              </div>
              <button
                type="button"
                onClick={closeCropSession}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/15"
                aria-label="Zuschnitt schließen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-4">
                <div
                  ref={cropFrameRef}
                  onPointerDown={handleCropPointerDown}
                  onPointerMove={handleCropPointerMove}
                  onPointerUp={handleCropPointerEnd}
                  onPointerCancel={handleCropPointerEnd}
                  onPointerLeave={handleCropPointerEnd}
                  onWheel={handleCropWheel}
                  className="mx-auto max-h-[68vh] max-w-full touch-none select-none overflow-hidden rounded-2xl border border-yellow-300/30 bg-neutral-900 cursor-grab active:cursor-grabbing"
                  style={{
                    aspectRatio: `${cropAspectWidth} / ${cropAspectHeight}`,
                  }}
                >
                  {cropPreview && (
                    <img
                      src={cropPreview}
                      alt="Zuschnitt-Vorschau"
                      className="h-full w-full object-cover"
                      style={{
                        objectPosition: `${cropX}% ${cropY}%`,
                        transform: `scale(${cropZoom})`,
                        transformOrigin: `${cropX}% ${cropY}%`,
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
                <p className="break-all text-sm font-black text-white">
                  {activeCropFile.name}
                </p>
                <div className="mt-3 space-y-2 text-xs leading-5 text-neutral-400">
                  <p>
                    Raster: {cropAspectWidth}:{cropAspectHeight}
                  </p>
                  <p>
                    Ausgabe: {cropSession.outputWidth} x {cropSession.outputHeight}px
                  </p>
                  <p>
                    Original:{" "}
                    {cropImageSize
                      ? `${cropImageSize.width} x ${cropImageSize.height}px`
                      : "wird gelesen..."}
                  </p>
                </div>

                <label className="mt-6 block">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
                    Zoom
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="2.8"
                    step="0.01"
                    value={cropZoom}
                    onChange={(event) => setCropZoom(Number(event.target.value))}
                    className="mt-3 w-full accent-yellow-300"
                  />
                </label>

                <label className="mt-5 block">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
                    Links / Rechts
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={cropX}
                    onChange={(event) => setCropX(Number(event.target.value))}
                    className="mt-3 w-full accent-yellow-300"
                  />
                </label>

                <label className="mt-5 block">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
                    Oben / Unten
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={cropY}
                    onChange={(event) => setCropY(Number(event.target.value))}
                    className="mt-3 w-full accent-yellow-300"
                  />
                </label>

                <div className="mt-6 grid gap-3">
                  <button
                    type="button"
                    onClick={() => finishCropStep()}
                    disabled={cropBusy}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-300 px-5 py-3 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
                  >
                    <ImageIcon className="h-4 w-4" />
                    {cropBusy ? "Wird vorbereitet..." : "Zuschnitt übernehmen"}
                  </button>
                  <button
                    type="button"
                    onClick={() => finishCropStep({ useOriginal: true })}
                    disabled={cropBusy}
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold transition hover:bg-white/15 disabled:opacity-60"
                  >
                    Original übernehmen
                  </button>
                  <button
                    type="button"
                    onClick={closeCropSession}
                    disabled={cropBusy}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold text-neutral-400 transition hover:bg-white/10 disabled:opacity-60"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-5 backdrop-blur-lg">
          <div className="w-full max-w-lg rounded-[2rem] border border-red-400/20 bg-neutral-950 p-6 text-white shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-100">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-red-200/70">
                  Sicherheitsabfrage
                </p>
                <h2 className="mt-3 text-2xl font-black">
                  {confirmAction.title}
                </h2>
                <p className="mt-3 leading-7 text-neutral-300">
                  {confirmAction.description}
                </p>
              </div>
            </div>

            {confirmationRequired && (
              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-red-400/15 bg-red-500/10 p-4">
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(event) => setConfirmChecked(event.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-red-300/40 accent-red-400"
                />
                <span className="text-sm leading-6 text-red-50/85">
                  Ich bestätige, dass diese Aktion dauerhaft ausgeführt werden
                  soll.
                </span>
              </label>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setConfirmAction(null);
                  setConfirmChecked(false);
                }}
                disabled={confirmBusy}
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold transition hover:bg-white/15 disabled:opacity-60"
              >
                {confirmAction.cancelLabel}
              </button>
              <button
                type="button"
                onClick={runConfirmedAction}
                disabled={confirmBusy || (confirmationRequired && !confirmChecked)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-red-400/30 bg-red-500/20 px-5 py-3 text-sm font-black text-red-50 transition hover:bg-red-500/30 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {confirmBusy ? "Wird ausgeführt..." : confirmAction.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5 backdrop-blur-lg">
          <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/15 bg-neutral-950 text-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">
                  Bildvorschau
                </p>
                <p className="mt-1 font-bold">
                  {selectedImage.title ||
                    selectedImage.filename ||
                    CATEGORIES.find(
                      (category) => category.value === selectedImage.category
                    )?.label ||
                    selectedImage.category ||
                    "Bildvorschau"}
                </p>
                {selectedImage.note && (
                  <p className="mt-1 max-w-xl text-sm text-neutral-400">
                    {selectedImage.note}
                  </p>
                )}
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

            {selectedImage.url ? (
              <img
                src={selectedImage.url}
                alt=""
                className="max-h-[72vh] w-full object-contain bg-black"
              />
            ) : (
              <div className="flex min-h-[320px] items-center justify-center bg-black px-6 text-center text-sm font-bold text-neutral-400">
                Bildlink konnte nicht erstellt werden. Bitte Galerie neu laden
                oder Supabase Storage prüfen.
              </div>
            )}

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
                  disabled={!selectedImage.url}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/15"
                >
                  <Copy className="h-4 w-4" />
                  URL kopieren
                </button>
                {selectedImage.url && (
                  <a
                    href={selectedImage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/15"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Original öffnen
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
