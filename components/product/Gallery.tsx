"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryProps {
  imageUrls: string[];
  productName: string;
}

export default function Gallery({
  imageUrls,
  productName,
}: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Fallback image if no images exist
  const images =
    imageUrls.length > 0
      ? imageUrls
      : ["/images/placeholder-product.png"];

  return (
    <div>
      <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded bg-charcoal">
        <Image
          src={images[activeIndex]}
          alt={productName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`View image ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              className={`relative aspect-square overflow-hidden rounded ${
                activeIndex === i
                  ? "ring-2 ring-pink"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}