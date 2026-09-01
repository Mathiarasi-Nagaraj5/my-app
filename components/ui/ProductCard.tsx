"use client";

import Image from "next/image";
import Link from "next/link";
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

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="group">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded bg-charcoal">
          <Image
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
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
              toggle(product._id);
            }}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ivory/90"
          >
            <span className={wishlisted ? "text-pink" : "text-charcoal"}>{wishlisted ? "♥" : "♡"}</span>
          </button>
        </div>

        <p className="mt-2 truncate text-lg text-charcoal capitalize">{product.name}</p>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-medium capitalize text-pink">{formatINR(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-charcoal/40 line-through">{formatINR(product.originalPrice)}</span>
          )}
        </div>

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