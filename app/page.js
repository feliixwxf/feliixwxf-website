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
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
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

  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [activeGallery, setActiveGallery] = useState(null);
  const [rating, setRating] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupClosed, setPopupClosed] = useState(false);
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [showImpressum, setShowImpressum] = useState(false);
  const [showDatenschutz, setShowDatenschutz] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("feliix-theme");
    const reviewVersion = localStorage.getItem("feliix-review-version");

    if (savedTheme) setTheme(savedTheme);

    if (reviewVersion !== "2") {
      localStorage.setItem("feliix-reviews", JSON.stringify(DEFAULT_REVIEWS));
      localStorage.setItem("feliix-review-version", "2");
      setReviews(DEFAULT_REVIEWS);
    } else {
      const savedReviews = localStorage.getItem("feliix-reviews");
      if (savedReviews) setReviews(JSON.parse(savedReviews));
    }

    const timer = setTimeout(() => setShowPopup(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("feliix-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("feliix-reviews", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    if (activeGallery) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeGallery]);

  const dark = theme === "dark";

  const navItems = ["Startseite", "Info", "Portfolio", "Bewertung", "Kontakt"];

  const pageStyle = dark
    ? "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(120,120,120,0.18),transparent_30%),linear-gradient(135deg,#080808,#18181b,#2d2d30)] text-white"
    : "bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.08),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.08),transparent_30%),linear-gradient(135deg,#f4f4f5,#d6d3d1,#fafafa)] text-neutral-950";

  const glass = dark
    ? "border-white/15 bg-white/10 text-white backdrop-blur-2xl"
    : "border-white/70 bg-white/65 text-neutral-950 backdrop-blur-2xl shadow-xl";

  const muted = dark ? "text-neutral-300" : "text-neutral-700";

  const hoverLift =
    "transition duration-300 hover:-translate-y-3 hover:scale-[1.03] hover:shadow-[0_0_45px_rgba(255,255,255,0.25)]";

  const buttonHover =
    "transition duration-300 hover:-translate-y-1 hover:scale-[1.04] hover:shadow-[0_0_35px_rgba(255,255,255,0.22)]";

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
    const percent = Math.min(
      100,
      Math.max(0, ((clientX - rect.left) / rect.width) * 100)
    );

    requestAnimationFrame(() => {
      if (beforeRef.current) {
        beforeRef.current.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      }
      if (lineRef.current) lineRef.current.style.left = `${percent}%`;
      if (handleRef.current) handleRef.current.style.left = `${percent}%`;
    });
  };

  const portfolioItems = [
    {
      title: "Car",
      key: "car",
      image:
        "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80",
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
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  const galleryImages = {
    car: [
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1400&q=80",
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
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1522158637959-30385a09e0da?auto=format&fit=crop&w=1400&q=80",
    ],
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    const newReview = {
      name: form.get("name"),
      text: form.get("text"),
      stars: rating || 5,
    };

    setReviews([newReview, ...reviews]);
    setRating(0);
    e.currentTarget.reset();
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
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );

  const ThemeToggle = () => (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={`relative flex h-10 w-[92px] items-center justify-between rounded-full border px-3 ${buttonHover} ${
        dark ? "border-white/30 bg-white/15" : "border-black/20 bg-white/75"
      }`}
      aria-label="Dark Light Mode wechseln"
    >
      <Sun className="z-10 h-4 w-4 text-yellow-400" />
      <Moon className="z-10 h-4 w-4 text-blue-200" />
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 450, damping: 30 }}
        className="absolute top-1 h-8 w-8 rounded-full bg-white shadow-xl"
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
            onClick={() => setActiveGallery(null)}
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
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="group overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur-xl"
              >
                <img
                  src={image}
                  alt=""
                  className="aspect-[3/4] h-full w-full rounded-[1.5rem] object-cover transition duration-700 group-hover:scale-105"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${pageStyle}`}>
      <header className="fixed top-0 z-50 w-full border-b border-white/15 bg-white/10 backdrop-blur-2xl">
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
                className={`rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur-xl hover:bg-white/30 ${buttonHover}`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden ${buttonHover}`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
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

            <div className={`rounded-[2rem] border p-4 shadow-2xl ${glass}`}>
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
                  src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80&sat=25"
                  alt="Nachher"
                  draggable="false"
                  className="absolute inset-0 h-full w-full object-cover contrast-125 saturate-150"
                />

                <div
                  ref={beforeRef}
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: "inset(0 50% 0 0)" }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80"
                    alt="Vorher"
                    draggable="false"
                    className="h-full w-full object-cover grayscale"
                  />
                </div>

                <div
                  ref={lineRef}
                  className="absolute top-0 h-full w-1 bg-white shadow-[0_0_30px_rgba(255,255,255,0.95)]"
                  style={{ left: "50%" }}
                />

                <div
                  ref={handleRef}
                  className={`absolute top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-white/70 bg-black/35 text-2xl text-white shadow-2xl backdrop-blur-xl ${buttonHover}`}
                  style={{ left: "50%" }}
                >
                  ↔
                </div>

                <div className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-sm text-white backdrop-blur-xl">
                  Vorher
                </div>
                <div className="absolute right-4 top-4 rounded-full bg-black/45 px-3 py-1 text-sm text-white backdrop-blur-xl">
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
                  className={`cursor-pointer overflow-hidden rounded-[2rem] border transition duration-300 hover:-translate-y-2 hover:shadow-2xl ${glass}`}
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-700 hover:scale-110"
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
            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Kundenstimmen
            </h2>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {reviews.map((review, i) => (
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
                  <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-yellow-400/20 blur-3xl" />
                  <div className="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-white/10 blur-3xl" />

                  <p className={`text-sm uppercase tracking-[0.3em] ${muted}`}>
                    Deine Meinung
                  </p>

                  <h3 className="relative mt-4 text-3xl font-black md:text-4xl">
                    Wie war dein Shooting?
                  </h3>

                  <p className={`relative mt-5 leading-8 ${muted}`}>
                    Hinterlasse eine kurze Bewertung. Deine Rückmeldung hilft anderen,
                    einen echten Eindruck von meiner Arbeit zu bekommen.
                  </p>

                  <div className="relative mt-8 rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
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
                      className="rounded-2xl border bg-white/90 px-4 py-4 text-neutral-950 outline-none transition focus:scale-[1.01] focus:border-yellow-400"
                    />

                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
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
                      className="rounded-2xl border bg-white/90 px-4 py-4 text-neutral-950 outline-none transition focus:scale-[1.01] focus:border-yellow-400 md:col-span-2"
                    />

                    <Button
                      type="submit"
                      className={`rounded-2xl py-6 text-base md:col-span-2 ${buttonHover}`}
                    >
                      Bewertung veröffentlichen
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
                Lass uns dein Shooting planen.
              </h2>
              <p className={`mt-6 max-w-xl text-lg leading-8 ${muted}`}>
                Schreib mir direkt über das Formular.
              </p>

              <div className={`mt-8 space-y-5 ${muted}`}>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl">
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

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl">
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
                  className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-pink-400/40 hover:bg-pink-500/10 hover:shadow-[0_0_35px_rgba(236,72,153,0.35)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 text-white shadow-lg">
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
              className="rounded-[2rem] border border-white/20 bg-white/20 p-6 shadow-2xl backdrop-blur-xl"
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
                  Mit dem Absenden erklärst du dich einverstanden, dass deine Angaben zur Bearbeitung deiner Anfrage verarbeitet werden.
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

      {showPopup && !popupClosed && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm rounded-[1.7rem] border border-white/40 bg-white/25 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
        >
          <button
            onClick={() => setPopupClosed(true)}
            className={`absolute right-3 top-3 rounded-full bg-black/25 p-1 text-white ${buttonHover}`}
          >
            <X className="h-4 w-4" />
          </button>

          <button
            onClick={() => scrollToSection("Kontakt")}
            className={`pr-6 text-left ${buttonHover}`}
          >
            <p className="text-lg font-black">Benötigen Sie ein Shooting?</p>
            <p className={`mt-2 text-sm ${muted}`}>
              Dann direkt hier klicken und eine Anfrage senden.
            </p>
          </button>
        </motion.div>
      )}

      {showImpressum && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/15 bg-neutral-950 p-8 text-white shadow-2xl">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/15 bg-neutral-950 p-8 text-white shadow-2xl">
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