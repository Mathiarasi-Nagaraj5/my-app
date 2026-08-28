"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

// ─── Slide data ───────────────────────────────────────────────────────────────

const slides = [
  {
    id: 1,
    image: "/images/hero/tshirt.png",
    panelColor: "#EDE7DD",
    eyebrow: "New Arrival",
    headline: "Oversized comfort.\nBuilt to last.",
    sub: "Heavy-weight cotton tees — made for everyday wear.",
    cta: {
      label: "Shop T-shirts",
      href: "/shop?category=t-shirts",
    },
    accent: "#C9A96E",
  },
  {
    id: 2,
    image: "/images/hero/hoodie.png",
    panelColor: "#FDF5F8",
    eyebrow: "This Season",
    headline: "Wrap yourself\nin warmth.",
    sub: "Fleece-lined hoodies that feel like a second skin.",
    cta: {
      label: "Shop Hoodies",
      href: "/shop?category=hoodies",
    },
    accent: "#C8A9A9",
  },
  {
    id: 3,
    image: "/images/hero/pyjama.png",
   panelColor: "#E8B4C8",
    eyebrow: "Sleep Better",
    headline: "Soft sets for\nquiet mornings.",
    sub: "Co-ord pyjama sets in breathable cotton.",
    cta: {
      label: "Shop Pyjamas",
      href: "/shop?category=pyjamas",
    },
    accent: "#C9ACCC",
  },
];
const AUTOPLAY_MS = 5000;

// ─── Arrow icons ──────────────────────────────────────────────────────────────

function ArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 4l-6 6 6 6" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4l6 6-6 6" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = useCallback(
    (next: number, dir: "left" | "right") => {
      if (animating || next === current) return;
      setDirection(dir);
      setPrev(current);
      setCurrent(next);
      setAnimating(true);
    },
    [animating, current]
  );

  const goNext = useCallback(
    () => go((current + 1) % slides.length, "right"),
    [current, go]
  );

  const goPrev = useCallback(
    () => go((current - 1 + slides.length) % slides.length, "left"),
    [current, go]
  );

  // Autoplay
  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(goNext, AUTOPLAY_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, paused, goNext]);

  // End animation frame
  useEffect(() => {
    if (!animating) return;
    const t = setTimeout(() => {
      setAnimating(false);
      setPrev(null);
    }, 600);
    return () => clearTimeout(t);
  }, [animating]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  return (
    <section
      className="relative h-[75vh] min-h-[520px] max-h-[800px] w-full overflow-hidden bg-charcoal select-none"
      aria-label="Hero image slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Slides ──────────────────────────────────────────────────────────── */}
{slides.map((slide, idx) => {
  const isActive = idx === current;
  const isPrev = idx === prev;

  if (!isActive && !isPrev) return null;

  const exitX = direction === "right" ? "-100%" : "100%";

  return (
    <div
      key={slide.id}
      aria-hidden={!isActive}
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundColor: slide.panelColor,

        transform: animating
          ? isActive
            ? "translateX(0)"
            : `translateX(${exitX})`
          : "translateX(0)",

        transition: animating
          ? "transform 600ms cubic-bezier(0.77,0,0.18,1)"
          : "none",

        willChange: "transform",
        zIndex: isActive ? 2 : 1,
      }}
    >
  <img
  src={slide.image}
  alt=""
  aria-hidden="true"
  draggable={false}
  className="
    hidden
    sm:block
    absolute
    bottom-0
    right-[6%]
    h-[98%]
    w-auto
    max-w-[68%]
    object-contain
    object-bottom
  "
/>

      {/* ================= LEFT GRADIENT ================= */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            90deg,
            ${slide.panelColor} 0%,
            ${slide.panelColor} 38%,
            transparent 72%
          )`,
        }}
      />

      {/* ================= CONTENT ================= */}
      <div className="relative z-[3] flex h-full items-center px-8 sm:px-12 lg:px-20">
        <div className="max-w-xl">

          <p
            className="mb-4 text-xs font-semibold uppercase tracking-[0.25em]"
            style={{
              color: slide.accent,
            }}
          >
            {slide.eyebrow}
          </p>

          <h1
            className="
              whitespace-pre-line
              text-4xl
              font-light
              leading-[1.05]
              tracking-tight
              text-charcoal
              sm:text-5xl
              lg:text-6xl
          "
          >
            {slide.headline}
          </h1>

          <p className="mt-6 max-w-md text-sm leading-6 text-charcoal/70 sm:text-base">
            {slide.sub}
          </p>

          <Link
            href={slide.cta.href}
            className="
              mt-8
              inline-flex
              items-center
              border
              border-charcoal
              bg-charcoal
              px-7
              py-3
              text-sm
              font-medium
              text-ivory
              transition
              hover:bg-transparent
              hover:text-charcoal
            "
          >
            {slide.cta.label}
          </Link>

        </div>
      </div>
    </div>
  );
})}

      {/* ── Prev / Next arrows ───────────────────────────────────────────────── */}
      <button
        onClick={goPrev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-charcoal/40 text-ivory backdrop-blur-sm transition hover:bg-charcoal/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ivory"
      >
        <ArrowLeft />
      </button>
      <button
        onClick={goNext}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-charcoal/40 text-ivory backdrop-blur-sm transition hover:bg-charcoal/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ivory"
      >
        <ArrowRight />
      </button>

      {/* ── Dot indicators ───────────────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5">
{/* ── Slides ─────────────────────────────────────────────── */}
{slides.map((slide, idx) => {
  const isActive = idx === current;
  const isPrev = idx === prev;

  if (!isActive && !isPrev) return null;

  const enterX =
    direction === "right" ? "100%" : "-100%";

  const exitX =
    direction === "right" ? "-100%" : "100%";

  return (
    <div
      key={slide.id}
      aria-hidden={!isActive}
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundColor: slide.panelColor,
        transform: animating
          ? isActive
            ? "translateX(0)"
            : `translateX(${exitX})`
          : isActive
            ? "translateX(0)"
            : `translateX(${enterX})`,
        transition: animating
          ? "transform 600ms cubic-bezier(0.77,0,0.18,1)"
          : "none",
        willChange: "transform",
        zIndex: isActive ? 2 : 1,
      }}
    >
      {/* ─────────────── PNG IMAGE ─────────────── */}
    <img
  src={slide.image}
  alt=""
  aria-hidden="true"
  draggable={false}
  className="
    hidden
    sm:block
    absolute
    bottom-0
    right-[6%]
    h-[98%]
    w-auto
    max-w-[68%]
    object-contain
    object-bottom
  "
/>

      {/* ─────────────── SOFT LEFT GRADIENT ─────────────── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(
            90deg,
            ${slide.panelColor} 0%,
            ${slide.panelColor} 38%,
            transparent 72%
          )`,
        }}
      />

      {/* ─────────────── CONTENT ─────────────── */}
      <div className="relative z-[3] flex h-full items-center px-8 sm:px-12 lg:px-20">
        <div className="max-w-xl">

          <p
            className="mb-4 text-xs font-semibold uppercase tracking-[0.25em]"
            style={{
              color: slide.accent,
            }}
          >
            {slide.eyebrow}
          </p>

          <h1
            className="
              whitespace-pre-line
              text-4xl
              font-light
              leading-[1.05]
              tracking-tight
              text-charcoal
              sm:text-5xl
              lg:text-6xl
            "
          >
            {slide.headline}
          </h1>

          <p className="mt-6 max-w-md text-sm leading-6 text-charcoal/70 sm:text-base">
            {slide.sub}
          </p>

          <Link
            href={slide.cta.href}
            className="
              mt-8
              inline-flex
              items-center
              border
              border-charcoal
              bg-charcoal
              px-7
              py-3
              text-sm
              font-medium
              text-ivory
              transition
              hover:bg-transparent
              hover:text-charcoal
            "
          >
            {slide.cta.label}
          </Link>

        </div>
      </div>
    </div>
  );
})}
      </div>

      {/* ── Slide counter ────────────────────────────────────────────────────── */}
      <div className="absolute bottom-8 right-6 z-10 font-mono text-xs tabular-nums text-ivory/40 tracking-widest sm:right-12">
        {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
      </div>

      {/* Keyframe for progress bar */}
      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </section>
  );
}