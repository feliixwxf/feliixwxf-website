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
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  Type,
  Upload,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { value: "car", label: "Car" },
  { value: "portrait", label: "Portrait" },
  { value: "nature", label: "Nature & Street" },
  { value: "event", label: "Event" },
];

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
};

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
    label: "Kontakt-Ueberschrift",
    helper: "Grosse Ueberschrift im Kontaktbereich.",
    placeholder: "Lass uns dein Shooting planen.",
    icon: Type,
  },
  {
    key: "contact_intro",
    label: "Kontakt-Text",
    helper: "Kurzer Satz direkt unter der Ueberschrift.",
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
    helper: "Vollstaendiger Link zum Profil.",
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
    helper: "Formspree-Link fuer das Kontaktformular.",
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
      helper: "Projekt fuer spaeteren Download/Account vorbereiten.",
      tone: "border-yellow-400/25 bg-yellow-400/10 text-yellow-100",
    };
  }

  if (!gallery?.client_informed) {
    return {
      label: "Kunde informieren",
      helper: "Galerie ist bereit zur Rueckmeldung an den Kunden.",
      tone: "border-emerald-400/25 bg-emerald-400/10 text-emerald-100",
    };
  }

  return {
    label: "Bereit zum Abschliessen",
    helper: "Alle Workflow-Punkte sind erledigt.",
    tone: "border-emerald-400/25 bg-emerald-400/10 text-emerald-100",
  };
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [images, setImages] = useState([]);
  const [clientGalleries, setClientGalleries] = useState([]);
  const [siteAssets, setSiteAssets] = useState({});
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [settingsDraft, setSettingsDraft] = useState(DEFAULT_SITE_SETTINGS);
  const [clientGalleryForm, setClientGalleryForm] = useState(
    DEFAULT_CLIENT_GALLERY_FORM
  );
  const [activeClientGalleryId, setActiveClientGalleryId] = useState("");
  const [clientGallerySearch, setClientGallerySearch] = useState("");
  const [clientGalleryStatusFilter, setClientGalleryStatusFilter] =
    useState("all");
  const [clientGallerySortMode, setClientGallerySortMode] = useState("newest");
  const [clientGalleryFile, setClientGalleryFile] = useState(null);
  const [imageCategory, setImageCategory] = useState("car");
  const [imageFile, setImageFile] = useState(null);
  const [imageDrafts, setImageDrafts] = useState({});
  const [imageSearch, setImageSearch] = useState("");
  const [imageCategoryFilter, setImageCategoryFilter] = useState("all");
  const [imageSortMode, setImageSortMode] = useState("manual");
  const [selectedImageIds, setSelectedImageIds] = useState([]);
  const [siteAssetFiles, setSiteAssetFiles] = useState({});
  const [siteAssetPreviews, setSiteAssetPreviews] = useState({});
  const [activeTab, setActiveTab] = useState("dashboard");
  const [reviewFilter, setReviewFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [clientGalleryUploading, setClientGalleryUploading] = useState(false);
  const [siteAssetUploadingKey, setSiteAssetUploadingKey] = useState(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [busyId, setBusyId] = useState(null);
  const [busyImageId, setBusyImageId] = useState(null);
  const [busyClientGalleryId, setBusyClientGalleryId] = useState(null);
  const [busyClientImageId, setBusyClientImageId] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [clientGalleryPreview, setClientGalleryPreview] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

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
  const tabs = [
    {
      value: "dashboard",
      label: "Start",
      description: "Uebersicht und Schnellzugriff",
      icon: LayoutDashboard,
    },
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
      value: "clients",
      label: "Kunden",
      description: "Private Galerien und Codes",
      count: clientGalleries.length,
      icon: Users,
    },
    {
      value: "texts",
      label: "Texte",
      description: "Startseite, Info und Bewertung",
      icon: Type,
    },
    {
      value: "contact",
      label: "Kontakt",
      description: "E-Mail, Telefon und Links",
      icon: Mail,
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
  const activeClientGallery =
    clientGalleries.find((gallery) => gallery.id === activeClientGalleryId) ||
    clientGalleries[0];
  const activeClientChecklistDone = getClientChecklistDone(activeClientGallery);
  const activeClientProjectStep = getClientProjectStep(activeClientGallery);
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

  const refreshDashboard = async () => {
    setMessage("");
    await Promise.all([
      loadReviews(),
      loadImages(),
      loadClientGalleries(),
      loadSiteAssets(),
      loadSiteSettings(),
    ]);
    showMessage("Admin-Daten wurden neu geladen.", "success");
  };

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
          ]);
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
    await Promise.all([
      loadReviews(),
      loadImages(),
      loadClientGalleries(),
      loadSiteAssets(),
      loadSiteSettings(),
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
      showMessage("Einladung wurde zum Kopieren geoeffnet.", "success");
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

  const uploadImage = async (event) => {
    event.preventDefault();

    if (imageUploading) return;

    if (!imageFile) {
      showMessage("Bitte zuerst ein Bild auswaehlen.", "error");
      return;
    }

    const form = event.currentTarget;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 60000);

    setImageUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("category", imageCategory);
      formData.append("file", imageFile);

      const response = await fetch("/api/admin/images", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Bild konnte nicht hochgeladen werden.");
      }

      if (!data.image) {
        throw new Error("Upload war erfolgreich, aber die Bilddaten fehlen.");
      }

      setImages((current) => [data.image, ...current]);
      setImageDrafts((current) => ({
        ...current,
        [data.image.id]: {
          title: data.image.title || "",
          note: data.image.note || "",
        },
      }));
      setImageFile(null);
      form.reset();
      showMessage(
        "Bild wurde hochgeladen und ist jetzt in der Galerie.",
        "success"
      );
    } catch (error) {
      showMessage(
        error?.name === "AbortError"
          ? "Upload dauert zu lange. Bitte Bild verkleinern und erneut versuchen."
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
    showMessage("Kundengalerie wurde erstellt.", "success");
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
          "client_informed",
        ].some((field) => details.includes(field));

        setClientGalleries(previousGalleries);
        showMessage(
          missingWorkflowField
            ? "Bitte die aktualisierte supabase-client-galleries.sql in Supabase ausführen. Wichtig: Die letzte Zeile laedt den Supabase-Cache neu."
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

  const deleteClientGallery = async (gallery) => {
    if (
      !window.confirm(
        `Kundengalerie "${gallery.title}" inklusive Bilder wirklich loeschen?`
      )
    ) {
      return;
    }

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
        data.error || "Kundengalerie konnte nicht geloescht werden.",
        "error"
      );
      setBusyClientGalleryId(null);
      return;
    }

    const nextGalleries = clientGalleries.filter((item) => item.id !== gallery.id);
    setClientGalleries(nextGalleries);
    setActiveClientGalleryId(nextGalleries[0]?.id || "");
    showMessage("Kundengalerie wurde geloescht.", "success");
    setBusyClientGalleryId(null);
  };

  const uploadClientGalleryImage = async (event) => {
    event.preventDefault();

    if (clientGalleryUploading) return;

    if (!activeClientGallery) {
      showMessage("Bitte zuerst eine Kundengalerie erstellen.", "error");
      return;
    }

    if (!clientGalleryFile) {
      showMessage("Bitte zuerst ein Kundenbild auswaehlen.", "error");
      return;
    }

    const form = event.currentTarget;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 60000);

    setClientGalleryUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("galleryId", activeClientGallery.id);
      formData.append("file", clientGalleryFile);

      const response = await fetch("/api/admin/client-gallery-images", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || "Kundenbild konnte nicht hochgeladen werden."
        );
      }

      setClientGalleries((current) =>
        current.map((gallery) => {
          if (gallery.id !== activeClientGallery.id) return gallery;

          const nextImages = [data.image, ...(gallery.images || [])];

          return {
            ...gallery,
            images: nextImages,
            image_count: nextImages.length,
          };
        })
      );
      setClientGalleryFile(null);
      form.reset();
      showMessage("Kundenbild wurde hochgeladen.", "success");
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

  const deleteClientGalleryImage = async (gallery, image) => {
    if (!window.confirm("Dieses Kundenbild wirklich loeschen?")) return;

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
        data.error || "Kundenbild konnte nicht geloescht werden.",
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
          image_count: nextImages.length,
          favorite_count: nextFavorites.length,
        };
      })
    );
    showMessage("Kundenbild wurde geloescht.", "success");
    setBusyClientImageId(null);
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
      showMessage("Bitte zuerst eine Kundengalerie auswaehlen.", "error");
      return;
    }

    const customerName = activeClientGallery.client_name?.trim();
    const galleryUrl = `${window.location.origin}/kunden?code=${encodeURIComponent(
      activeClientGallery.access_code
    )}`;
    const accountUrl = `${window.location.origin}/konto`;
    const inviteText = [
      `Hallo${customerName ? ` ${customerName}` : ""},`,
      "",
      `deine Galerie "${activeClientGallery.title}" ist bereit.`,
      "",
      `Direktlink: ${galleryUrl}`,
      `Code: ${activeClientGallery.access_code}`,
      activeClientGallery.client_email
        ? `Kundenkonto: ${accountUrl}`
        : "",
      "",
      activeClientGallery.downloads_enabled
        ? "Downloads sind freigeschaltet, du kannst deine Bilder direkt herunterladen."
        : "Du kannst deine Favoriten markieren, damit ich die Auswahl sehen kann.",
      activeClientGallery.client_email
        ? "Wenn du dich mit derselben E-Mail im Kundenkonto anmeldest, findest du die Galerie dort ebenfalls."
        : "",
      "",
      "Liebe Gruesse",
      "Felix",
    ]
      .filter((line, index, lines) => line || lines[index - 1])
      .join("\n");

    copyText(inviteText, "Kunden-Einladung wurde kopiert.");
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

  const updateSettingsDraft = (key, value) => {
    setSettingsDraft((current) => ({
      ...current,
      [key]: value,
    }));
    setMessage("");
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
    setSelectedImageIds((current) => current.filter((id) => id !== image.id));
    showMessage("Bild wurde aus der Galerie geloescht.", "success");
    setBusyImageId(null);
  };

  const toggleImageSelection = (imageId) => {
    setSelectedImageIds((current) =>
      current.includes(imageId)
        ? current.filter((id) => id !== imageId)
        : [...current, imageId]
    );
  };

  const toggleVisibleImageSelection = () => {
    setSelectedImageIds((current) => {
      if (allVisibleImagesSelected) {
        return current.filter((id) => !visibleImageIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleImageIds]));
    });
  };

  const deleteSelectedImages = async () => {
    if (selectedImages.length === 0) return;

    if (
      !window.confirm(
        `${selectedImages.length} ausgewaehlte Bilder wirklich loeschen?`
      )
    ) {
      return;
    }

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
        data.error || "Mindestens ein Bild konnte nicht geloescht werden.",
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
    showMessage("Ausgewaehlte Bilder wurden geloescht.", "success");
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
      <div className="mx-auto max-w-[1600px]">
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
            ADMIN_PASSWORD fehlt oder ADMIN_SESSION_SECRET ist kuerzer als 32 Zeichen.
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
          <section className="mt-10 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
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
                    <p className="mt-3 max-w-2xl text-neutral-300">
                      Von hier aus kommst du direkt zu den Bereichen, die du am
                      haeufigsten brauchst.
                    </p>
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
                    <p className="mt-2 text-sm leading-6 text-yellow-100/75">
                      Bewertungen pruefen, freigeben oder direkt loeschen.
                    </p>
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
                    <p className="mt-2 text-sm leading-6 text-neutral-300">
                      Neue Bilder hochladen, Reihenfolge sortieren oder alte
                      Bilder entfernen.
                    </p>
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
                    <p className="mt-2 text-sm leading-6 text-neutral-300">
                      Startseitenbilder und Portfolio-Kacheln getrennt von der
                      Galerie pflegen.
                    </p>
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
                    <p className="mt-2 text-sm leading-6 text-neutral-300">
                      Private Galerien mit Zugangscode und Favoriten.
                    </p>
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
                    <p className="mt-2 text-sm leading-6 text-neutral-300">
                      E-Mail, Telefon, Instagram und Formular-Link bearbeiten.
                    </p>
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
                      <span className="mt-2 block max-w-2xl text-sm leading-6 text-neutral-300">
                        Startseite, Info, Portfolio und Bewertungsbereich ohne
                        Code-Anpassung pflegen.
                      </span>
                    </span>
                    <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-neutral-950">
                      Öffnen
                    </span>
                  </button>
                </div>

                <section className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">
                        Kundenprojekte
                      </p>
                      <h3 className="mt-2 text-2xl font-black">
                        Projekt-Pipeline
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
                        Schlanke Uebersicht fuer laufende Kundengalerien. Das ist
                        die Basis fuer spaetere Kundenkonten.
                      </p>
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
                            <span
                              className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${step.tone}`}
                            >
                              {step.label}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </section>

                <div className="mt-8 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
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
                        Direkt testen, ob deine Aenderungen vorne sichtbar sind.
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
                        <option value="oldest">Aelteste zuerst</option>
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
                      Sichtbare Bilder auswaehlen
                    </label>

                    {selectedImageIds.length > 0 && (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                          {selectedImageIds.length} ausgewaehlt
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
                          Ausgewaehlte loeschen
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

                  {displayedImageCategories.map((category) => (
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
                              className={`overflow-hidden rounded-[1.5rem] border bg-white/[0.08] backdrop-blur-md ${
                                selectedImageIds.includes(image.id)
                                  ? "border-yellow-400/70"
                                  : "border-white/10"
                              }`}
                            >
                              <div className="relative aspect-[4/3] bg-black/30">
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

            {activeTab === "clients" && (
              <div className="mt-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-neutral-400">
                      Kunden
                    </p>
                    <h2 className="mt-3 text-3xl font-black">
                      Private Galerien
                    </h2>
                    <p className="mt-3 max-w-2xl text-neutral-300">
                      Erstelle fuer Kunden einen Code, lade Bilder nur in diese
                      Galerie und pruefe spaeter die markierten Favoriten.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
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
                        placeholder="Optional, später fürs Kundenkonto"
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
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">
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
                            <span
                              className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ${
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
                            <div
                              className={`mt-3 max-w-xl rounded-2xl border px-4 py-3 text-sm ${activeClientProjectStep.tone}`}
                            >
                              <p className="font-black">
                                Nächster Schritt: {activeClientProjectStep.label}
                              </p>
                              <p className="mt-1 text-xs opacity-80">
                                {activeClientProjectStep.helper}
                              </p>
                            </div>
                          </div>

                          <div className="flex min-w-0 flex-wrap gap-2 lg:justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                copyText(
                                  activeClientGallery.access_code,
                                  "Galerie-Code wurde kopiert."
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/15"
                            >
                              <Copy className="h-4 w-4" />
                              Code
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                copyText(
                                  `${window.location.origin}/kunden?code=${encodeURIComponent(
                                    activeClientGallery.access_code
                                  )}`,
                                  "Direktlink wurde kopiert."
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/15"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Link
                            </button>
                            <button
                              type="button"
                              onClick={copyClientGalleryInvite}
                              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/15"
                            >
                              <Mail className="h-4 w-4" />
                              Einladung
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateClientGallery(
                                  activeClientGallery,
                                  {
                                    is_active: !activeClientGallery.is_active,
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
                                busyClientGalleryId === activeClientGallery.id
                              }
                              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/15 disabled:opacity-60"
                            >
                              {activeClientGallery.is_active ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                              {activeClientGallery.is_active
                                ? "Pausieren"
                                : "Aktivieren"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateClientGallery(
                                  activeClientGallery,
                                  getClientGalleryStatus(activeClientGallery) ===
                                    "completed"
                                    ? { status: "active", is_active: true }
                                    : { status: "completed", is_active: true },
                                  getClientGalleryStatus(activeClientGallery) ===
                                    "completed"
                                    ? "Kundengalerie ist wieder aktiv."
                                    : "Kundengalerie wurde abgeschlossen."
                                )
                              }
                              disabled={
                                busyClientGalleryId === activeClientGallery.id
                              }
                              className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-300/10 px-4 py-2 text-sm font-bold text-sky-100 transition hover:bg-sky-300/20 disabled:opacity-60"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              {getClientGalleryStatus(activeClientGallery) ===
                              "completed"
                                ? "Wieder aktiv"
                                : "Abschließen"}
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
                                busyClientGalleryId === activeClientGallery.id
                              }
                              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/15 disabled:opacity-60"
                            >
                              {activeClientGallery.downloads_enabled
                                ? "Downloads aus"
                                : "Downloads an"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                deleteClientGallery(activeClientGallery)
                              }
                              disabled={
                                busyClientGalleryId === activeClientGallery.id
                              }
                              className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-100 transition hover:bg-red-500/20 disabled:opacity-60"
                            >
                              <Trash2 className="h-4 w-4" />
                              Löschen
                            </button>
                          </div>
                        </div>

                        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 lg:col-span-2">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <h4 className="font-black">Kundendaten</h4>
                                <p className="mt-1 text-sm text-neutral-500">
                                  Grundlage fuer spaetere Kundenkonten.
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
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <h4 className="font-black">Interne Notiz</h4>
                                <p className="mt-1 text-sm text-neutral-500">
                                  Nur im Admin sichtbar.
                                </p>
                              </div>
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
                                  busyClientGalleryId === activeClientGallery.id
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

                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="font-black">
                                  Abschluss-Checkliste
                                </h4>
                                <p className="mt-1 text-sm text-neutral-500">
                                  {activeClientChecklistDone}/
                                  {CLIENT_GALLERY_CHECKLIST.length} erledigt
                                </p>
                              </div>
                              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-neutral-300">
                                Workflow
                              </span>
                            </div>

                            <div className="mt-4 grid gap-2">
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
                        </section>

                        <form
                          onSubmit={uploadClientGalleryImage}
                          className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
                        >
                          <label className="block min-w-0">
                            <span className="text-sm font-semibold text-neutral-300">
                              Kundenbild hochladen
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-neutral-500">
                              Originaldatei bis 15 MB. Fuer fluessiges Laden sind
                              JPG/WebP mit ca. 2000-3000 px Kantenlaenge ideal.
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(event) => {
                                setClientGalleryFile(
                                  event.target.files?.[0] || null
                                );
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
                              ? "Laedt hoch..."
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
                                    Ausgewaehltes Kundenbild
                                  </p>
                                  <p className="mt-1 break-all text-sm text-neutral-300">
                                    {clientGalleryFile?.name}
                                  </p>
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
                                    <img
                                      src={image.url}
                                      alt=""
                                      loading="lazy"
                                      decoding="async"
                                      className="aspect-square h-full w-full object-cover"
                                    />
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

                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {(activeClientGallery.images || []).length === 0 && (
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-neutral-400 sm:col-span-2 lg:col-span-3">
                              Noch keine Bilder in dieser Kundengalerie.
                            </div>
                          )}

                          {(activeClientGallery.images || []).map((image) => {
                            const favoriteCount = (
                              activeClientGallery.favorites || []
                            ).filter(
                              (favorite) => favorite.image_id === image.id
                            ).length;

                            return (
                              <article
                                key={image.id}
                                className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                              >
                                <div className="relative aspect-[4/3]">
                                  <img
                                    src={image.url}
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-cover"
                                  />
                                  {favoriteCount > 0 && (
                                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                                      <Heart className="h-3.5 w-3.5 fill-current" />
                                      {favoriteCount}
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
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-300">
                            {group.description}
                          </p>
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
                      geschuetzt. Nach mehreren falschen Login-Versuchen wird
                      kurz gebremst.
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
