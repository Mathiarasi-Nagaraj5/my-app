import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { Product } from "@/lib/types";
import Button from "@/components/ui/Button";

const formatINR = (v: number) => `₹${v.toLocaleString("en-IN")}`;

interface WishlistCardProps {
  product: Product;
  onRemove: (id: string) => void;
  onMoveToCart: (id: string) => void;
}

export default function WishlistCard({
  product,
  onRemove,
  onMoveToCart,
}: WishlistCardProps) {
  return (
    <div className="overflow-hidden rounded-card border border-charcoal/15">
      <div className="relative aspect-[3/4] bg-charcoal">
        <Link href={`/shop/${product.slug}`}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </Link>
        <button
          type="button"
          aria-label="Remove from wishlist"
          onClick={() => onRemove(product.id)}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ivory/90 text-charcoal"
        >
          <X size={14} />
        </button>
      </div>
      <div className="p-3">
        <p className="truncate text-sm text-charcoal">{product.name}</p>
        <p className="mt-0.5 mb-2.5 text-sm font-medium text-brass">
          {formatINR(product.price)}
        </p>
        <Button variant="primary" size="sm" fullWidth onClick={() => onMoveToCart(product.id)}>
          move to bag
        </Button>
      </div>
    </div>
  );
}