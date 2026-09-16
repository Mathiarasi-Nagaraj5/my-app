"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Product } from "@/app/lib/types";
import ProductCard from "../ui/ProductCard";

interface ProductRailProps {
  title: string;
  products: Product[];
  viewAllHref?: string;
  tone?: "ivory" | "charcoal-tint";
}

export default function ProductRail({
  title,
  products,
  viewAllHref = "/shop",
  tone = "ivory",
}: ProductRailProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!products || products.length === 0) {
    return null;
  }

  /*
   * Number of products visible:
   * Desktop  -> 3
   * Tablet   -> 2
   * Mobile   -> 1
   */
  const getVisibleCount = () => {
    if (typeof window === "undefined") return 3;

    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;

    return 3;
  };

  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(getVisibleCount());
    };

    updateVisibleCount();

    window.addEventListener("resize", updateVisibleCount);

    return () => {
      window.removeEventListener("resize", updateVisibleCount);
    };
  }, []);

  const maxIndex = Math.max(products.length - visibleCount, 0);

  /*
   * Automatic sliding
   * Changes product every 3 seconds
   */
  useEffect(() => {
    if (products.length <= visibleCount) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) {
          return 0;
        }

        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [products.length, visibleCount, maxIndex]);

  /*
   * Move slider whenever currentIndex changes
   */
  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    const firstCard = slider.children[0] as HTMLElement;

    if (!firstCard) return;

    const gap = 16;

    const cardWidth = firstCard.offsetWidth + gap;

    slider.style.transform = `translateX(-${
      currentIndex * cardWidth
    }px)`;
  }, [currentIndex, visibleCount]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => {
      if (prev <= 0) {
        return maxIndex;
      }

      return prev - 1;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      if (prev >= maxIndex) {
        return 0;
      }

      return prev + 1;
    });
  };

  return (
    <section
      className={`px-6 py-12 ${
        tone === "charcoal-tint"
          ? "bg-[#FFFDFC]"
          : "bg-[#FDF5F8]"
      }`}
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-serif text-3xl font-medium text-charcoal">
            {title}
          </h2>

          <Link
            href={viewAllHref}
            className="text-lg italic text-black hover:underline"
          >
            View all
          </Link>
        </div>

        {/* Slider Container */}
        <div className="relative overflow-hidden">

          {/* Product Track */}
          <div
            ref={sliderRef}
            className="flex gap-4 transition-transform duration-700 ease-in-out"
          >
            {products.map((product) => (
              <div
                key={product._id}
                className="
                  min-w-0
                  flex-[0_0_calc(100%-0px)]
                  sm:flex-[0_0_calc(50%-8px)]
                  lg:flex-[0_0_calc(33.333%-11px)]
                "
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {products.length > visibleCount && (
            <>
              {/* Previous */}
              <button
                type="button"
                onClick={handlePrevious}
                aria-label={`Previous ${title}`}
                className="
                  absolute
                  left-2
                  top-1/2
                  z-10
                  flex
                  h-9
                  w-9
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-pink/90
                  text-black
                  shadow-md
                  transition
                  hover:bg-white
                "
              >
                ←
              </button>

              {/* Next */}
              <button
                type="button"
                onClick={handleNext}
                aria-label={`Next ${title}`}
                className="
                  absolute
                  right-2
                  top-1/2
                  z-10
                  flex
                  h-9
                  w-9
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-pink/90
                  text-black
                  shadow-md
                  transition
                  hover:bg-white
                "
              >
                →
              </button>
            </>
          )}
        </div>

        {/* Slider Dots */}
        {products.length > visibleCount && (
          <div className="mt-5 flex justify-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === index
                    ? "w-6 bg-black"
                    : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}