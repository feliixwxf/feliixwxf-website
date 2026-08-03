"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Download,
  Phone,
  Star,
  Menu,
  X,
  ArrowLeft,
  ArrowRight,
  Settings,
  Sun,
  Moon,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReportUserErrorButton from "@/components/report-user-error-button";
import FaqChatbot from "@/components/faq-chatbot";

const DEFAULT_REVIEWS = [
  {
    name: "Lukas",
    stars: 5,
    text: "Mega entspannte Atmosphäre beim Shooting. Die Bilder wirken natürlich und trotzdem richtig hochwertig.",
  },
  {
    name: "Nele S.",
    stars: 4.5,
    text: "Sehr sauber bearbeitet und schnell geliefert. Genau der Look, den ich mir vorgestellt habe.",
  },
  {
    name: "Erik",
    stars: 4,
    text: "Richtig starke Ergebnisse und angenehme Zusammenarbeit. Würde definitiv nochmal ein Shooting buchen.",
  },
];

const REVIEW_AVATARS = Array.from({ length: 12 }, (_, index) => ({
  label: `Avatar ${index + 1}`,
  url: `/images/review-avatars/avatar-${index + 1}.svg`,
}));

function siteAssetImageUrl(key) {
  return `/api/site-assets/image/${key}`;
}

const DEFAULT_ARCHIVED_PORTFOLIO_KEYS = "nature";
const PORTFOLIO_GALLERY_KEYS = new Set(["car", "portrait", "nature", "event"]);

const LOCAL_SEO_SERVICES = [
  {
    title: "Portraits",
    text: "Natürliche Portraits in Hildburghausen, Eisfeld und Südthüringen - draußen, urban oder passend zu deinem Look.",
    href: "/fotograf-hildburghausen",
  },
  {
    title: "Hochzeiten",
    text: "Emotionale Hochzeitsmomente, Paarbilder und kleine Reportagen in Thüringen, Hildburghausen und Umgebung.",
    href: "/fotograf-hildburghausen",
  },
  {
    title: "Car Photography",
    text: "Dynamische Autofotos, Detailshots und Social-Media-Content für Fahrzeuge in Eisfeld, Südthüringen und Umgebung.",
    href: "/fotograf-eisfeld",
  },
  {
    title: "Events",
    text: "Unauffällige Eventfotos mit starkem Look für private Feiern, Abschlussmomente und geschäftliche Anlässe.",
    href: "/fotograf-eisfeld",
  },
];

const HOME_FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Wo bietet feliix.wxf Fotoshootings an?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "feliix.wxf fotografiert vor allem in Hildburghausen, Eisfeld, Südthüringen und Umgebung. Shootings in angrenzenden Regionen sind nach Absprache möglich.",
      },
    },
    {
      "@type": "Question",
      name: "Welche Shootings kann ich anfragen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Anfragen sind für Portraits, Hochzeiten, Car Photography, Events und moderne Bildbearbeitung möglich.",
      },
    },
    {
      "@type": "Question",
      name: "Wie schnell bekomme ich eine Antwort?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Anfragen werden unverbindlich geprüft und in der Regel zeitnah beantwortet.",
      },
    },
  ],
};

const DEFAULT_SITE_SETTINGS = {
  hero_eyebrow: "Fotografie & Editing",
  hero_title_line_1: "Bilder mit Charakter.",
  hero_title_line_2: "Bearbeitung mit Stil.",
  hero_intro:
    "Willkommen bei feliix.wxf. Moderne Fotografie, kreative Bearbeitung und visuelle Inhalte mit starkem Look in Eisfeld, Hildburghausen und Thüringen.",
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
  download_watermark_enabled: "false",
};

function InstagramIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function GmailIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.5 6.5h15v11h-15v-11Z"
        fill="white"
        stroke="#e5e7eb"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M5 7l7 5.2L19 7"
        stroke="#ea4335"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 17V8.2"
        stroke="#34a853"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M19 17V8.2"
        stroke="#4285f4"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M5 17h14"
        stroke="#fbbc05"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Section({ id, children, className = "" }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`relative z-0 scroll-mt-28 ${className}`}
    >
      {children}
    </motion.section>
  );
}

function isPlaceholderImageUrl(url = "") {
  return url.includes("images.unsplash.com");
}

function uniqueImageList(images) {
  const seen = new Set();

  return images.filter((image) => {
    if (!image || isPlaceholderImageUrl(image) || seen.has(image)) return false;
    seen.add(image);
    return true;
  });
}

function parseArchivedPortfolioKeys(value) {
  return new Set(
    String(value || "")
      .split(",")
      .map((key) => key.trim())
      .filter(Boolean)
  );
}

function normalizePortfolioImage(image) {
  if (typeof image === "string") {
    return { url: image, width: null, height: null };
  }

  return image || { url: "", width: null, height: null };
}

function getPortfolioImageUrl(image) {
  return normalizePortfolioImage(image).url;
}

function getPortfolioCoverAlt(item) {
  const altTexts = {
    car: "Car Photography von feliix.wxf in Thüringen mit professionellem Autofoto",
    portrait:
      "Portraitfotografie von feliix.wxf in Eisfeld, Hildburghausen und Südthüringen",
    nature:
      "Nature und Street Photography von feliix.wxf in Thüringen",
    event:
      "Eventfotografie von feliix.wxf in Eisfeld, Hildburghausen und Südthüringen",
  };

  return altTexts[item?.key] || `${item?.title || "Portfolio"} von feliix.wxf`;
}

function getPortfolioGalleryAlt(categoryTitle, image, index) {
  const normalizedImage = normalizePortfolioImage(image);

  if (normalizedImage.title) {
    return `${normalizedImage.title} - ${categoryTitle} von feliix.wxf`;
  }

  return `${categoryTitle} Portfoliofoto ${index + 1} von feliix.wxf`;
}

function MaintenanceView({ siteSettings }) {
  const contactEmailHref = `mailto:${siteSettings.contact_email}`;
  const contactPhoneHref = `tel:${siteSettings.contact_phone.replace(/[^\d+]/g, "")}`;

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#050505,#111113,#1f2023)] px-5 py-10 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-8 text-center shadow-2xl backdrop-blur-xl lg:text-left">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-yellow-300/25 bg-yellow-300/10 text-yellow-100 shadow-[0_0_50px_rgba(250,204,21,0.18)] lg:mx-0">
            <Settings className="h-10 w-10 animate-spin" />
          </div>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.32em] text-yellow-100/70">
            Wartungsarbeiten
          </p>
          <h1 className="mt-4 text-4xl font-black md:text-5xl">
            Wir sind gleich zurück.
          </h1>
          <p className="mt-5 max-w-md leading-8 text-neutral-300">
            Die Website wird gerade aktualisiert. Anfragen kannst du weiterhin
            direkt senden.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <a
              href={contactEmailHref}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-left transition hover:bg-white/[0.1]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                <GmailIcon className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs uppercase tracking-[0.22em] text-neutral-400">
                  E-Mail
                </span>
                <span className="block truncate text-sm font-semibold">
                  {siteSettings.contact_email}
                </span>
              </span>
            </a>

            <a
              href={contactPhoneHref}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-left transition hover:bg-white/[0.1]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                <Phone className="h-5 w-5 fill-current" />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-[0.22em] text-neutral-400">
                  Telefon
                </span>
                <span className="block text-sm font-semibold">
                  {siteSettings.contact_phone}
                </span>
              </span>
            </a>
          </div>
        </div>

        <form
          action={siteSettings.form_action}
          method="POST"
          className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-2xl backdrop-blur-xl"
        >
          <h2 className="text-2xl font-black">Anfrage senden</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-300">
            Das Kontaktformular bleibt auch während der Wartung aktiv.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              type="text"
              name="name"
              required
              placeholder="Dein Name"
              className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-neutral-950 outline-none"
            />
            <input
              type="email"
              name="email"
              required
              placeholder="Deine E-Mail"
              className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-neutral-950 outline-none"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Telefonnummer optional"
              className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-neutral-950 outline-none md:col-span-2"
            />
            <textarea
              name="message"
              required
              rows="5"
              placeholder="Deine Nachricht"
              className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-neutral-950 outline-none md:col-span-2"
            />

            <p className="text-xs leading-6 text-neutral-400 md:col-span-2">
              Deine Angaben werden zur Bearbeitung deiner Anfrage verarbeitet.
              Weitere Informationen findest du in den Datenschutzhinweisen.
            </p>

            <Button type="submit" className="rounded-2xl py-6 text-base md:col-span-2">
              Nachricht senden
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function FeliixWxfPhotography() {
  const sliderRef = useRef(null);
  const beforeRef = useRef(null);
  const lineRef = useRef(null);
  const handleRef = useRef(null);
  const reviewFormStartedAtRef = useRef(Date.now());
  const contactFormStartedAtRef = useRef(Date.now());
  const sliderFrameRef = useRef(null);
  const sliderPercentRef = useRef(50);

  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [activeGallery, setActiveGallery] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewAvatar, setReviewAvatar] = useState("");
  const [showReviewAvatars, setShowReviewAvatars] = useState(false);
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewMessageType, setReviewMessageType] = useState("info");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactSent, setContactSent] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [portfolioImagesLoaded, setPortfolioImagesLoaded] = useState(false);
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [siteSettingsLoaded, setSiteSettingsLoaded] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedPortfolioImage, setSelectedPortfolioImage] = useState(null);
  const [selectedPortfolioImageIndex, setSelectedPortfolioImageIndex] =
    useState(null);
  const [portfolioImageZoomed, setPortfolioImageZoomed] = useState(false);
  const [showImpressum, setShowImpressum] = useState(false);
  const [showDatenschutz, setShowDatenschutz] = useState(false);

  useEffect(() => {
    if (
      window.location.pathname === "/" &&
      window.location.hash === "#portfolio" &&
      !window.location.search
    ) {
      window.history.replaceState(null, "", "/");
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("datenschutz") === "1") {
      setShowDatenschutz(true);
      window.history.replaceState(null, "", "/");
    }

    const requestedGallery = params.get("galerie");
    if (PORTFOLIO_GALLERY_KEYS.has(requestedGallery)) {
      setActiveGallery(requestedGallery);
      if (params.has("bild")) {
        window.history.replaceState(
          null,
          "",
          `/?galerie=${encodeURIComponent(requestedGallery)}`
        );
      }
    }

    const savedTheme = localStorage.getItem("feliix-theme");

    if (savedTheme) setTheme(savedTheme);

    const loadReviews = () => {
      fetch("/api/reviews")
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (data?.reviews?.length) {
            setReviews([...data.reviews, ...DEFAULT_REVIEWS]);
          }
        })
        .catch(() => {
          setReviewMessageType("error");
          setReviewMessage(
            "Online-Bewertungen konnten gerade nicht geladen werden."
          );
        });
    };

    const loadAccountSession = () => {
      fetch("/api/account/session")
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (data?.authenticated && data.user) {
            setCurrentCustomer(data.user);
            setReviewName((current) => current || data.user.name || "");
          }
        })
        .catch(() => {});
    };

    const loadPortfolioImages = () => {
      return fetch("/api/portfolio-images")
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (Array.isArray(data?.images)) {
            setUploadedImages(data.images);
          }
        })
        .catch(() => {})
        .finally(() => setPortfolioImagesLoaded(true));
    };

    loadPortfolioImages();

    fetch("/api/site-settings", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.settings) {
          setSiteSettings((current) => ({ ...current, ...data.settings }));
        }
        setSiteSettingsLoaded(true);
      })
      .catch(() => {
        setSiteSettingsLoaded(true);
      });

    const secondaryLoadTimer = window.setTimeout(() => {
      loadReviews();
      loadAccountSession();
    }, 650);

    const handlePopState = () => {
      const nextParams = new URLSearchParams(window.location.search);
      const nextGallery = nextParams.get("galerie");

      setSelectedPortfolioImage(null);
      setSelectedPortfolioImageIndex(null);
      setPortfolioImageZoomed(false);
      setActiveGallery(
        PORTFOLIO_GALLERY_KEYS.has(nextGallery) ? nextGallery : null
      );
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      clearTimeout(secondaryLoadTimer);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("feliix-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (activeGallery) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeGallery]);

  useEffect(() => {
    if (
      showAllReviews ||
      selectedReview ||
      selectedPortfolioImage ||
      showImpressum ||
      showDatenschutz
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [
    showAllReviews,
    selectedReview,
    selectedPortfolioImage,
    showImpressum,
    showDatenschutz,
  ]);

  useEffect(() => {
    return () => {
      if (sliderFrameRef.current) {
        cancelAnimationFrame(sliderFrameRef.current);
      }
    };
  }, []);

  const dark = theme === "dark";
  const accountLabel =
    String(currentCustomer?.name || "").trim() ||
    String(currentCustomer?.email || "").trim() ||
    "Konto";

  const navItems = ["Startseite", "Info", "Portfolio", "Bewertung", "Kontakt"];
  const contactEmailHref = `mailto:${siteSettings.contact_email}`;
  const contactPhoneHref = `tel:${siteSettings.contact_phone.replace(/[^\d+]/g, "")}`;
  const reviewCount = reviews.length;
  const reviewAverage =
    reviewCount > 0
      ? reviews.reduce((sum, review) => sum + Number(review.stars || 0), 0) /
        reviewCount
      : 0;
  const formattedReviewAverage = reviewAverage.toLocaleString("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const contactHeading =
    siteSettings.contact_heading === DEFAULT_SITE_SETTINGS.contact_heading
      ? "Jetzt Termin unverbindlich anfragen."
      : siteSettings.contact_heading;
  const contactIntro =
    siteSettings.contact_intro === DEFAULT_SITE_SETTINGS.contact_intro
      ? "Schreib mir direkt über das Formular. In der Regel bekommst du innerhalb von 24 Stunden eine Antwort."
      : siteSettings.contact_intro;
  const maintenanceActive =
    siteSettingsLoaded && String(siteSettings.maintenance_mode) === "true";

  const pageStyle = dark
    ? "bg-[linear-gradient(135deg,#080808,#151515,#242427)] text-white"
    : "bg-[linear-gradient(135deg,#f4f4f5,#e7e5e4,#fafafa)] text-neutral-950";

  const glass = dark
    ? "border-white/12 bg-white/[0.08] text-white backdrop-blur-md"
    : "border-white/70 bg-white/80 text-neutral-950 backdrop-blur-md shadow-lg";

  const muted = dark ? "text-neutral-300" : "text-neutral-700";

  const hoverLift =
    "transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.01]";

  const buttonHover =
    "transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.02]";

  const scrollToSection = (id) => {
    setActiveGallery(null);

    if (window.location.search.includes("galerie=")) {
      window.history.pushState(null, "", `/#${id.toLowerCase()}`);
    }

    setTimeout(() => {
      document
        .getElementById(id.toLowerCase())
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);

    setMenuOpen(false);
  };

  const openPortfolioGallery = (key) => {
    setActiveGallery(key);
    closePortfolioImage();

    const nextUrl = `/?galerie=${encodeURIComponent(key)}`;
    if (window.location.pathname + window.location.search !== nextUrl) {
      window.history.pushState(null, "", nextUrl);
    }
  };

  const closePortfolioGallery = () => {
    closePortfolioImage();
    setActiveGallery(null);
    window.history.pushState(null, "", "/");

    setTimeout(() => {
      document
        .getElementById("portfolio")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const updateSlider = (clientX) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();

    sliderPercentRef.current = Math.min(
      100,
      Math.max(0, ((clientX - rect.left) / rect.width) * 100)
    );

    if (sliderFrameRef.current) return;

    sliderFrameRef.current = requestAnimationFrame(() => {
      const percent = sliderPercentRef.current;

      if (beforeRef.current) {
        beforeRef.current.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      }

      if (lineRef.current) lineRef.current.style.left = `${percent}%`;
      if (handleRef.current) handleRef.current.style.left = `${percent}%`;

      sliderFrameRef.current = null;
    });
  };

  const portfolioItems = [
    {
      title: "Car",
      key: "car",
      image: siteAssetImageUrl("cover_car"),
    },
    {
      title: "Portrait",
      key: "portrait",
      image: siteAssetImageUrl("cover_portrait"),
    },
    {
      title: "Nature & Street",
      key: "nature",
      image: siteAssetImageUrl("cover_nature"),
    },
    {
      title: "Event",
      key: "event",
      image: siteAssetImageUrl("cover_event"),
    },
  ];
  const archivedPortfolioKeys = parseArchivedPortfolioKeys(
    siteSettings.portfolio_archived_keys
  );
  const visiblePortfolioItems = portfolioItems.filter(
    (item) => !archivedPortfolioKeys.has(item.key)
  );

  const galleryImages = {
    car: uniqueImageList([
      "/images/ju.jpg",
      "/images/bus.jpg",
      "/images/porsche.jpg",
      "/images/bw.jpg",
      "/images/audi.jpg",
      "/images/goldcar.jpg",
    ]),
    portrait: [],
    nature: [],
    event: uniqueImageList([
      "/images/zeugnis.jpg",
      "/images/ski.jpg",
      siteAssetImageUrl("cover_nature"),
    ]),
  };

  const uploadedImagesByCategory = uploadedImages.reduce((groups, image) => {
    if (!image?.category || !image?.url) return groups;

    return {
      ...groups,
      [image.category]: [
        ...(groups[image.category] || []),
        {
          id: image.id || "",
          path: image.path || "",
          title: image.title || "",
          url: image.url,
          width: image.width || null,
          height: image.height || null,
        },
      ],
    };
  }, {});

  const visibleGalleryImages = Object.fromEntries(
    Object.entries(galleryImages).map(([category, images]) => [
      category,
      [...(uploadedImagesByCategory[category] || []), ...images],
    ])
  );
  const activePortfolioImages = activeGallery
    ? visibleGalleryImages[activeGallery] || []
    : [];
  const getPortfolioDownloadUrl = (image) => {
    const normalizedImage = normalizePortfolioImage(image);

    if (normalizedImage.id) {
      return `/api/portfolio-images/download?image=${encodeURIComponent(
        normalizedImage.id
      )}`;
    }

    if (
      normalizedImage.url?.startsWith("/images/") ||
      normalizedImage.url?.startsWith("/api/site-assets/image/") ||
      normalizedImage.url?.includes("/storage/v1/object/public/portfolio/")
    ) {
      return `/api/portfolio-images/download?src=${encodeURIComponent(
        normalizedImage.url
      )}`;
    }

    return "";
  };

  const closePortfolioImage = () => {
    setSelectedPortfolioImage(null);
    setSelectedPortfolioImageIndex(null);
    setPortfolioImageZoomed(false);
  };

  const selectPortfolioImageAt = (index) => {
    if (!activePortfolioImages.length) return;

    const nextIndex =
      (index + activePortfolioImages.length) % activePortfolioImages.length;

    setSelectedPortfolioImage(activePortfolioImages[nextIndex]);
    setSelectedPortfolioImageIndex(nextIndex);
    setPortfolioImageZoomed(false);
  };

  const showPreviousPortfolioImage = () => {
    selectPortfolioImageAt((selectedPortfolioImageIndex ?? 0) - 1);
  };

  const showNextPortfolioImage = () => {
    selectPortfolioImageAt((selectedPortfolioImageIndex ?? 0) + 1);
  };

  useEffect(() => {
    if (!selectedPortfolioImage) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closePortfolioImage();
      }

      if (activePortfolioImages.length > 1 && event.key === "ArrowLeft") {
        showPreviousPortfolioImage();
      }

      if (activePortfolioImages.length > 1 && event.key === "ArrowRight") {
        showNextPortfolioImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPortfolioImage, selectedPortfolioImageIndex, activePortfolioImages.length]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    setReviewSubmitting(true);
    setReviewMessage("");
    setReviewMessageType("info");

    if (formData.get("publicReviewConsent") !== "yes") {
      setReviewSubmitting(false);
      setReviewMessageType("error");
      setReviewMessage(
        "Bitte bestätige, dass Name, Bewertung und gegebenenfalls Avatar nach Freigabe öffentlich sichtbar sein dürfen."
      );
      return;
    }

    const newReview = {
      name: reviewName.trim(),
      text: reviewText.trim(),
      stars: rating || 5,
      website: formData.get("website") || "",
      startedAt: reviewFormStartedAtRef.current,
      publicReviewConsent: true,
    };

    if (reviewAvatar) newReview.avatar_url = reviewAvatar;

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReview),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error ||
            "Bewertung konnte nicht veröffentlicht werden. Bitte später nochmal versuchen."
        );
      }

      const nextName = currentCustomer?.name || "";
      setRating(0);
      setReviewName(nextName);
      setReviewText("");
      setReviewAvatar("");
      setShowReviewAvatars(false);
      formElement.reset();
      reviewFormStartedAtRef.current = Date.now();
      setReviewMessageType("success");
      setReviewMessage(
        "Danke! Deine Bewertung wurde gesendet und wird nach Freigabe veröffentlicht."
      );
    } catch (error) {
      setReviewMessageType("error");
      setReviewMessage(
        error?.message ||
          "Bewertung konnte nicht veröffentlicht werden. Bitte später nochmal versuchen."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const honeypotValue = String(formData.get("_gotcha") || "").trim();
    const sentTooFast = Date.now() - contactFormStartedAtRef.current < 3000;

    setContactSubmitting(true);
    setContactMessage("");
    setContactSent(false);

    try {
      if (honeypotValue || sentTooFast) {
        throw new Error(
          honeypotValue
            ? "Die Anfrage wurde als Spam erkannt. Bitte überprüfe das Formular und versuche es nochmal."
            : "Das Formular wurde zu schnell gesendet. Bitte versuche es in ein paar Sekunden nochmal."
        );
      }

      const inquiryResponse = await fetch("/api/contact-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          message: formData.get("message"),
          source: "Kontaktformular",
        }),
      });
      const inquiryData = await inquiryResponse.json().catch(() => ({}));

      if (!inquiryResponse.ok) {
        throw new Error(
          inquiryData.error ||
            "Die Anfrage konnte gerade nicht gespeichert werden. Bitte versuche es später nochmal."
        );
      }

      const response = await fetch(siteSettings.form_action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      }).catch(() => null);

      formElement.reset();
      contactFormStartedAtRef.current = Date.now();
      setContactSent(true);
      setContactMessage(
        response?.ok
          ? "Danke! Deine Anfrage wurde gesendet. Ich melde mich in der Regel innerhalb von 24 Stunden."
          : "Danke! Deine Anfrage wurde gespeichert. Ich melde mich schnellstmöglich bei dir."
      );
    } catch (error) {
      setContactMessage(
        error?.message ||
          "Die Anfrage konnte gerade nicht gesendet werden. Bitte versuche es später nochmal oder schreibe mir direkt per E-Mail."
      );
    } finally {
      setContactSubmitting(false);
    }
  };

  const renderStars = (value, size = "h-5 w-5", rounding = "exact") => {
    const numericValue = Number(value || 0);
    const displayValue =
      rounding === "floor-half"
        ? Math.floor(numericValue * 2) / 2
        : numericValue;

    return [1, 2, 3, 4, 5].map((star) => {
      const filled = displayValue >= star;
      const half = displayValue === star - 0.5;

      return (
        <span key={star} className="relative inline-flex">
          <Star className={`${size} text-yellow-400`} />
          {(filled || half) && (
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: half ? "50%" : "100%" }}
            >
              <Star className={`${size} fill-yellow-400 text-yellow-400`} />
            </span>
          )}
        </span>
      );
    });
  };

  const ReviewAvatar = ({ review, className = "h-11 w-11" }) => (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10 ${className}`}
    >
      {review?.avatar_url ? (
        <img
          src={review.avatar_url}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <UserRound className="h-5 w-5 text-neutral-400" />
      )}
    </div>
  );

  const ThemeToggle = () => (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={`relative flex h-10 w-[92px] items-center justify-between rounded-full border px-3 ${buttonHover} ${
        dark ? "border-white/25 bg-white/10" : "border-black/20 bg-white/80"
      }`}
      aria-label="Dark Light Mode wechseln"
    >
      <Sun className="z-10 h-4 w-4 text-yellow-400" />
      <Moon className="z-10 h-4 w-4 text-blue-200" />
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 450, damping: 30 }}
        className="absolute top-1 h-8 w-8 rounded-full bg-white shadow-lg"
        style={{ left: dark ? "52px" : "4px" }}
      />
    </button>
  );

  const AccountButton = ({ className = "" }) => (
    <a
      href="/konto"
      aria-label="Kundenkonto öffnen"
      title="Kundenkonto"
      className={`inline-flex items-center justify-center rounded-full border font-semibold transition duration-200 hover:-translate-y-0.5 hover:scale-[1.03] ${
        "max-w-[118px] gap-1.5 px-3 py-2 text-xs sm:max-w-[160px] sm:gap-2 sm:px-4 sm:text-sm md:max-w-[190px]"
      } ${
        dark
          ? "border-white/20 bg-white/10 text-white hover:bg-white/15"
          : "border-black/10 bg-white/80 text-neutral-950 shadow-sm hover:bg-white"
      } ${className}`}
    >
      <UserRound className="h-4 w-4 shrink-0" />
      <span className="truncate">{accountLabel}</span>
    </a>
  );

  if (maintenanceActive) {
    return <MaintenanceView siteSettings={siteSettings} />;
  }

  if (activeGallery) {
    const current = portfolioItems.find((item) => item.key === activeGallery);

    return (
      <div className={`min-h-screen ${pageStyle}`}>
        <div className="mx-auto max-w-7xl px-5 py-10">
          <Button
            onClick={closePortfolioGallery}
            className={`mb-8 rounded-full ${buttonHover}`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>

          <div className={`rounded-[2rem] border p-8 ${glass}`}>
            <h1 className="text-5xl font-black">{current.title}</h1>
            <p className={`mt-4 max-w-2xl ${muted}`}>
              Klare Motive, starke Details und echte Momente im Fokus.
            </p>
          </div>

          {!portfolioImagesLoaded ? (
            <div className={`mt-10 rounded-[2rem] border p-8 text-center ${glass}`}>
              <p className={`text-sm font-semibold ${muted}`}>
                Galerie wird geladen...
              </p>
            </div>
          ) : (
            <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
              {visibleGalleryImages[activeGallery].map((image, index) => {
              const imageUrl = getPortfolioImageUrl(image);

              return (
              <motion.button
                key={`${imageUrl}-${index}`}
                type="button"
                onClick={() => {
                  setSelectedPortfolioImage(image);
                  setSelectedPortfolioImageIndex(index);
                  setPortfolioImageZoomed(false);
                }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.025, duration: 0.35 }}
                className="group mb-5 w-full break-inside-avoid overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.06] p-2 text-left shadow-lg outline-none ring-white/50 transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.09] focus-visible:ring-2"
              >
                <img
                  src={imageUrl}
                  alt={getPortfolioGalleryAlt(current.title, image, index)}
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full rounded-[1.5rem] object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </motion.button>
              );
              })}
            </div>
          )}
        </div>

        {selectedPortfolioImage && (
          <div
            className="fixed inset-0 z-[700] flex items-center justify-center overflow-hidden bg-black/85 p-4 backdrop-blur-sm"
            onClick={() => {
              closePortfolioImage();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22 }}
              className="relative flex max-h-[92vh] w-full max-w-6xl items-center justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={closePortfolioImage}
                className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/65 text-white shadow-lg transition hover:bg-black/85"
                aria-label="Bild schließen"
              >
                <X className="h-5 w-5" />
              </button>

              {activePortfolioImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      showPreviousPortfolioImage();
                    }}
                    className="fixed left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white shadow-xl transition hover:bg-black/90 md:left-8 md:h-14 md:w-14"
                    aria-label="Vorheriges Bild"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      showNextPortfolioImage();
                    }}
                    className="fixed right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white shadow-xl transition hover:bg-black/90 md:right-8 md:h-14 md:w-14"
                    aria-label="Nächstes Bild"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setPortfolioImageZoomed(!portfolioImageZoomed)}
                className={`flex w-full items-center justify-center overflow-visible ${
                  portfolioImageZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                }`}
                aria-label={
                  portfolioImageZoomed
                    ? "Bild verkleinern"
                    : "Bild vergrößern"
                }
              >
                <img
                  src={getPortfolioImageUrl(selectedPortfolioImage)}
                  alt={getPortfolioGalleryAlt(
                    current.title,
                    selectedPortfolioImage,
                    selectedPortfolioImageIndex
                  )}
                  className={`mx-auto max-h-[88vh] w-auto max-w-[calc(100vw-2rem)] rounded-[1.5rem] object-contain shadow-2xl transition-transform duration-200 ${
                    portfolioImageZoomed
                      ? "scale-[1.45] md:scale-[1.25]"
                      : "scale-100"
                  }`}
                />
              </button>

              {getPortfolioDownloadUrl(selectedPortfolioImage) && (
                <a
                  href={getPortfolioDownloadUrl(selectedPortfolioImage)}
                  download
                  className="fixed bottom-16 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-yellow-400 px-5 py-3 text-sm font-black text-neutral-950 shadow-xl transition hover:-translate-y-0.5"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Download className="h-4 w-4" />
                  Bild herunterladen
                </a>
              )}

              <div className="pointer-events-none fixed bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/65 px-4 py-2 text-center text-xs font-semibold text-white shadow-lg">
                {portfolioImageZoomed
                  ? "Antippen zum Verkleinern"
                  : "Antippen zum Vergrößern"}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`isolate min-h-screen transition-colors duration-300 ${pageStyle}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(HOME_FAQ_JSON_LD),
        }}
      />
      <header
        className={`fixed top-0 z-[500] w-full border-b backdrop-blur-xl ${
          dark
            ? "border-white/10 bg-neutral-950/95"
            : "border-black/10 bg-white/95"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-5">
          <button
            onClick={() => scrollToSection("startseite")}
            className={`flex items-center gap-2 rounded-full px-3 py-2 ${buttonHover}`}
          >
            <Camera className="h-6 w-6" />
            <span className="text-xl font-black tracking-wide max-[430px]:hidden">
              feliix.wxf
            </span>
          </button>

          <nav className="hidden items-center gap-3 md:flex">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                  dark
                    ? "border-white/20 bg-white/10 hover:bg-white/15"
                    : "border-black/10 bg-white/75 hover:bg-white"
                } ${buttonHover}`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <AccountButton />

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-transform duration-200 hover:scale-105 md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`border-t px-5 py-5 md:hidden ${
              dark
                ? "border-white/10 bg-neutral-950"
                : "border-black/10 bg-white"
            }`}
          >
            <div className="flex flex-col gap-4">
              <div
                className={`flex items-center justify-between rounded-2xl border px-5 py-4 ${
                  dark
                    ? "border-white/10 bg-white/10"
                    : "border-black/10 bg-black/5"
                }`}
              >
                <div>
                  <p className="text-sm font-black">Ansicht</p>
                  <p className={`mt-1 text-xs ${muted}`}>
                    {dark ? "Dark Mode ist aktiv" : "White Mode ist aktiv"}
                  </p>
                </div>
                <ThemeToggle />
              </div>

              {["Startseite", "Portfolio", "Bewertung", "Kontakt"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    scrollToSection(item);
                    setMenuOpen(false);
                  }}
                  className={`rounded-2xl border px-5 py-4 text-left text-base font-semibold transition-colors duration-200 ${
                    dark
                      ? "border-white/10 bg-white/10 hover:bg-white/15"
                      : "border-black/10 bg-black/5 hover:bg-black/10"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </header>

      <main className="relative z-0">
        <Section
          id="startseite"
          className="relative flex min-h-screen items-center overflow-hidden px-5 pt-24"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <div>
              <p className={`mb-4 text-sm uppercase tracking-[0.35em] ${muted}`}>
                {siteSettings.hero_eyebrow}
              </p>

              <h1 className="max-w-3xl text-5xl font-black leading-tight md:text-7xl">
                {siteSettings.hero_title_line_1}
                <br />
                {siteSettings.hero_title_line_2}
              </h1>

              <p className={`mt-6 max-w-xl text-lg leading-8 ${muted}`}>
                {siteSettings.hero_intro}
              </p>

              <p
                className={`mt-3 max-w-xl text-[0.68rem] font-semibold uppercase leading-5 tracking-[0.14em] sm:text-xs ${muted}`}
              >
                Fotograf in Hildburghausen, Eisfeld und Thüringen für Portraits,
                Hochzeiten, Car Photography und Events.
              </p>
            </div>

            <div className={`rounded-[2rem] border p-4 shadow-lg ${glass}`}>
              <div
                ref={sliderRef}
                onPointerDown={(e) => {
                  sliderRef.current?.setPointerCapture(e.pointerId);
                  updateSlider(e.clientX);
                }}
                onPointerMove={(e) => {
                  if (e.buttons === 1) updateSlider(e.clientX);
                }}
                className="relative aspect-[4/5] touch-none select-none overflow-hidden rounded-[1.5rem]"
              >
                <img
                  src={siteAssetImageUrl("hero_after")}
                  alt="Bearbeitetes Portraitfoto von feliix.wxf mit moderner Bildbearbeitung"
                  draggable="false"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  width="1200"
                  height="1500"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div
                  ref={beforeRef}
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: "inset(0 50% 0 0)" }}
                >
                  <img
                    src={siteAssetImageUrl("hero_before")}
                    alt="Unbearbeitetes Portraitfoto vor der Bildbearbeitung von feliix.wxf"
                    draggable="false"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    width="1200"
                    height="1500"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div
                  ref={lineRef}
                  className="absolute top-0 h-full w-1 bg-white shadow-lg"
                  style={{ left: "50%" }}
                />

                <div
                  ref={handleRef}
                  className={`absolute top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-white/70 bg-black/45 text-2xl text-white shadow-lg ${buttonHover}`}
                  style={{ left: "50%" }}
                >
                  ↔
                </div>

                <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-sm text-white">
                  Vorher
                </div>
                <div className="absolute right-4 top-4 rounded-full bg-black/55 px-3 py-1 text-sm text-white">
                  Nachher
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section id="info" className="px-5 py-24">
          <div className={`mx-auto max-w-7xl rounded-[2rem] border p-8 ${glass}`}>
            <p className={`text-sm uppercase tracking-[0.3em] ${muted}`}>
              {siteSettings.info_eyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              {siteSettings.info_heading}
            </h2>
            <p className={`mt-8 max-w-4xl text-lg leading-8 ${muted}`}>
              {siteSettings.info_text}
            </p>
          </div>
        </Section>

        <Section id="leistungen" className="px-5 pb-10">
          <div className="mx-auto max-w-7xl">
            <p className={`text-sm uppercase tracking-[0.3em] ${muted}`}>
              Leistungen vor Ort
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-black md:text-4xl">
              Fotograf für Hildburghausen, Eisfeld und Südthüringen.
            </h2>
            <p className={`mt-4 max-w-3xl text-base leading-7 ${muted}`}>
              Portraits, Hochzeiten, Car Photography und Events mit moderner
              Bildbearbeitung - vor Ort in Hildburghausen, Eisfeld und ganz
              Thüringen.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {LOCAL_SEO_SERVICES.map((service) => (
                <a
                  key={service.title}
                  href={service.href}
                  className={`rounded-[1.5rem] border p-5 ${
                    dark
                      ? "border-white/10 bg-white/[0.07] hover:bg-white/[0.11]"
                      : "border-black/10 bg-white/75 shadow-sm hover:bg-white"
                  } transition`}
                >
                  <h3 className="text-lg font-black">{service.title}</h3>
                  <p className={`mt-3 text-sm leading-6 ${muted}`}>
                    {service.text}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </Section>

        <section id="portfolio" className="relative z-0 scroll-mt-28 px-5 py-24">
          <div className="mx-auto max-w-7xl">
            <p className={`text-sm uppercase tracking-[0.3em] ${muted}`}>
              {siteSettings.portfolio_eyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              {siteSettings.portfolio_heading}
            </h2>

            <div className="mt-12 grid auto-rows-fr gap-6 md:grid-cols-2">
              {visiblePortfolioItems.map((item, index) => (
                <Card
                  key={item.key}
                  onClick={() => openPortfolioGallery(item.key)}
                  className={`group flex h-full cursor-pointer flex-col overflow-hidden rounded-[2rem] border ${glass} transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.14]`}
                >
                  <div className="aspect-[3/4] shrink-0 overflow-hidden bg-black/20">
                    <img
                      src={item.image}
                      alt={getPortfolioCoverAlt(item)}
                      loading={index < 2 ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority={index === 0 ? "high" : "auto"}
                      width="1200"
                      height="1600"
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                    />
                  </div>
                  <CardContent className="min-h-[92px] p-5">
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className={`mt-2 text-sm ${muted}`}>Galerie öffnen</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Section id="bewertung" className="overflow-hidden px-5 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="relative z-20">
              <p className={`text-sm uppercase tracking-[0.3em] ${muted}`}>
                {siteSettings.reviews_eyebrow}
              </p>

              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="mt-4 text-4xl font-bold md:text-5xl">
                    {siteSettings.reviews_heading}
                  </h2>

                  <div
                    className={`mt-5 inline-flex flex-wrap items-center gap-3 rounded-full border px-4 py-2 text-sm font-semibold ${
                      dark
                        ? "border-yellow-300/20 bg-yellow-300/10 text-yellow-100"
                        : "border-yellow-500/25 bg-yellow-100 text-neutral-900"
                    }`}
                  >
                    <span className="flex gap-1">
                      {renderStars(reviewAverage || 5, "h-4 w-4", "floor-half")}
                    </span>
                    <span>
                      {reviewCount} Bewertung{reviewCount === 1 ? "" : "en"},
                      Ø {formattedReviewAverage}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowAllReviews(true)}
                    className={`w-fit rounded-full border px-5 py-3 text-sm font-semibold ${
                      dark
                        ? "border-white/15 bg-white/10 hover:bg-white/15"
                        : "border-black/10 bg-white/75 hover:bg-white"
                    } ${buttonHover}`}
                  >
                    Alle Bewertungen ansehen
                  </button>
                  <a
                    href="#bewertung-schreiben"
                    className={`w-fit rounded-full border px-5 py-3 text-sm font-black ${
                      dark
                        ? "border-yellow-300/30 bg-yellow-300 text-neutral-950 hover:bg-yellow-200"
                        : "border-yellow-500/30 bg-neutral-950 text-white hover:bg-neutral-800"
                    } ${buttonHover}`}
                  >
                    Bewertung schreiben
                  </a>
                </div>
              </div>
            </div>

            <div className="relative z-0 mt-12 grid gap-6 md:grid-cols-3">
              {reviews.slice(0, 3).map((review, i) => (
                <Card
                  key={i}
                  className={`rounded-[2rem] border transition-shadow duration-200 hover:shadow-lg ${glass}`}
                >
                  <CardContent className="p-7">
                    <div className="mb-5 flex gap-1">
                      {renderStars(review.stars)}
                    </div>
                    <p className={`leading-7 ${muted}`}>“{review.text}”</p>
                    <div className="mt-6 flex items-center gap-3">
                      <ReviewAvatar review={review} />
                      <p className="font-bold">{review.name}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <form
              id="bewertung-schreiben"
              method="post"
              onSubmit={handleReviewSubmit}
              className={`scroll-mt-28 mt-14 overflow-hidden rounded-[2.5rem] border ${glass}`}
            >
              <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
                <div className="relative overflow-hidden border-b border-white/10 p-8 lg:border-b-0 lg:border-r">
                  <p className={`text-sm uppercase tracking-[0.3em] ${muted}`}>
                    {siteSettings.review_form_eyebrow}
                  </p>

                  <h3 className="relative mt-4 text-3xl font-black md:text-4xl">
                    {siteSettings.review_form_heading}
                  </h3>

                  <p className={`relative mt-5 leading-8 ${muted}`}>
                    {siteSettings.review_form_text}
                  </p>

                  <div className="relative mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-5">
                    <p className="text-sm font-semibold">Aktuelle Auswahl</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex gap-1">
                        {renderStars(rating || 5, "h-7 w-7")}
                      </div>
                      <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-bold text-black">
                        {rating || 5}/5
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="sr-only" aria-hidden="true">
                      Website
                      <input
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </label>

                    <input
                      name="name"
                      required
                      value={reviewName}
                      onChange={(event) => setReviewName(event.target.value)}
                      placeholder={
                        currentCustomer?.name
                          ? "Nutzername aus deinem Konto, änderbar"
                          : "Dein Name"
                      }
                      className="rounded-2xl border bg-white/90 px-4 py-4 text-neutral-950 outline-none transition-transform focus:scale-[1.01] focus:border-yellow-400"
                    />

                    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                      <p className={`mb-3 text-sm ${muted}`}>Sternebewertung</p>
                      <div className="flex flex-wrap gap-2">
                        {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((num) => (
                          <button
                            type="button"
                            key={num}
                            onClick={() => setRating(num)}
                            className={`rounded-full border px-3 py-2 text-sm font-semibold ${buttonHover} ${
                              rating === num
                                ? "border-yellow-400 bg-yellow-400 text-black"
                                : "border-white/15 bg-white/10"
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      name="text"
                      required
                      rows="5"
                      value={reviewText}
                      onChange={(event) => setReviewText(event.target.value)}
                      placeholder="Schreib kurz, wie dein Shooting war..."
                      className="rounded-2xl border bg-white/90 px-4 py-4 text-neutral-950 outline-none transition-transform focus:scale-[1.01] focus:border-yellow-400 md:col-span-2"
                    />

                    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.07] p-3 md:col-span-2">
                      <div className="flex min-w-0 items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10 sm:h-10 sm:w-10">
                            {reviewAvatar ? (
                              <img
                                src={reviewAvatar}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : currentCustomer?.avatar_url ? (
                              <img
                                src={currentCustomer.avatar_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Star className="h-4 w-4 text-yellow-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              Avatar auswählen{" "}
                              <span className={muted}>(optional)</span>
                            </p>
                            <p className={`hidden text-xs sm:block ${muted}`}>
                              {reviewAvatar
                                ? "Ausgewählter Charakter wird genutzt."
                                : currentCustomer?.avatar_url
                                  ? "Ohne Auswahl wird dein Profilbild genutzt."
                                  : "Ohne Auswahl erscheint ein Standardbild."}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowReviewAvatars((current) => !current)}
                          className={`shrink-0 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold transition hover:bg-white/20 sm:px-4 sm:text-sm ${buttonHover}`}
                        >
                          {showReviewAvatars ? "Schließen" : "Auswählen"}
                        </button>
                      </div>

                      {showReviewAvatars && (
                        <div className="mt-3 max-w-full overflow-hidden">
                          <div className="flex max-h-14 gap-2 overflow-x-auto overscroll-x-contain pb-2">
                            {REVIEW_AVATARS.map((avatar) => (
                              <button
                                type="button"
                                key={avatar.url}
                                onClick={() => setReviewAvatar(avatar.url)}
                                className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border transition ${
                                  reviewAvatar === avatar.url
                                    ? "border-yellow-400 bg-yellow-400/15 ring-2 ring-yellow-400/40"
                                    : "border-white/15 bg-white/10 hover:border-white/35"
                                }`}
                                aria-label={avatar.label}
                                title={avatar.label}
                              >
                                <img
                                  src={avatar.url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </button>
                            ))}

                            {reviewAvatar && (
                              <button
                                type="button"
                                onClick={() => setReviewAvatar("")}
                                className="h-10 shrink-0 rounded-full border border-white/15 bg-white/10 px-3 text-xs font-semibold transition hover:bg-white/20"
                              >
                                Profilbild
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {reviewMessage && (
                      <p className={`text-sm leading-6 ${muted} md:col-span-2`}>
                        {reviewMessage}
                        {reviewMessageType === "error" && (
                          <span className="block">
                            <ReportUserErrorButton
                              page="/"
                              source="Bewertungsformular"
                              message={reviewMessage}
                            />
                          </span>
                        )}
                      </p>
                    )}

                    <label className={`flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-sm leading-6 ${muted} md:col-span-2`}>
                      <input
                        type="checkbox"
                        name="publicReviewConsent"
                        value="yes"
                        className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 accent-yellow-400"
                      />
                      <span>
                        Ich bin einverstanden, dass mein Name, meine Bewertung
                        und gegebenenfalls mein ausgewählter Avatar oder mein
                        Profilbild nach Freigabe öffentlich auf der Website
                        erscheinen. Die Einwilligung kann ich jederzeit per
                        E-Mail widerrufen.
                      </span>
                    </label>

                    <Button
                      type="submit"
                      disabled={reviewSubmitting}
                      className={`rounded-2xl py-6 text-base md:col-span-2 ${buttonHover}`}
                    >
                      {reviewSubmitting
                        ? "Bewertung wird veröffentlicht..."
                        : "Bewertung veröffentlichen"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </Section>

        <Section id="kontakt" className="px-5 py-24">
          <div
            className={`mx-auto grid max-w-7xl gap-12 rounded-[2rem] border p-8 lg:grid-cols-2 ${glass}`}
          >
            <div>
              <p className={`text-sm uppercase tracking-[0.3em] ${muted}`}>
                Kontakt
              </p>
              <h2 className="mt-4 text-4xl font-bold md:text-5xl">
                {contactHeading}
              </h2>
              <p className={`mt-6 max-w-xl text-lg leading-8 ${muted}`}>
                {contactIntro}
              </p>

              <div className={`mt-8 space-y-5 ${muted}`}>
                <a
                  href={contactEmailHref}
                  className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white/[0.09]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition group-hover:scale-105">
                    <GmailIcon className="h-6 w-6" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-[0.25em] text-neutral-400">
                      E-Mail
                    </span>

                    <span className="break-all font-medium transition group-hover:text-yellow-200">
                      {siteSettings.contact_email}
                    </span>
                  </div>
                </a>

                <a
                  href={contactPhoneHref}
                  className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white/[0.09]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500 text-white shadow-md shadow-green-500/25 transition group-hover:scale-105 group-hover:bg-green-400">
                    <Phone className="h-5 w-5 fill-current" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-[0.25em] text-neutral-400">
                      Telefon
                    </span>

                    <span className="font-medium transition group-hover:text-yellow-200">
                      {siteSettings.contact_phone}
                    </span>
                  </div>
                </a>

                <a
                  href={siteSettings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 text-white shadow-md">
                    <InstagramIcon className="h-5 w-5" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-[0.25em] text-neutral-400">
                      Instagram
                    </span>

                    <span className="font-medium transition group-hover:text-pink-300">
                      {siteSettings.instagram_label}
                    </span>
                  </div>
                </a>
              </div>
            </div>

            <form
              id="kontaktformular"
              method="post"
              onSubmit={handleContactSubmit}
              className="rounded-[2rem] border border-white/15 bg-white/[0.08] p-6 shadow-lg"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <label className="sr-only" aria-hidden="true">
                  Website
                  <input
                    type="text"
                    name="_gotcha"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>

                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Dein Name"
                  className="rounded-2xl border bg-white/90 px-4 py-3 text-neutral-950"
                />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Deine E-Mail"
                  className="rounded-2xl border bg-white/90 px-4 py-3 text-neutral-950"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Telefonnummer optional"
                  className="rounded-2xl border bg-white/90 px-4 py-3 text-neutral-950 md:col-span-2"
                />
                <textarea
                  name="message"
                  required
                  rows="5"
                  placeholder="Deine Nachricht"
                  className="rounded-2xl border bg-white/90 px-4 py-3 text-neutral-950 md:col-span-2"
                />

                <p className={`text-xs leading-6 ${muted} md:col-span-2`}>
                  Deine Angaben werden zur Bearbeitung deiner Anfrage
                  verarbeitet. Weitere Informationen findest du in den{" "}
                  <a
                    href="/datenschutz"
                    className="font-bold underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
                  >
                    Datenschutzhinweisen
                  </a>
                  .
                </p>

                {contactMessage && (
                  <div
                    className={`md:col-span-2 overflow-hidden rounded-2xl border p-4 ${
                      contactSent
                        ? "border-yellow-300/25 bg-yellow-300/10"
                        : "border-red-300/25 bg-red-400/10"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                          contactSent
                            ? "bg-yellow-300 text-black"
                            : "bg-red-400 text-white"
                        }`}
                      >
                        {contactSent && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0.9 }}
                            animate={{ scale: 2.2, opacity: 0 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="absolute inset-0 rounded-full bg-white"
                          />
                        )}
                        <Camera className="relative z-10 h-6 w-6" />
                      </div>

                      <div>
                        <p className="font-bold">
                          {contactSent
                            ? "Anfrage erfolgreich gesendet"
                            : "Senden fehlgeschlagen"}
                        </p>
                        <p className={`mt-1 text-sm leading-6 ${muted}`}>
                          {contactMessage}
                        </p>
                        {!contactSent && (
                          <ReportUserErrorButton
                            page="/"
                            source="Kontaktformular"
                            message={contactMessage}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={contactSubmitting}
                  className={`rounded-2xl py-6 text-base md:col-span-2 ${buttonHover}`}
                >
                  {contactSubmitting
                    ? "Anfrage wird gesendet..."
                    : "Unverbindlich anfragen"}
                </Button>
              </div>
            </form>
          </div>
        </Section>
      </main>

      {showAllReviews && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
          <div className="isolate flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-white/15 bg-neutral-950 text-white shadow-xl">
            <div className="relative z-50 flex flex-none items-start justify-between border-b border-white/10 bg-neutral-950 px-8 py-7 shadow-[0_18px_24px_rgba(10,10,10,0.75)]">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
                  Übersicht
                </p>
                <h2 className="mt-3 text-4xl font-black">Alle Bewertungen</h2>
                <p className="mt-3 text-sm text-neutral-400">
                  Insgesamt {reviews.length} Bewertung
                  {reviews.length === 1 ? "" : "en"}
                </p>
              </div>

              <button
                onClick={() => setShowAllReviews(false)}
                className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-8 py-8">
              <div className="grid gap-6 md:grid-cols-2">
              {reviews.map((review, i) => (
                <button
                  key={`all-${i}`}
                  type="button"
                  onClick={() => setSelectedReview(review)}
                  className="text-left"
                >
                  <Card className="rounded-[2rem] border border-white/15 bg-white/10 text-white transition-shadow duration-200 hover:shadow-lg">
                    <CardContent className="p-7">
                      <div className="mb-5 flex gap-1">
                        {renderStars(review.stars)}
                      </div>

                      <p className="line-clamp-4 leading-7 text-neutral-300">
                        “{review.text}”
                      </p>

                      <div className="mt-6 flex items-center gap-3">
                        <ReviewAvatar review={review} />
                        <p className="text-lg font-bold">{review.name}</p>
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.25em] text-neutral-500">
                        Anklicken zum Vergrößern
                      </p>
                    </CardContent>
                  </Card>
                </button>
              ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReview && (
        <div className="fixed inset-0 z-[720] overflow-y-auto bg-black/80 p-5 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="mx-auto my-10 w-full max-w-2xl rounded-[2.5rem] border border-white/20 bg-neutral-950 p-8 text-white shadow-xl"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
                  Bewertung
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <ReviewAvatar
                    review={selectedReview}
                    className="h-14 w-14"
                  />
                  <h2 className="text-4xl font-black">
                    {selectedReview.name}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setSelectedReview(null)}
                className="rounded-full bg-white/10 p-3 transition hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex gap-1">
                {renderStars(selectedReview.stars, "h-8 w-8")}
              </div>
              <span className="rounded-full bg-yellow-400 px-4 py-1 text-sm font-black text-black">
                {selectedReview.stars}/5
              </span>
            </div>

            <p className="mt-8 text-xl leading-10 text-neutral-200">
              “{selectedReview.text}”
            </p>
          </motion.div>
        </div>
      )}

      <FaqChatbot dark={dark} />

      {showImpressum && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/15 bg-neutral-950 p-8 text-white shadow-xl">
            <div className="flex items-start justify-between">
              <h2 className="text-4xl font-black">Impressum</h2>
              <button
                onClick={() => setShowImpressum(false)}
                className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-10 space-y-8 text-neutral-300 leading-8">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Angaben gemäß § 5 DDG
                </h3>
                <p className="mt-3">
                  Felix Wolff
                  <br />
                  feliix.wxf Photography
                  <br />
                  Zum Großenbach 1
                  <br />
                  98673 Eisfeld
                  <br />
                  Deutschland
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">Kontakt</h3>
                <p className="mt-3">
                  E-Mail: {siteSettings.contact_email}
                  <br />
                  Telefon: {siteSettings.contact_phone}
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">
                  Haftung für Inhalte
                </h3>
                <p className="mt-3">
                  Trotz sorgfältiger Kontrolle übernehmen wir keine Haftung für
                  externe Inhalte und Links.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDatenschutz && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/15 bg-neutral-950 p-8 text-white shadow-xl">
            <div className="flex items-start justify-between">
              <h2 className="text-4xl font-black">Datenschutz</h2>
              <button
                onClick={() => setShowDatenschutz(false)}
                className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-10 space-y-8 text-neutral-300 leading-8">
              <p className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-neutral-400">
                Stand: August 2026. Diese Hinweise fassen zusammen, welche Daten
                auf dieser Website verarbeitet werden. Sie ersetzen keine
                individuelle Rechtsberatung, sollen aber transparent erklären,
                wie Kontaktformular, Kundenkonto, Bewertungen und
                Kundengalerien funktionieren.
              </p>

              <div>
                <h3 className="text-2xl font-bold text-white">
                  Allgemeine Hinweise
                </h3>
                <p className="mt-3">
                  Der Schutz Ihrer persönlichen Daten ist uns wichtig.
                  Personenbezogene Daten werden vertraulich behandelt und nur
                  verarbeitet, wenn dies für die Bereitstellung der Website,
                  die Bearbeitung einer Anfrage, die Nutzung eines
                  Kundenkontos oder die Bereitstellung einer Kundengalerie
                  erforderlich ist.
                </p>
                <p className="mt-3">
                  Verantwortlich für diese Website ist Felix Wolff, feliix.wxf
                  Photography, Zum Großenbach 1, 98673 Eisfeld, Deutschland.
                  Für Datenschutzanfragen, Auskunft oder Löschwünsche genügt
                  eine Nachricht an {siteSettings.contact_email}.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">
                  Zwecke und Rechtsgrundlagen
                </h3>
                <p className="mt-3">
                  Die Verarbeitung erfolgt zur Bereitstellung dieser Website,
                  zur Bearbeitung von Kontaktanfragen, zur Verwaltung von
                  Kundenkonten, zur Bereitstellung von Kundengalerien, zur
                  Verwaltung von Bewertungen sowie zur technischen Absicherung
                  des Betriebs. Je nach Vorgang erfolgt die Verarbeitung zur
                  Durchführung vorvertraglicher oder vertraglicher Maßnahmen,
                  auf Grundlage berechtigter Interessen an einem sicheren und
                  funktionierenden Webangebot oder auf Grundlage Ihrer
                  Einwilligung, sofern eine solche abgefragt wird.
                </p>
                <p className="mt-3">
                  Pflichtangaben werden jeweils nur dort abgefragt, wo sie für
                  die gewünschte Funktion notwendig sind, zum Beispiel E-Mail
                  und Passwort für das Kundenkonto oder Kontaktdaten für eine
                  Anfrage.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">
                  Kontaktformular
                </h3>
                <p className="mt-3">
                  Übermittelte Daten aus dem Kontaktformular werden zur
                  Bearbeitung Ihrer Anfrage verarbeitet. Dazu können Name,
                  E-Mail-Adresse, Telefonnummer und Ihre Nachricht gehören.
                  Die Anfrage wird zuerst über eine eigene API in Supabase
                  gespeichert und anschließend zusätzlich an Formspree
                  übertragen, damit eine Benachrichtigung und
                  Formularverwaltung möglich ist. Kontaktanfragen können im
                  geschützten Adminbereich nachverfolgt und gelöscht werden.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">
                  Kundenkonto und Kundengalerien
                </h3>
                <p className="mt-3">
                  Wenn Sie ein Kundenkonto erstellen oder eine Kundengalerie
                  nutzen, werden die dafür erforderlichen Daten verarbeitet. Dazu
                  gehören insbesondere E-Mail-Adresse, Nutzername, optional
                  Telefonnummer, optional Profilbild, Galerie-Zuordnung,
                  Favoriten, Download-Freigaben und technische
                  Zugriffsinformationen. Kundengalerien können persönliche Fotos
                  enthalten und werden nur für den jeweiligen Zweck des
                  Shootings bereitgestellt.
                </p>
                <p className="mt-3">
                  Bei der Kontoerstellung muss bestätigt werden, dass diese
                  Datenschutzhinweise gelesen wurden. Für Login, Registrierung,
                  E-Mail-Bestätigung und Passwort-Zurücksetzen können
                  automatisch notwendige Authentifizierungs-E-Mails versendet
                  werden.
                </p>
                <p className="mt-3">
                  Galerien können über einen Zugangscode, QR-Code oder ein
                  verknüpftes Kundenkonto erreichbar sein. Downloads können je
                  nach Projekt freigeschaltet oder deaktiviert werden. Wenn
                  Downloads deaktiviert sind, können Bilder in der Ansicht mit
                  einem Wasserzeichen versehen werden.
                </p>
                <p className="mt-3">
                  Abgeschlossene Galerien können als ZIP-Archiv bereitgestellt
                  werden, damit Kunden ihre freigegebenen Bilder gesammelt
                  herunterladen können. Solche Archivdateien bleiben nur so
                  lange gespeichert, wie dies für die Bereitstellung oder
                  Nachlieferung erforderlich ist.
                </p>
                <p className="mt-3">
                  Ein Kundenkonto kann im Konto-Bereich gelöscht werden. Dabei
                  werden Konto-Verknüpfungen, Profilbild und Favoriten entfernt.
                  Shooting-Galerien bleiben beim Fotografen erhalten, solange
                  sie für Projektabwicklung, Nachlieferung oder Dokumentation
                  benötigt werden.
                </p>
                <p className="mt-3">
                  Neue Kundengalerie-Bilder werden in einem privaten
                  Speicherbereich abgelegt und in der Kundenansicht nur über
                  zeitlich begrenzte Bildlinks bereitgestellt. Ältere
                  Kundengalerien können technisch noch anders gespeichert sein,
                  solange sie nicht neu hochgeladen oder migriert wurden.
                </p>
                <p className="mt-3">
                  Zugangscodes und QR-Codes sollten vertraulich behandelt
                  werden, da Personen mit gültigem Code die jeweilige Galerie
                  öffnen können.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">
                  Bewertungen
                </h3>
                <p className="mt-3">
                  Abgegebene Bewertungen werden zunächst gespeichert und erst
                  nach manueller Freigabe veröffentlicht. Bei eingeloggten
                  Kunden kann zusätzlich das Profilbild und der Nutzername aus
                  dem Kundenkonto angezeigt werden.
                </p>
                <p className="mt-3">
                  Vor dem Absenden einer Bewertung muss freiwillig bestätigt
                  werden, dass Name, Bewertung und gegebenenfalls ausgewählter
                  Avatar oder Profilbild nach Freigabe öffentlich auf der
                  Website erscheinen dürfen. Rechtsgrundlage ist Art. 6 Abs. 1
                  lit. a DSGVO. Die Einwilligung kann jederzeit per E-Mail
                  widerrufen werden.
                </p>
                <p className="mt-3">
                  Wird ein Kundenkonto gelöscht, bleibt eine bereits
                  veröffentlichte Bewertung ohne Konto-Verknüpfung bestehen.
                  Wenn eine Bewertung ebenfalls gelöscht werden soll, kann dies
                  jederzeit per E-Mail angefragt werden.
                </p>
                <p className="mt-3">
                  Bei neuen Bewertungen kann eine Benachrichtigung per E-Mail an
                  den Betreiber ausgelöst werden, damit die Bewertung geprüft
                  und freigegeben werden kann.
                </p>
                <p className="mt-3">
                  Falls ein Profilbild aus dem Kundenkonto für eine Bewertung
                  verwendet wird, kann dieses zusammen mit der Bewertung
                  öffentlich sichtbar sein. Der angezeigte Name kann bei der
                  Bewertung angepasst werden.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">
                  Cookies und lokale Speicherung
                </h3>
                <p className="mt-3">
                  Für den Betrieb der Website können technisch notwendige
                  Session-Cookies verwendet werden, etwa für Admin- oder
                  Kunden-Logins. Zusätzlich können einzelne Einstellungen wie
                  der gewählte Hell-/Dunkel-Modus lokal im Browser gespeichert
                  werden. Eine werbliche Tracking- oder Analysefunktion ist auf
                  dieser Website nicht vorgesehen.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">
                  Speicherdauer
                </h3>
                <p className="mt-3">
                  Daten werden nur so lange gespeichert, wie sie für die
                  jeweiligen Zwecke erforderlich sind. Kundengalerien können
                  nach Abschluss eines Projekts deaktiviert, mit einem
                  Ablaufdatum versehen oder gelöscht werden. Gesetzliche
                  Aufbewahrungspflichten bleiben unberührt.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">
                  Hosting und CDN mit Vercel
                </h3>
                <p className="mt-3">
                  Diese Website wird bei Vercel gehostet. Anbieter ist Vercel
                  Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA. Vercel
                  stellt Webhosting-Kapazitäten, Infrastruktur-Dienstleistungen
                  und ein weltweites Content Delivery Network bereit, damit die
                  Website schnell, sicher und zuverlässig ausgeliefert werden
                  kann.
                </p>
                <p className="mt-3">
                  Beim Aufruf der Website können technisch erforderliche Daten
                  wie IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene
                  Seiten, Browser- und Geräteinformationen, Betriebssystem,
                  Referrer-URL sowie weitere technische Verbindungsdaten
                  verarbeitet werden. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f
                  DSGVO. Das berechtigte Interesse liegt in der sicheren,
                  schnellen und fehlerfreien Bereitstellung des Onlineangebots.
                </p>
                <p className="mt-3">
                  Da Vercel seinen Sitz in den USA hat, kann eine Übermittlung
                  personenbezogener Daten in die USA nicht ausgeschlossen
                  werden. Mit Vercel wurde ein Data Processing Addendum
                  abgeschlossen, das die EU-Standardvertragsklauseln enthält.
                  IP-Adressen und Server-Logfiles werden nur so lange
                  verarbeitet und gespeichert, wie dies für Betrieb,
                  Funktionalität und IT-Sicherheit erforderlich ist.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">
                  Supabase und Formspree
                </h3>
                <p className="mt-3">
                  Supabase wird für Datenbank, Authentifizierung,
                  Kundenkonten, Bewertungen, Kontaktanfragen, Kundengalerien
                  und Bildspeicher genutzt. Die Projektregion ist nach
                  aktueller Dashboard-Anzeige West EU (Ireland), technisch
                  eu-west-1.
                </p>
                <p className="mt-3">
                  Im Adminbereich können Kundenkonten anhand von E-Mail-Adresse
                  oder anderen hinterlegten Angaben gesucht und verwaltet werden,
                  soweit dies für Kundenservice, Galerie-Zuordnung,
                  Download-Freigaben oder Löschanfragen erforderlich ist.
                </p>
                <p className="mt-3">
                  Formspree wird für die zusätzliche Verarbeitung von
                  Kontaktformularen und E-Mail-Benachrichtigungen genutzt. An
                  Formspree werden die eingegebenen Formulardaten übertragen.
                  Im kostenlosen Tarif werden Einsendungen nach
                  Anbieterangaben für 30 Tage vorgehalten.
                </p>
                <p className="mt-3">
                  Formspree verarbeitet Daten nach Anbieterangaben über AWS in
                  den USA und nutzt für Drittlandübermittlungen
                  EU-Standardvertragsklauseln. Supabase und Formspree werden
                  auf Grundlage der jeweils bereitgestellten
                  Datenverarbeitungs- und Auftragsverarbeitungsbedingungen
                  eingesetzt.
                </p>
                <p className="mt-3">
                  Supabase wird außerdem für die Authentifizierung verwendet.
                  Dadurch können Registrierungs-, Bestätigungs- und
                  Passwort-Reset-E-Mails über Supabase ausgelöst werden.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">
                  Ihre Rechte
                </h3>
                <p className="mt-3">
                  Sie haben jederzeit das Recht auf Auskunft, Berichtigung oder
                  Löschung Ihrer gespeicherten Daten. Außerdem können Sie je
                  nach Situation Einschränkung der Verarbeitung, Widerspruch
                  gegen die Verarbeitung oder Datenübertragbarkeit verlangen.
                  Für Anfragen genügt eine Nachricht an die im Impressum
                  genannte E-Mail-Adresse.
                </p>
                <p className="mt-3">
                  Sofern eine Verarbeitung auf Einwilligung beruht, kann diese
                  Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen
                  werden. Außerdem besteht das Recht, sich bei einer zuständigen
                  Datenschutzaufsichtsbehörde zu beschweren.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-white/10 px-5 py-10 text-center text-sm text-neutral-500">
        <div className="flex flex-col items-center justify-center gap-3 md:flex-row md:gap-6">
          <p>© {new Date().getFullYear()} feliix.wxf</p>

          <a href="/impressum" className="transition hover:text-white">
            Impressum
          </a>

          <a href="/datenschutz" className="transition hover:text-white">
            Datenschutz
          </a>

          <a
            href="/fotograf-eisfeld"
            className="transition hover:text-white"
          >
            Fotograf Eisfeld
          </a>

          <a
            href="/fotograf-hildburghausen"
            className="transition hover:text-white"
          >
            Fotograf Hildburghausen
          </a>
        </div>
      </footer>
    </div>
  );
}
