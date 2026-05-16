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
  const [showPopup, setShowPopup] = useState(false);
  const [popupClosed, setPopupClosed] = useState(false);
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedPortfolioImage, setSelectedPortfolioImage] = useState(null);
  const [portfolioImageZoomed, setPortfolioImageZoomed] = useState(false);
  const [showImpressum, setShowImpressum] = useState(false);
  const [showDatenschutz, setShowDatenschutz] = useState(false);

  useEffect(() => {
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
      image:
        "/images/hyundaititel.jpg",
    },
    {
      title: "Portrait",
      key: "portrait",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Nature & Street",
      key: "nature",
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Event",
      key: "event",
      image:
        "/images/abititel.jpg",
    },
  ];

  const galleryImages = {
    car: [
      "/images/fw.jpg",
      "/images/ju.jpg",
      "/images/bus.jpg",
      "/images/porsche.jpg",
      "/images/bw.jpg",
      "/images/audi.jpg",
      "/images/goldcar.jpg",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&w=1400&q=80",
    ],
    portrait: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1400&q=80",
    ],
    nature: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80",
    ],
    event: [
      "/images/zeugnis.jpg",
      "/images/ski.jpg",
      "/images/startpoint.jpg",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1522158637959-30385a09e0da?auto=format&fit=crop&w=1400&q=80",
    ],
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewMessage("");

    const form = new FormData(e.currentTarget);

    const newReview = {
      name: String(form.get("name") || "").trim(),
      text: String(form.get("text") || "").trim(),
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

      const data = await response.json();
      const savedReview = data.review || newReview;

      setReviews((currentReviews) => [savedReview, ...currentReviews]);
      setRating(0);
      e.currentTarget.reset();
      setReviewMessage("Danke! Deine Bewertung ist jetzt veröffentlicht.");
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

  const Section = ({ id, children, className = "" }) => (
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
            {galleryImages[activeGallery].map((image, index) => (
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
                Fotografie & Editing
              </p>

              <h1 className="max-w-3xl text-5xl font-black leading-tight md:text-7xl">
                Bilder mit Charakter.
                <br />
                Bearbeitung mit Stil.
              </h1>

              <p className={`mt-6 max-w-xl text-lg leading-8 ${muted}`}>
                Willkommen bei <strong>feliix.wxf</strong>. Moderne Fotografie,
                kreative Bearbeitung und visuelle Inhalte mit starkem Look.
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
                  src="/images/nacher.jpg"
                  alt="Nachher"
                  draggable="false"
                  className="className="absolute inset-0 h-full w-full object-cover
                />

                <div
                  ref={beforeRef}
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: "inset(0 50% 0 0)" }}
                >
                  <img
                    src="/images/vorher.jpg"
                    alt="Vorher"
                    draggable="false"
                    className="className="h-full w-full object-cover
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
            <p className={`text-sm uppercase tracking-[0.3em] ${muted}`}>Info</p>
            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Über feliix.wxf
            </h2>
            <p className={`mt-8 max-w-4xl text-lg leading-8 ${muted}`}>
              Hinter feliix.wxf steckt viel Erfahrung in Fotografie und
              Bildbearbeitung. Mein Fokus liegt auf klaren Looks, sauberer
              Retusche, starken Kontrasten und Bildern, die natürlich wirken,
              aber trotzdem einen professionellen Wiedererkennungswert haben.
            </p>
          </div>
        </Section>

        <Section id="portfolio" className="px-5 py-24">
          <div className="mx-auto max-w-7xl">
            <p className={`text-sm uppercase tracking-[0.3em] ${muted}`}>
              Portfolio
            </p>
            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Ausgewählte Arbeiten
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
              Bewertung
            </p>

            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <h2 className="mt-4 text-4xl font-bold md:text-5xl">
                Kundenstimmen
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
                    <p className="mt-6 font-bold">{review.name}</p>
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
                    Deine Meinung
                  </p>

                  <h3 className="relative mt-4 text-3xl font-black md:text-4xl">
                    Wie war dein Shooting?
                  </h3>

                  <p className={`relative mt-5 leading-8 ${muted}`}>
                    Hinterlasse eine kurze Bewertung. Deine Rückmeldung hilft
                    anderen, einen echten Eindruck von meiner Arbeit zu bekommen.
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
                      placeholder="Dein Name"
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
                Lass uns dein Shooting planen.
              </h2>
              <p className={`mt-6 max-w-xl text-lg leading-8 ${muted}`}>
                Schreib mir direkt über das Formular.
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

                    <span className="font-medium">
                      felixwolff411@gmail.com
                    </span>
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

                    <span className="font-medium">
                      +49 15259105754
                    </span>
                  </div>
                </div>

                <a
                  href="https://www.instagram.com/feliix.wxf"
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
                      @feliix.wxf
                    </span>
                  </div>
                </a>
              </div>
            </div>

            <form
              action="https://formspree.io/f/xqennvyy"
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

                      <p className="mt-6 text-lg font-bold">{review.name}</p>
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
                <h2 className="mt-3 text-4xl font-black">
                  {selectedReview.name}
                </h2>
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
                  Angaben gemäß § 5 TMG
                </h3>
                <p className="mt-3">
                  Felix Wolff
                  <br />
                  feliix.wxf Photography
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">Kontakt</h3>
                <p className="mt-3">
                  E-Mail: felixwolff411@gmail.com
                  <br />
                  Telefon: +49 15259105754
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
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Allgemeine Hinweise
                </h3>
                <p className="mt-3">
                  Der Schutz Ihrer persönlichen Daten ist uns wichtig.
                  Personenbezogene Daten werden vertraulich behandelt.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">
                  Kontaktformular
                </h3>
                <p className="mt-3">
                  Übermittelte Daten aus dem Kontaktformular werden zur
                  Bearbeitung Ihrer Anfrage gespeichert.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">
                  Externe Dienste
                </h3>
                <p className="mt-3">
                  Diese Website nutzt externe Dienste wie Formspree und externe
                  Bildquellen.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">
                  Ihre Rechte
                </h3>
                <p className="mt-3">
                  Sie haben jederzeit das Recht auf Auskunft, Berichtigung oder
                  Löschung Ihrer gespeicherten Daten.
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
