"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/app/lib/types";
import Badge from "./Badge";
import { useWishlist } from "@/app/lib/context/WishlistContext";

interface ProductCardProps {
  product: Product;
}

const formatINR = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function ProductCard({ product }: ProductCardProps) {
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : null;

  return (
    <div className="group">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded bg-charcoal">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />

          {/* top-left tag: only one of these should show at a time */}
          {product.isBestseller && (
            <div className="absolute left-2 top-2">
              <Badge variant="brand">bestseller</Badge>
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
              toggle(product.id);
            }}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ivory/90 text-charcoal"
          >
            {wishlisted ? "♥" : "♡"}
          </button>
        </div>

        <p className="mt-2 truncate text-lg text-charcoal capitalize">{product.name}</p>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-medium capitalize text-pink">
            {formatINR(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-charcoal/40 line-through">
              {formatINR(product.originalPrice)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}