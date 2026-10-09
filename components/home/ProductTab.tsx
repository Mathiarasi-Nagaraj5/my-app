"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Product } from "@/app/lib/types";
import ProductCard from "../ui/ProductCard";

interface Tab {
  id: string;
  label: string;
  products: Product[];
  viewAllHref: string;
}

interface ProductTabsProps {
  tabs: Tab[];
}

const GAP = 16; // must match gap-4

export default function ProductTabs({ tabs }: ProductTabsProps) {
  // hide tabs that have no products
  const available = tabs.filter((t) => t.products && t.products.length > 0);

  const sliderRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [activeId, setActiveId] = useState(available[0]?.id);
  const [selectedId, setSelectedId] = useState(available[0]?.id); // tab highlight, instant
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [paused, setPaused] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const active = available.find((t) => t.id === activeId) ?? available[0];
  const products = active?.products ?? [];
  const maxIndex = Math.max(products.length - visibleCount, 0);

  // desktop 4, tablet 3, mobile 2
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVisibleCount(w < 640 ? 2 : w < 1024 ? 3 : 4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // auto-slide, paused while the user hovers or touches
  useEffect(() => {
    if (paused || fading || products.length <= visibleCount) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(id);
  }, [paused, fading, products.length, visibleCount, maxIndex]);

  // move the track
  useEffect(() => {
    const slider = sliderRef.current;
    const firstCard = slider?.children[0] as HTMLElement | undefined;
    if (!slider || !firstCard) return;
    slider.style.transform = `translateX(-${currentIndex * (firstCard.offsetWidth + GAP)}px)`;
  }, [currentIndex, visibleCount, activeId]);

  // keep index valid if screen size changes
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const selectTab = (id: string) => {
    if (id === selectedId) return;
    clearTimeout(timeoutRef.current);
    setSelectedId(id); // highlight moves immediately
    setFading(true); // fade current products out

    timeoutRef.current = setTimeout(() => {
      setActiveId(id); // swap products while invisible
      setCurrentIndex(0);
      setFading(false); // fade new products in
    }, 250);
  };

  // empty check comes AFTER all hooks
  if (!active) return null;

  const prev = () => setCurrentIndex((i) => (i <= 0 ? maxIndex : i - 1));
  const next = () => setCurrentIndex((i) => (i >= maxIndex ? 0 : i + 1));

  return (
    <section className="bg-[#FFFDFC] px-6 py-14">
      <div className="mx-auto max-w-6xl">
        {/* header: tabs + view all */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="tablist">
            {available.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                onClick={() => selectTab(tab.id)}
                aria-selected={tab.id === selectedId}
                className={`rounded-full px-4 py-1.5 font-serif text-base transition-all duration-300 md:px-5 md:text-xl ${
                  tab.id === selectedId
                    ? "bg-charcoal text-ivory shadow-md shadow-pink/20"
                    : "text-charcoal/50 hover:bg-charcoal/5 hover:text-charcoal"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link
            href={active.viewAllHref}
            className="group inline-flex items-center gap-1 font-serif text-base italic text-charcoal transition-colors hover:text-pink md:text-lg"
          >
            View all
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* divider */}
        <div className="mb-8 mt-4 h-px bg-gradient-to-r from-pink/60 via-pink/20 to-transparent" />

        <div
          className={`transition-all duration-300 ease-in-out ${
            fading ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          {/* slider */}
          <div
            className="relative -mx-2 overflow-hidden px-2 pb-6 pt-2"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
          >
            <div
              ref={sliderRef}
              key={active.id}
              className="flex gap-4 transition-transform duration-700 ease-in-out"
            >
              {products.map((product) => (
                <div
                  key={product._id}
                  className="min-w-0 flex-[0_0_calc((100%_-_16px)/2)] sm:flex-[0_0_calc((100%_-_32px)/3)] lg:flex-[0_0_calc((100%_-_48px)/4)]"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {products.length > visibleCount && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous products"
                  className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-charcoal/10 bg-white text-charcoal shadow-md transition-all duration-300 hover:bg-pink hover:text-white hover:shadow-[0_6px_18px_rgba(236,72,153,0.45)]"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next products"
                  className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-charcoal/10 bg-white text-charcoal shadow-md transition-all duration-300 hover:bg-pink hover:text-white hover:shadow-[0_6px_18px_rgba(236,72,153,0.45)]"
                >
                  →
                </button>
              </>
            )}
          </div>

          {/* dots */}
          {products.length > visibleCount && (
            <div className="mt-2 flex justify-center gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentIndex === i ? "w-6 bg-pink" : "w-2 bg-charcoal/20 hover:bg-charcoal/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}