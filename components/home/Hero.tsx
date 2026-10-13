"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HeroSlide {
  eyebrow: string;
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  image: string;
  accentColor: string;
}

interface HeroSliderProps {
  slides?: HeroSlide[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const AUTOPLAY_MS = 5500;
const FADE_MS = 700;

const INK = "#1F1F1F";
const PINK = "#E0609A";

/** Soft background tints, one per slide (cycles). All stay in the site's beige / blush family. */
const TINTS = ["#EDE7DD", "#F1E0E0", "#E8E2D6"];

/** Photo shape per slide (cycles): echoes the circles in "Shop by Category". */
const SHAPES = ["circle", "arch", "frame"] as const;
type Shape = (typeof SHAPES)[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Uses your own line breaks, otherwise splits the words into at most two balanced lines. */
function splitLines(text: string): string[] {
  if (text.includes("\n")) return text.split("\n").map((l) => l.trim()).filter(Boolean);
  const words = text.split(" ").filter(Boolean);
  if (words.length < 2) return words;
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

function Photo({ src }: { src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" draggable={false} className="h-full w-full object-cover object-top" />
  );
}

// ─── Photo shapes ─────────────────────────────────────────────────────────────

function PhotoShape({ shape, src, active }: { shape: Shape; src: string; active: boolean }) {
  if (shape === "circle") {
    return (
      <div className="relative aspect-square h-full max-h-full md:h-[86%]">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-[#E0609A]/50"
          style={{ transform: "scale(1.08)" }}
        />
        <div className="absolute inset-0 overflow-hidden rounded-full border-[6px] border-white bg-[#F7F1E8] shadow-[0_18px_40px_rgba(0,0,0,0.15)]">
          <Photo src={src} />
        </div>
      </div>
    );
  }

  if (shape === "arch") {
    return (
      <div className="relative aspect-[4/5] h-full max-h-full md:h-[92%]">
        <div
          aria-hidden="true"
          className="absolute inset-0 translate-x-3 -translate-y-3 rounded-t-[999px] border border-[#E0609A]"
        />
        <div className="absolute inset-0 overflow-hidden rounded-t-[999px] bg-[#F7F1E8] shadow-[0_18px_40px_rgba(0,0,0,0.15)]">
          <Photo src={src} />
        </div>
      </div>
    );
  }

  // frame: white photo frame over a pink card
  return (
    <div className="relative aspect-[4/5] h-full max-h-full md:h-[90%]">
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-sm transition-transform duration-700"
        style={{
          backgroundColor: PINK,
          opacity: 0.85,
          transform: active ? "translate(14px,10px) rotate(5deg)" : "none",
        }}
      />
      <div
        className="absolute inset-0 rounded-sm bg-white pb-[14%] pl-[5%] pr-[5%] pt-[5%] shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition-transform duration-700"
        style={{ transform: active ? "rotate(-3deg)" : "rotate(-8deg) translateY(24px)" }}
      >
        <Photo src={src} />
      </div>
    </div>
  );
}

// ─── Single slide ─────────────────────────────────────────────────────────────

function Slide({ slide, idx, active }: { slide: HeroSlide; idx: number; active: boolean }) {
  const tint = TINTS[idx % TINTS.length];
  const shape = SHAPES[idx % SHAPES.length];
  const lines = splitLines(slide.headline);

  return (
    <>
      {/* Background: soft tint with a pink wash on the photo side */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 75% 55%, rgba(224,96,154,0.20) 0%, rgba(224,96,154,0) 55%), ${tint}`,
        }}
      />

      <div className="relative z-[2] mx-auto grid h-full max-w-[1400px] grid-rows-[auto_1fr] gap-6 px-6 pb-24 pt-8 md:grid-cols-[1.1fr_0.9fr] md:grid-rows-1 md:items-center md:gap-8 md:px-12 md:pt-6 lg:px-20">
        {/* Text */}
        <div
          className="flex flex-col items-start"
          style={{
            transform: active ? "translateY(0)" : "translateY(24px)",
            transition: `transform ${FADE_MS}ms cubic-bezier(0.2,0.8,0.2,1)`,
          }}
        >
          <p
            className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-medium tracking-wide"
            style={{ color: slide.accentColor || PINK, borderColor: "currentColor" }}
          >
            <span aria-hidden="true">✦</span>
            {slide.eyebrow}
          </p>

          <h1 className="font-serif text-[clamp(2.5rem,min(6.5vw,10vh),5rem)] font-medium leading-[1.05] tracking-tight text-[#1F1F1F]">
            {lines.map((line, i) => (
              <span
                key={i}
                className={`block ${lines.length > 1 && i === lines.length - 1 ? "italic" : ""}`}
                style={lines.length > 1 && i === lines.length - 1 ? { color: PINK } : undefined}
              >
                {line}
              </span>
            ))}
          </h1>

          <div className="mt-5 flex items-center gap-3" aria-hidden="true">
            <span className="h-px w-16 bg-gradient-to-r from-[#E0609A] to-transparent md:w-24" />
            <span className="text-xs leading-none" style={{ color: PINK }}>✦</span>
          </div>

          <p className="mt-5 max-w-md text-sm leading-6 text-[#1F1F1F]/70 sm:text-base">{slide.sub}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={slide.ctaHref}
              className="group inline-flex items-center gap-2 border bg-[#1F1F1F] px-8 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(224,96,154,0.45)]"
              style={{ borderColor: PINK, boxShadow: "0 6px 16px rgba(224,96,154,0.25)" }}
            >
              {slide.ctaLabel}
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>

            {slide.ctaSecondaryLabel && slide.ctaSecondaryHref && (
              <Link
                href={slide.ctaSecondaryHref}
                className="inline-flex items-center border border-[#1F1F1F] px-8 py-3 text-sm font-semibold text-[#1F1F1F] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1F1F1F] hover:text-white"
              >
                {slide.ctaSecondaryLabel}
              </Link>
            )}
          </div>
        </div>

        {/* Photo */}
        <div className="flex min-h-0 items-center justify-center md:h-full">
          <PhotoShape shape={shape} src={slide.image} active={active} />
        </div>
      </div>
    </>
  );
}

// ─── Slider ───────────────────────────────────────────────────────────────────

export default function HeroSlider({ slides = [] }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (count > 0 && current >= count) setCurrent(0);
  }, [count, current]);

  const go = useCallback(
    (next: number) => {
      if (next === current || !count) return;
      setPrev(current);
      setCurrent(next);
    },
    [current, count]
  );

  const goNext = useCallback(() => go((current + 1) % count), [go, current, count]);
  const goPrev = useCallback(() => go((current - 1 + count) % count), [go, current, count]);

  // Keep the outgoing slide underneath until the fade finishes
  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), FADE_MS);
    return () => clearTimeout(t);
  }, [prev]);

  // Autoplay
  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setTimeout(goNext, AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [current, paused, goNext, count]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  if (!count) return null;

  return (
    <section
      className="relative h-[720px] w-full select-none overflow-hidden bg-[#EDE7DD] md:h-[75vh] md:max-h-[820px] md:min-h-[580px]"
      aria-label="Hero slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style>{`
        @keyframes heroFill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @media (prefers-reduced-motion: reduce) { .hero-fill { animation: none !important; transform: scaleX(1); } }
      `}</style>

      {slides.map((slide, idx) => {
        const active = idx === current;
        const visible = active || idx === prev;

        return (
          <div
            key={`${slide.image}-${idx}`}
            aria-hidden={!active}
            className="absolute inset-0"
            style={{
              opacity: visible ? 1 : 0,
              zIndex: active ? 2 : visible ? 1 : 0,
              pointerEvents: active ? "auto" : "none",
              transition: `opacity ${FADE_MS}ms ease`,
            }}
          >
            <Slide slide={slide} idx={idx} active={active} />
          </div>
        );
      })}

      {count > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#1F1F1F]/10 bg-white/80 text-[#1F1F1F] shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-[#E0609A] hover:text-white md:flex"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 4l-6 6 6 6" /></svg>
          </button>
          <button
            onClick={goNext}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#1F1F1F]/10 bg-white/80 text-[#1F1F1F] shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-[#E0609A] hover:text-white md:flex"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 4l6 6-6 6" /></svg>
          </button>

          {/* Progress */}
          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => go(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={idx === current}
                className="relative h-1.5 w-8 overflow-hidden rounded-full bg-[#1F1F1F]/20 sm:w-12"
              >
                {idx === current && (
                  <span
                    key={`fill-${current}`}
                    className="hero-fill absolute inset-0 origin-left rounded-full bg-[#1F1F1F]"
                    style={{
                      animation: `heroFill ${AUTOPLAY_MS}ms linear forwards`,
                      animationPlayState: paused ? "paused" : "running",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}