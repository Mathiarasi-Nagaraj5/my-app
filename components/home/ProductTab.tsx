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

const GAP = 16;

export default function ProductTabs({ tabs }: ProductTabsProps) {
  // hide tabs that have no products
  const available = tabs.filter((t) => t.products && t.products.length > 0);

  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(available[0]?.id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [paused, setPaused] = useState(false);

  const active = available.find((t) => t.id === activeId) ?? available[0];
  const products = active?.products ?? [];
  const maxIndex = Math.max(products.length - visibleCount, 0);

  // desktop 3, tablet 2, mobile 1
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVisibleCount(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // auto-slide, paused while the user hovers or touches
  useEffect(() => {
    if (paused || products.length <= visibleCount) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(id);
  }, [paused, products.length, visibleCount, maxIndex]);

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
    setActiveId(id);
    setCurrentIndex(0);
  };

  // empty check comes AFTER all hooks
  if (!active) return null;

  const prev = () => setCurrentIndex((i) => (i <= 0 ? maxIndex : i - 1));
  const next = () => setCurrentIndex((i) => (i >= maxIndex ? 0 : i + 1));

  return (
    <section className="bg-[#FFFDFC] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        {/* header: tabs + view all */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="flex gap-6" role="tablist">
            {available.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={tab.id === active.id}
                onClick={() => selectTab(tab.id)}
                className={`border-b-2 pb-1 font-serif text-2xl transition-colors md:text-3xl ${
                  tab.id === active.id
                    ? "border-pink text-charcoal"
                    : "border-transparent text-charcoal/40 hover:text-charcoal/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link href={active.viewAllHref} className="text-lg italic text-black hover:underline">
            View all
          </Link>
        </div>

        {/* slider */}
        <div
          className="relative overflow-hidden"
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
                className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_calc(50%-8px)] lg:flex-[0_0_calc(33.333%-11px)]"
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
                className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-pink/90 text-lg text-white shadow-md transition hover:bg-white hover:text-black"
              >
                ←
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next products"
                className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-pink/90 text-lg text-white shadow-md transition hover:bg-white hover:text-black"
              >
                →
              </button>
            </>
          )}
        </div>

        {/* dots */}
        {products.length > visibleCount && (
          <div className="mt-5 flex justify-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === i ? "w-6 bg-black" : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}