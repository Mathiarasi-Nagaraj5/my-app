"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

export interface HeroSlide {
  eyebrow: string;
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
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
    >
      <path d="M7 4l6 6-6 6" />
    </svg>
  );
}

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
      if (
        animating ||
        next === current ||
        slides.length === 0
      ) {
        return;
      }

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

    go(
      (current - 1 + slides.length) % slides.length,
      "left"
    );
  }, [current, go, slides.length]);

  // Autoplay
  useEffect(() => {
    if (paused || slides.length <= 1) return;

    timerRef.current = setTimeout(goNext, AUTOPLAY_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
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

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [goNext, goPrev]);

  // No slides configured
  if (!slides.length) {
    return null;
  }

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

        const enterX =
          direction === "right" ? "100%" : "-100%";

        const exitX =
          direction === "right" ? "-100%" : "100%";

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

              transition: animating
                ? "transform 600ms cubic-bezier(0.77,0,0.18,1)"
                : "none",

              willChange: "transform",
              zIndex: isActive ? 2 : 1,
            }}
          >
            {/* ─────────────── BACKGROUND ─────────────── */}

            <div
              className="absolute inset-0"
              style={{
                backgroundColor: "#EDE7DD",
              }}
            />

            {/* ─────────────── LEFT GRADIENT ─────────────── */}

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  linear-gradient(
                    90deg,
                    #EDE7DD 0%,
                    #EDE7DD 38%,
                    transparent 72%
                  )
                `,
              }}
            />

            {/* ─────────────── IMAGE ───────────────
                Rendered AFTER the background + gradient layers so it
                paints on top of them instead of being covered by the
                opaque background div. This was the bug: the image used
                to render first, then the solid #EDE7DD div painted
                directly over it. */}

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

            {/* ─────────────── CONTENT ─────────────── */}

            <div className="relative z-[3] flex h-full items-center px-8 sm:px-12 lg:px-20">
              <div className="max-w-xl">

                <p
                  className="mb-4 text-xs font-semibold uppercase tracking-[0.25em]"
                  style={{
                    color: slide.accentColor,
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
                  href={slide.ctaHref}
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
                  {slide.ctaLabel}
                </Link>

              </div>
            </div>
          </div>
        );
      })}

      {/* ── Prev / Next arrows ─────────────────────────────────────────────── */}

      {slides.length > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="Previous slide"
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              z-10
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-charcoal/40
              text-ivory
              backdrop-blur-sm
              transition
              hover:bg-charcoal/70
              focus-visible:outline
              focus-visible:outline-2
              focus-visible:outline-ivory
            "
          >
            <ArrowLeft />
          </button>

          <button
            onClick={goNext}
            aria-label="Next slide"
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              z-10
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-charcoal/40
              text-ivory
              backdrop-blur-sm
              transition
              hover:bg-charcoal/70
              focus-visible:outline
              focus-visible:outline-2
              focus-visible:outline-ivory
            "
          >
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
              className={`
                h-2
                rounded-full
                transition-all
                ${
                  idx === current
                    ? "w-8 bg-charcoal"
                    : "w-2 bg-charcoal/30"
                }
              `}
            />
          ))}
        </div>
      )}

      {/* ── Slide counter ─────────────────────────────────────────────────── */}

      {slides.length > 1 && (
        <div className="absolute bottom-8 right-6 z-10 font-mono text-xs tabular-nums tracking-widest text-charcoal/40 sm:right-12">
          {String(current + 1).padStart(2, "0")} /{" "}
          {String(slides.length).padStart(2, "0")}
        </div>
      )}
    </section>
  );
}