"use client";

import { useEffect, useMemo, useState } from "react";
import { Product } from "@/app/lib/types";
import Gallery from "./Gallery";
import ProductInfo from "./ProductInfo";
import SizeGuideModal from "./SizeGuideModal";
import ProductReviews, { ReviewItem } from "./ProductReviews";
import ProductDescription from "./ProductDescription";

export default function ProductDetailShell({
  product,
  whatsappNumber,
}: {
  product: Product;
  whatsappNumber: string;
}) {
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/reviews?productId=${product._id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) setReviews(data.data);
      })
      .catch((err) => console.error("Failed to load reviews:", err));

    return () => {
      cancelled = true;
    };
  }, [product._id]);

  const { rating, reviewCount } = useMemo(() => {
    const count = reviews.length;
    const avg = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
    return { rating: Math.round(avg * 10) / 10, reviewCount: count };
  }, [reviews]);

  return (
    <>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-6 py-8 md:grid-cols-2 md:gap-14">
        {/* gallery stays in view while the longer info column scrolls */}
        <div className="md:sticky md:top-28 md:self-start">
          <Gallery imageUrls={product.imageUrls} productName={product.name} />
        </div>

        <ProductInfo
          product={{ ...product, rating, reviewCount }}
          whatsappNumber={whatsappNumber}
          onSizeGuideClick={() => setSizeGuideOpen(true)}
        />
      </div>

      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
      <ProductDescription product={product} />
      <ProductReviews reviews={reviews} />
    </>
  );
}