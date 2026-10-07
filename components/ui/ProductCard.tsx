"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Product } from "@/app/lib/types";
import Badge from "./Badge";
import { useWishlist } from "@/app/lib/context/WishlistContext";
import StarRating from "./StarRating";

interface ProductCardProps {
  product: Product;
}

const formatINR = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export default function ProductCard({ product }: ProductCardProps) {
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product._id);

  const colors = product.colors ?? [];
  const sizes = product.sizes ?? [];

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

    console.log("ProductCard product:", product); // Debugging line
  // adjust these two field names to match your Product type
  const rating = product.rating ?? 0;
  const reviewCount = product.reviewCount ?? 0;
  const hasReviews = reviewCount > 0 && rating > 0;

  return (
    <div className="group">
      <Link href={`/shop/${product.slug}`} className="block">
        {/* aspect-[4/5] makes the image shorter than the old 3/4 */}
        <div className="relative aspect-[4/5] overflow-hidden rounded bg-charcoal">
          <Image
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 568px) 20vw, 15vw"
          />

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
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ivory/90"
          >
            <span className={wishlisted ? "text-pink" : "text-charcoal"}>
              {wishlisted ? "♥" : "♡"}
            </span>
          </button>
        </div>

        <p className="mt-2 truncate text-lg text-charcoal capitalize">{product.name}</p>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-medium capitalize text-pink">{formatINR(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-charcoal/40 line-through">{formatINR(product.originalPrice)}</span>
          )}
        </div>
            
        

        {/* rating + reviews: only shown if the product has any */}
        {hasReviews && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-green-700 px-2 py-0.5 text-xs font-semibold text-white">
              {rating.toFixed(1)}
              <Star size={11} className="fill-white" />
            </span>
            <span className="text-xs text-charcoal/60">
              {reviewCount.toLocaleString("en-IN")} {reviewCount === 1 ? "Review" : "Reviews"}
            </span>
          </div>
        )}

        {(colors.length > 0 || sizes.length > 0) && (
          <div className="mt-1.5 flex flex-col items-start gap-2">
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
              <div className="text-[11px] text-charcoal/90">{sizes.join(" · ")}</div>
            )}
          </div>
        )}
      </Link>
    </div>
  );
}