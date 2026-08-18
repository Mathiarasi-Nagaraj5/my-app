"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

// ─── Slide data ───────────────────────────────────────────────────────────────

const slides = [
  {
    id: 1,
    image: "https://picsum.photos/seed/hero-black-tee/1600/900",
    eyebrow: "New Arrival",
    headline: "Oversized comfort.\nBuilt to last.",
    sub: "Heavy-weight cotton tees — made for everyday wear.",
    cta: { label: "Shop T-shirts", href: "/shop?category=t-shirts" },
    accent: "#C9A96E", // brass
  },
  {
    id: 2,
    image: "https://picsum.photos/seed/hero-hoodie/1600/900",
    eyebrow: "This Season",
    headline: "Wrap yourself\nin warmth.",
    sub: "Fleece-lined hoodies that feel like a second skin.",
    cta: { label: "Shop Hoodies", href: "/shop?category=hoodies" },
    accent: "#C9A96E",
  },
  {
    id: 3,
    image: "https://picsum.photos/seed/hero-pyjama/1600/900",
    eyebrow: "Sleep Better",
    headline: "Soft sets for\nquiet mornings.",
    sub: "Co-ord pyjama sets in breathable cotton.",
    cta: { label: "Shop Pyjamas", href: "/shop?category=pyjamas" },
    accent: "#C9A96E",
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
        const isPrev  = idx === prev;
        if (!isActive && !isPrev) return null;

        // Slide enters from right when going right, from left when going left
        const enterX  = isActive ? (direction === "right" ? "100%" : "-100%") : "0%";
        const exitX   = isPrev   ? (direction === "right" ? "-100%" : "100%") : "0%";

        return (
          <div
            key={slide.id}
            aria-hidden={!isActive}
            style={{
              position: "absolute",
              inset: 0,
              transform: animating
                ? isActive
                  ? `translateX(0)`    // settling in
                  : `translateX(${exitX})`  // leaving
                : isActive
                ? "translateX(0)"
                : `translateX(${enterX})`,
              transition: animating ? "transform 600ms cubic-bezier(0.77,0,0.18,1)" : "none",
              willChange: "transform",
              zIndex: isActive ? 2 : 1,
            }}
          >
            {/* Background image */}
            <img
              src={slide.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
            {/* Dark gradient overlay — bottom-heavy so text is always readable */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(20,18,16,0.82) 0%, rgba(20,18,16,0.45) 45%, rgba(20,18,16,0.18) 100%)",
              }}
            />

            {/* Text content */}
            <div className="absolute inset-0 flex flex-col justify-end px-6 pb-24 sm:px-12 sm:pb-28 md:px-20">
              <p
                className="mb-3 text-xs uppercase tracking-[0.22em] font-medium"
                style={{ color: slide.accent }}
              >
                {slide.eyebrow}
              </p>
              <h1
                className="mb-4 whitespace-pre-line font-serif text-3xl font-medium leading-tight text-ivory sm:text-4xl md:text-5xl lg:text-6xl max-w-xl"
              >
                {slide.headline}
              </h1>
              <p className="mb-8 max-w-sm text-sm leading-relaxed text-ivory/70">
                {slide.sub}
              </p>
              <Link
                href={slide.cta.href}
                className="inline-flex w-fit items-center gap-2 rounded-none border border-ivory px-6 py-3 text-sm font-medium tracking-wide text-ivory transition-colors duration-200 hover:bg-ivory hover:text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory"
              >
                {slide.cta.label}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 7h10M8 3l4 4-4 4" />
                </svg>
              </Link>
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
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => go(idx, idx > current ? "right" : "left")}
            aria-label={`Go to slide ${idx + 1}`}
            aria-current={idx === current ? "true" : undefined}
            className="relative h-[3px] overflow-hidden rounded-full bg-ivory/30 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ivory"
            style={{ width: idx === current ? 32 : 14 }}
          >
            {/* Progress fill on active dot */}
            {idx === current && !paused && (
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-ivory"
                style={{
                  animation: `progress ${AUTOPLAY_MS}ms linear forwards`,
                }}
              />
            )}
            {idx === current && paused && (
              <span className="absolute inset-0 rounded-full bg-ivory" />
            )}
          </button>
        ))}
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