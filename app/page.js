"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Mail,
  Phone,
  Star,
  Menu,
  X,
  ArrowLeft,
  Sun,
  Moon,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

const DEFAULT_SITE_ASSETS = {
  hero_after: { url: "/images/nacher.jpg" },
  hero_before: { url: "/images/vorher.jpg" },
  cover_car: { url: "/images/hyundaititel.jpg" },
  cover_portrait: { url: "/images/fw.jpg" },
  cover_nature: { url: "/images/startpoint.jpg" },
  cover_event: { url: "/images/abititel.jpg" },
};

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

export default function FeliixWxfPhotography() {
  const sliderRef = useRef(null);
  const beforeRef = useRef(null);
  const lineRef = useRef(null);
  const handleRef = useRef(null);
  const sliderFrameRef = useRef(null);
  const sliderPercentRef = useRef(50);

  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [activeGallery, setActiveGallery] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupClosed, setPopupClosed] = useState(false);
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [siteAssets, setSiteAssets] = useState(DEFAULT_SITE_ASSETS);
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedPortfolioImage, setSelectedPortfolioImage] = useState(null);
  const [portfolioImageZoomed, setPortfolioImageZoomed] = useState(false);
  const [showImpressum, setShowImpressum] = useState(false);
  const [showDatenschutz, setShowDatenschutz] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("datenschutz") === "1") {
      setShowDatenschutz(true);
      window.history.replaceState(null, "", "/");
    }

    const savedTheme = localStorage.getItem("feliix-theme");

    if (savedTheme) setTheme(savedTheme);

    fetch("/api/reviews")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.reviews?.length) {
          setReviews([...data.reviews, ...DEFAULT_REVIEWS]);
        }
      })
      .catch(() => {
        setReviewMessage(
          "Online-Bewertungen konnten gerade nicht geladen werden."
        );
      });

    fetch("/api/account/session")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user) {
          setCurrentCustomer(data.user);
          setReviewName((current) => current || data.user.name || "");
        }
      })
      .catch(() => {});

    fetch("/api/portfolio-images")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (Array.isArray(data?.images)) {
          setUploadedImages(data.images);
        }
      })
      .catch(() => {});

    fetch("/api/site-assets")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.assets) {
          setSiteAssets((current) => ({ ...current, ...data.assets }));
        }
      })
      .catch(() => {});

    fetch("/api/site-settings")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.settings) {
          setSiteSettings((current) => ({ ...current, ...data.settings }));
        }
      })
      .catch(() => {});

    const timer = setTimeout(() => setShowPopup(true), 8000);
    return () => clearTimeout(timer);
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
    setShowPopup(false);

    setTimeout(() => {
      document
        .getElementById(id.toLowerCase())
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);

    setMenuOpen(false);
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
      image: isPlaceholderImageUrl(siteAssets.cover_car?.url)
        ? DEFAULT_SITE_ASSETS.cover_car.url
        : siteAssets.cover_car?.url || DEFAULT_SITE_ASSETS.cover_car.url,
    },
    {
      title: "Portrait",
      key: "portrait",
      image: isPlaceholderImageUrl(siteAssets.cover_portrait?.url)
        ? DEFAULT_SITE_ASSETS.cover_portrait.url
        : siteAssets.cover_portrait?.url ||
          DEFAULT_SITE_ASSETS.cover_portrait.url,
    },
    {
      title: "Nature & Street",
      key: "nature",
      image: isPlaceholderImageUrl(siteAssets.cover_nature?.url)
        ? DEFAULT_SITE_ASSETS.cover_nature.url
        : siteAssets.cover_nature?.url || DEFAULT_SITE_ASSETS.cover_nature.url,
    },
    {
      title: "Event",
      key: "event",
      image: isPlaceholderImageUrl(siteAssets.cover_event?.url)
        ? DEFAULT_SITE_ASSETS.cover_event.url
        : siteAssets.cover_event?.url || DEFAULT_SITE_ASSETS.cover_event.url,
    },
  ];

  const galleryImages = {
    car: uniqueImageList([
      "/images/fw.jpg",
      "/images/ju.jpg",
      "/images/bus.jpg",
      "/images/porsche.jpg",
      "/images/bw.jpg",
      "/images/audi.jpg",
      "/images/goldcar.jpg",
      siteAssets.cover_portrait?.url || DEFAULT_SITE_ASSETS.cover_portrait.url,
    ]),
    portrait: [],
    nature: [],
    event: uniqueImageList([
      "/images/zeugnis.jpg",
      "/images/ski.jpg",
      "/images/startpoint.jpg",
      siteAssets.cover_nature?.url || DEFAULT_SITE_ASSETS.cover_nature.url,
    ]),
  };

  const uploadedImagesByCategory = uploadedImages.reduce((groups, image) => {
    if (!image?.category || !image?.url) return groups;

    return {
      ...groups,
      [image.category]: [...(groups[image.category] || []), image.url],
    };
  }, {});

  const visibleGalleryImages = Object.fromEntries(
    Object.entries(galleryImages).map(([category, images]) => [
      category,
      [...(uploadedImagesByCategory[category] || []), ...images],
    ])
  );

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const formElement = e.currentTarget;

    setReviewSubmitting(true);
    setReviewMessage("");

    const newReview = {
      name: reviewName.trim(),
      text: reviewText.trim(),
      stars: rating || 5,
    };

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReview),
      });

      if (!response.ok) throw new Error("Review could not be saved");

      const nextName = currentCustomer?.name || "";
      setRating(0);
      setReviewName(nextName);
      setReviewText("");
      formElement.reset();
      setReviewMessage(
        "Danke! Deine Bewertung wurde gesendet und wird nach Freigabe veröffentlicht."
      );
    } catch {
      setReviewMessage(
        "Bewertung konnte nicht veröffentlicht werden. Bitte später nochmal versuchen."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const renderStars = (value, size = "h-5 w-5") => {
    return [1, 2, 3, 4, 5].map((star) => {
      const filled = value >= star;
      const half = value === star - 0.5;

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

  if (activeGallery) {
    const current = portfolioItems.find((item) => item.key === activeGallery);

    return (
      <div className={`min-h-screen ${pageStyle}`}>
        <div className="mx-auto max-w-7xl px-5 py-10">
          <Button
            onClick={() => {
              setSelectedPortfolioImage(null);
              setPortfolioImageZoomed(false);
              setActiveGallery(null);
            }}
            className={`mb-8 rounded-full ${buttonHover}`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>

          <div className={`rounded-[2rem] border p-8 ${glass}`}>
            <h1 className="text-5xl font-black">{current.title}</h1>
            <p className={`mt-4 max-w-2xl ${muted}`}>
              Eine kuratierte Galerie meiner Arbeiten. Später ersetzen wir diese
              Platzhalter durch deine eigenen Bilder.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleGalleryImages[activeGallery].map((image, index) => (
              <motion.button
                key={index}
                type="button"
                onClick={() => {
                  setSelectedPortfolioImage(image);
                  setPortfolioImageZoomed(false);
                }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.025, duration: 0.35 }}
                className="group overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.06] p-2 text-left shadow-lg outline-none ring-white/50 transition-transform duration-200 hover:-translate-y-1 focus-visible:ring-2"
              >
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="aspect-[3/4] h-full w-full rounded-[1.5rem] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </motion.button>
            ))}
          </div>
        </div>

        {selectedPortfolioImage && (
          <div
            className={`fixed inset-0 z-[300] bg-black/85 backdrop-blur-sm ${
              portfolioImageZoomed
                ? "overflow-auto p-4"
                : "flex items-center justify-center overflow-hidden p-4"
            }`}
            onClick={() => {
              setSelectedPortfolioImage(null);
              setPortfolioImageZoomed(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22 }}
              className={`relative ${
                portfolioImageZoomed
                  ? "mx-auto min-h-full w-max"
                  : "max-h-[92vh] w-full max-w-6xl"
              }`}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedPortfolioImage(null);
                  setPortfolioImageZoomed(false);
                }}
                className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/65 text-white shadow-lg transition hover:bg-black/85"
                aria-label="Bild schließen"
              >
                <X className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setPortfolioImageZoomed(!portfolioImageZoomed)}
                className="block"
                aria-label={
                  portfolioImageZoomed
                    ? "Bild verkleinern"
                    : "Bild vergrößern"
                }
              >
                <img
                  src={selectedPortfolioImage}
                  alt=""
                  className={`mx-auto rounded-[1.5rem] object-contain shadow-2xl transition-[width,max-height] duration-200 ${
                    portfolioImageZoomed
                      ? "max-h-none w-[165vw] max-w-none md:w-[110vw]"
                      : "max-h-[92vh] w-auto max-w-full"
                  }`}
                />
              </button>

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
    <div className={`min-h-screen transition-colors duration-300 ${pageStyle}`}>
      <header
        className={`fixed top-0 z-[200] w-full border-b backdrop-blur-xl ${
          dark
            ? "border-white/10 bg-neutral-950/95"
            : "border-black/10 bg-white/95"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button
            onClick={() => scrollToSection("startseite")}
            className={`flex items-center gap-2 rounded-full px-3 py-2 ${buttonHover}`}
          >
            <Camera className="h-6 w-6" />
            <span className="text-xl font-black tracking-wide">feliix.wxf</span>
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

          <div className="flex items-center gap-3">
            <a
              href="/konto"
              className={`hidden max-w-[180px] items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold md:inline-flex ${
                dark
                  ? "border-white/20 bg-white/10 hover:bg-white/15"
                  : "border-black/10 bg-white/75 hover:bg-white"
              } ${buttonHover}`}
            >
              <UserRound className="h-4 w-4" />
              <span className="truncate">{accountLabel}</span>
            </a>

            <ThemeToggle />

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
              <a
                href="/konto"
                className={`rounded-2xl border px-5 py-4 text-left text-base font-semibold transition-colors duration-200 ${
                  dark
                    ? "border-white/10 bg-white/10 hover:bg-white/15"
                    : "border-black/10 bg-black/5 hover:bg-black/10"
                }`}
              >
                {accountLabel}
              </a>
            </div>
          </motion.div>
        )}
      </header>

      <main>
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
                  src={
                    siteAssets.hero_after?.url ||
                    DEFAULT_SITE_ASSETS.hero_after.url
                  }
                  alt="Nachher"
                  draggable="false"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div
                  ref={beforeRef}
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: "inset(0 50% 0 0)" }}
                >
                  <img
                    src={
                      siteAssets.hero_before?.url ||
                      DEFAULT_SITE_ASSETS.hero_before.url
                    }
                    alt="Vorher"
                    draggable="false"
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

        <Section id="portfolio" className="px-5 py-24">
          <div className="mx-auto max-w-7xl">
            <p className={`text-sm uppercase tracking-[0.3em] ${muted}`}>
              {siteSettings.portfolio_eyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              {siteSettings.portfolio_heading}
            </h2>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {portfolioItems.map((item) => (
                <Card
                  key={item.key}
                  onClick={() => setActiveGallery(item.key)}
                  className={`cursor-pointer overflow-hidden rounded-[2rem] border ${glass} ${hoverLift}`}
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.04]"
                    />
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className={`mt-2 text-sm ${muted}`}>Galerie öffnen</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Section>

        <Section id="bewertung" className="px-5 py-24">
          <div className="mx-auto max-w-7xl">
            <p className={`text-sm uppercase tracking-[0.3em] ${muted}`}>
              {siteSettings.reviews_eyebrow}
            </p>

            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <h2 className="mt-4 text-4xl font-bold md:text-5xl">
                {siteSettings.reviews_heading}
              </h2>

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
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {reviews.slice(0, 3).map((review, i) => (
                <Card
                  key={i}
                  className={`rounded-[2rem] border ${hoverLift} ${glass}`}
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
              onSubmit={handleReviewSubmit}
              className={`mt-14 overflow-hidden rounded-[2.5rem] border ${glass}`}
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

                    <Button
                      type="submit"
                      disabled={reviewSubmitting}
                      className={`rounded-2xl py-6 text-base md:col-span-2 ${buttonHover}`}
                    >
                      {reviewSubmitting
                        ? "Bewertung wird veröffentlicht..."
                        : "Bewertung veröffentlichen"}
                    </Button>

                    {reviewMessage && (
                      <p className={`text-sm leading-6 ${muted} md:col-span-2`}>
                        {reviewMessage}
                      </p>
                    )}
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
                {siteSettings.contact_heading}
              </h2>
              <p className={`mt-6 max-w-xl text-lg leading-8 ${muted}`}>
                {siteSettings.contact_intro}
              </p>

              <div className={`mt-8 space-y-5 ${muted}`}>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                    <Mail className="h-5 w-5" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-[0.25em] text-neutral-400">
                      E-Mail
                    </span>

                    <span className="font-medium">{siteSettings.contact_email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                    <Phone className="h-5 w-5" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-[0.25em] text-neutral-400">
                      Telefon
                    </span>

                    <span className="font-medium">{siteSettings.contact_phone}</span>
                  </div>
                </div>

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
              action={siteSettings.form_action}
              method="POST"
              className="rounded-[2rem] border border-white/15 bg-white/[0.08] p-6 shadow-lg"
            >
              <div className="grid gap-5 md:grid-cols-2">
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
                  Mit dem Absenden erklärst du dich einverstanden, dass deine
                  Angaben zur Bearbeitung deiner Anfrage verarbeitet werden.
                  Weitere Informationen findest du im Datenschutz.
                </p>

                <Button
                  type="submit"
                  className={`rounded-2xl py-6 text-base md:col-span-2 ${buttonHover}`}
                >
                  Nachricht senden
                </Button>
              </div>
            </form>
          </div>
        </Section>
      </main>

      {showAllReviews && (
        <div className="fixed inset-0 z-[300] overflow-y-auto bg-black/70 p-5 backdrop-blur-sm">
          <div className="mx-auto my-8 max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/15 bg-neutral-950 p-8 text-white shadow-xl">
            <div className="sticky top-0 z-10 mb-8 flex items-start justify-between border-b border-white/10 bg-neutral-950/95 pb-5">
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

            <div className="grid gap-6 md:grid-cols-2">
              {reviews.map((review, i) => (
                <button
                  key={`all-${i}`}
                  type="button"
                  onClick={() => setSelectedReview(review)}
                  className="text-left"
                >
                  <Card
                    className={`rounded-[2rem] border border-white/15 bg-white/10 text-white ${hoverLift}`}
                  >
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
      )}

      {selectedReview && (
        <div className="fixed inset-0 z-[320] overflow-y-auto bg-black/80 p-5 backdrop-blur-sm">
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

      {showPopup && !popupClosed && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28 }}
          className="fixed bottom-6 right-6 z-[250] max-w-sm rounded-[1.7rem] border border-white/30 bg-neutral-950/90 p-5 text-white shadow-xl backdrop-blur-md"
        >
          <button
            onClick={() => setPopupClosed(true)}
            className={`absolute right-3 top-3 rounded-full bg-white/10 p-1 text-white ${buttonHover}`}
          >
            <X className="h-4 w-4" />
          </button>

          <button
            onClick={() => scrollToSection("Kontakt")}
            className={`pr-6 text-left ${buttonHover}`}
          >
            <p className="text-lg font-black">Benötigen Sie ein Shooting?</p>
            <p className="mt-2 text-sm text-neutral-300">
              Dann direkt hier klicken und eine Anfrage senden.
            </p>
          </button>
        </motion.div>
      )}

      {showImpressum && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
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
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
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
                Stand: Juni 2026. Diese Hinweise fassen zusammen, welche Daten
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
                  Verantwortlich für diese Website ist Felix Wolff. Für
                  Datenschutzanfragen, Auskunft oder Löschwünsche genügt eine
                  Nachricht an die im Impressum genannte E-Mail-Adresse.
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
                  Die Verarbeitung erfolgt, um Ihre Anfrage beantworten und ein
                  mögliches Shooting vorbereiten zu können.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">
                  Kundenkonto und Kundengalerien
                </h3>
                <p className="mt-3">
                  Wenn Sie ein Kundenkonto erstellen oder eine Kundengalerie
                  nutzen, werden die dafür erforderlichen Daten verarbeitet. Dazu
                  gehören insbesondere E-Mail-Adresse, Nutzername, Profilbild,
                  Galerie-Zuordnung, Favoriten, Download-Freigaben und
                  technische Zugriffsinformationen. Kundengalerien können
                  persönliche Fotos enthalten und werden nur für den jeweiligen
                  Zweck des Shootings bereitgestellt.
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
                  nach Projekt freigeschaltet oder deaktiviert werden.
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
                  Externe Dienste
                </h3>
                <p className="mt-3">
                  Diese Website nutzt externe Dienste zur Bereitstellung und
                  Verwaltung der Inhalte. Vercel wird für Hosting und
                  Auslieferung der Website genutzt. Supabase wird für Datenbank,
                  Kundenkonten, Bewertungen, Kundengalerien und Bildspeicher
                  genutzt. Formspree kann für die Verarbeitung von
                  Kontaktformularen eingesetzt werden. Externe Bildquellen
                  können nur dort verwendet werden, wo keine eigenen Bilder
                  hinterlegt sind.
                </p>
                <p className="mt-3">
                  Bei diesen Diensten können technische Daten wie IP-Adresse,
                  Zeitpunkt des Zugriffs, Geräte- und Browserinformationen oder
                  Formularinhalte verarbeitet werden, soweit dies für Betrieb,
                  Sicherheit und Anfragebearbeitung erforderlich ist.
                </p>
                <p className="mt-3">
                  Soweit diese Dienste personenbezogene Daten im Auftrag
                  verarbeiten, sollten entsprechende Vereinbarungen zur
                  Auftragsverarbeitung geprüft und abgeschlossen werden.
                  Einzelne Dienste können Daten auch außerhalb der EU
                  verarbeiten; dabei sind die jeweiligen Datenschutz- und
                  Sicherheitsangaben des Dienstes zu beachten.
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

          <button
            onClick={() => setShowImpressum(true)}
            className="transition hover:text-white"
          >
            Impressum
          </button>

          <button
            onClick={() => setShowDatenschutz(true)}
            className="transition hover:text-white"
          >
            Datenschutz
          </button>
        </div>
      </footer>
    </div>
  );
}
