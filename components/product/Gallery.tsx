"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryProps {
  slug: string;
  productName: string;
}

// Demo: derives 4 gallery images from the product slug.
// Replace with product.images (an array from your DB/CMS) once available.
function getGalleryImages(slug: string) {
  return [0, 1, 2, 3].map(
    (i) => `https://picsum.photos/seed/${slug}-${i}/700/875`
  );
}

export default function Gallery({ slug, productName }: GalleryProps) {
  const images = getGalleryImages(slug);
  const [activeIndex, setActiveIndex] = useState(0);

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
      <div className="grid grid-cols-4 gap-2">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            aria-label={`View image ${i + 1}`}
            onClick={() => setActiveIndex(i)}
            className={`relative aspect-square overflow-hidden rounded ${
              activeIndex === i ? "ring-2 ring-pink" : "opacity-70"
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
    </div>
  );
}