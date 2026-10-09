"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

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

const AUTOPLAY_MS = 5000;

// ─── Arrow icons ──────────────────────────────────────────────────────────────

function ArrowLeft() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M13 4l-6 6 6 6" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 4l6 6-6 6" />
    </svg>
  );
}

const ARROW_BTN =
  "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-charcoal/10 bg-white/80 text-charcoal shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-pink hover:text-white hover:shadow-[0_6px_18px_rgba(236,72,153,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink";

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroSlider({ slides = [] }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Prevent invalid current index if slides change
  useEffect(() => {
    if (slides.length === 0) {
      setCurrent(0);
      return;
    }

    if (current >= slides.length) {
      setCurrent(0);
    }
  }, [slides.length, current]);

  const go = useCallback(
    (next: number, dir: "left" | "right") => {
      if (animating || next === current || slides.length === 0) return;

      setDirection(dir);
      setPrev(current);
      setCurrent(next);
      setAnimating(true);
    },
    [animating, current, slides.length]
  );

  const goNext = useCallback(() => {
    if (!slides.length) return;
    go((current + 1) % slides.length, "right");
  }, [current, go, slides.length]);

  const goPrev = useCallback(() => {
    if (!slides.length) return;
    go((current - 1 + slides.length) % slides.length, "left");
  }, [current, go, slides.length]);

  // Autoplay
  useEffect(() => {
    if (paused || slides.length <= 1) return;

    timerRef.current = setTimeout(goNext, AUTOPLAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, paused, goNext, slides.length]);

  // End animation
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

  // No slides configured
  if (!slides.length) return null;

  return (
    <section
      className="relative h-[75vh] max-h-[800px] min-h-[520px] w-full select-none overflow-hidden bg-charcoal"
      aria-label="Hero image slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Slides ──────────────────────────────────────────────────────────── */}

      {slides.map((slide, idx) => {
        const isActive = idx === current;
        const isPrev = idx === prev;

        if (!isActive && !isPrev) return null;

        const enterX = direction === "right" ? "100%" : "-100%";
        const exitX = direction === "right" ? "-100%" : "100%";

        return (
          <div
            key={`${slide.image}-${idx}`}
            aria-hidden={!isActive}
            className="absolute inset-0 overflow-hidden"
            style={{
              transform: animating
                ? isActive
                  ? "translateX(0)"
                  : `translateX(${exitX})`
                : isActive
                  ? "translateX(0)"
                  : `translateX(${enterX})`,
              transition: animating ? "transform 600ms cubic-bezier(0.77,0,0.18,1)" : "none",
              willChange: "transform",
              zIndex: isActive ? 2 : 1,
            }}
          >
            {/* Background: warm base with a soft pink wash on the image side */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 75% 60%, rgba(236,72,153,0.18) 0%, rgba(236,72,153,0) 55%), #EDE7DD",
              }}
            />

            {/* Soft pink circle behind the model */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 right-[10%] hidden aspect-square h-[85%] rounded-full bg-pink/20 blur-2xl sm:block"
            />

            {/* Left fade so text stays readable */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, #EDE7DD 0%, #EDE7DD 34%, rgba(237,231,221,0) 70%)",
              }}
            />

            {/* Image (paints above the background layers) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="absolute bottom-0 right-[6%] hidden h-[98%] w-auto max-w-[68%] object-contain object-bottom drop-shadow-[0_20px_30px_rgba(0,0,0,0.18)] sm:block"
            />

            {/* Content */}
            <div className="relative z-[3] flex h-full items-center px-8 sm:px-12 lg:px-20">
              <div
                className="animate-fade-up max-w-xl"
                style={{ animationDelay: "200ms" }}
              >
                <p
                  className="mb-5 inline-flex items-center gap-2 rounded-full border border-current px-4 py-1 text-xs font-medium tracking-wide"
                  style={{ color: slide.accentColor }}
                >
                  <span aria-hidden="true">✦</span>
                  {slide.eyebrow}
                </p>

                <h1 className="whitespace-pre-line font-serif text-4xl font-medium leading-[1.1] tracking-tight text-charcoal sm:text-5xl lg:text-6xl">
                  {slide.headline}
                </h1>

                {/* divider */}
                <div className="mt-5 flex items-center gap-3" aria-hidden="true">
                  <span className="h-px w-16 bg-gradient-to-r from-pink to-transparent md:w-24" />
                  <span className="text-xs leading-none text-pink">✦</span>
                </div>

                <p className="mt-5 max-w-md text-sm leading-6 text-charcoal/70 sm:text-base">
                  {slide.sub}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href={slide.ctaHref}
                    className="group inline-flex items-center gap-2 border border-pink bg-charcoal px-8 py-3 text-sm font-semibold text-white shadow-md shadow-pink/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(236,72,153,0.5)]"
                  >
                    {slide.ctaLabel}
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>

                  {slide.ctaSecondaryLabel && slide.ctaSecondaryHref && (
                    <Link
                      href={slide.ctaSecondaryHref}
                      className="inline-flex items-center border border-charcoal px-8 py-3 text-sm font-semibold text-charcoal transition-all duration-300 hover:-translate-y-0.5 hover:bg-charcoal hover:text-ivory"
                    >
                      {slide.ctaSecondaryLabel}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* ── Prev / Next arrows ─────────────────────────────────────────────── */}

      {slides.length > 1 && (
        <>
          <button onClick={goPrev} aria-label="Previous slide" className={`${ARROW_BTN} left-4`}>
            <ArrowLeft />
          </button>

          <button onClick={goNext} aria-label="Next slide" className={`${ARROW_BTN} right-4`}>
            <ArrowRight />
          </button>
        </>
      )}

      {/* ── Dots ───────────────────────────────────────────────────────────── */}

      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => go(idx, idx > current ? "right" : "left")}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === current ? "w-8 bg-charcoal" : "w-2 bg-charcoal/25 hover:bg-charcoal/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Slide counter ─────────────────────────────────────────────────── */}

      {slides.length > 1 && (
        <div className="absolute bottom-7 right-6 z-10 font-serif text-sm tabular-nums text-charcoal/50 sm:right-12">
          <span className="text-base font-medium text-charcoal">
            {String(current + 1).padStart(2, "0")}
          </span>{" "}
          / {String(slides.length).padStart(2, "0")}
        </div>
      )}
    </section>
  );
}