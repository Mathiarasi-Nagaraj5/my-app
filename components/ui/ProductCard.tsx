"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Product } from "@/app/lib/types";
import Badge from "./Badge";
import { useWishlist } from "@/app/lib/context/WishlistContext";

interface ProductCardProps {
  product: Product;
}

const formatINR = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export default function ProductCard({ product }: ProductCardProps) {
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product._id);

  const colors = product.colors ?? [];
  const sizes = product.sizes ?? [];
  const hoverImage = product.imageUrls[1];

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // adjust these two field names to match your Product type
  const rating = product.rating ?? 0;
  const reviewCount = product.reviewCount ?? 0;
  const hasReviews = reviewCount > 0 && rating > 0;

  return (
    <div className="group">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-charcoal/5 shadow-md shadow-pink/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_24px_rgba(236,72,153,0.35)]">
          <Image
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-500 ${
              hoverImage ? "group-hover:opacity-0" : "group-hover:scale-105"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* second photo fades in on hover, if the product has one */}
          {hoverImage && (
            <Image
              src={hoverImage}
              alt=""
              fill
              aria-hidden="true"
              className="object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {/* top-left tag: only one of these should show at a time */}
          {product.isBestseller && (
            <div className="absolute left-2 top-2">
              <Badge variant="brand">Bestseller</Badge>
            </div>
          )}
          {discountPercent && !product.isBestseller && (
            <div className="absolute left-2 top-2">
              <Badge variant="brand">{discountPercent}% off</Badge>
            </div>
          )}

          <button
            type="button"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={(e) => {
              e.preventDefault();
              toggle(product._id, product.name);
            }}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm shadow-sm transition-all duration-300 hover:scale-110 hover:bg-white"
          >
            <span className={wishlisted ? "text-pink" : "text-charcoal"}>
              {wishlisted ? "♥" : "♡"}
            </span>
          </button>
        </div>

        <div className="mt-3 px-0.5">
          <p className="truncate font-serif text-sm capitalize text-charcoal transition-colors duration-200 group-hover:text-pink md:text-base">
            {product.name}
          </p>

          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-sm font-semibold text-pink md:text-base">
              {formatINR(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-charcoal/40 line-through">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>

          {/* rating + reviews: only shown if the product has any */}
          {hasReviews && (
            <div className="mt-1.5 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-green-700 px-2 py-0.5 text-[11px] font-semibold text-white">
                {rating.toFixed(1)}
                <Star size={10} className="fill-white" />
              </span>
              <span className="text-[11px] text-charcoal/60">
                {reviewCount.toLocaleString("en-IN")} {reviewCount === 1 ? "Review" : "Reviews"}
              </span>
            </div>
          )}

          {(colors.length > 0 || sizes.length > 0) && (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
              {colors.length > 0 && (
                <div className="flex items-center gap-1">
                  {colors.slice(0, 4).map((color) => (
                    <span
                      key={color}
                      style={{ backgroundColor: color }}
                      className="h-3.5 w-3.5 rounded-full border border-charcoal/20"
                    />
                  ))}
                  {colors.length > 4 && (
                    <span className="text-[10px] text-charcoal/40">+{colors.length - 4}</span>
                  )}
                </div>
              )}

              {sizes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {sizes.map((size) => (
                    <span
                      key={size}
                      className="rounded border border-charcoal/15 px-1.5 py-px text-[10px] text-charcoal/70"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}