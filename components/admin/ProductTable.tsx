"use client";

import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";

export interface AdminProduct {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  imageUrls: string[];
}

interface ProductTableProps {
  products: AdminProduct[];
  onDelete: (id: string) => void;
}

const formatINR = (v: number) => `₹${v.toLocaleString("en-IN")}`;

const LOW_STOCK_THRESHOLD = 5;

export default function ProductTable({ products, onDelete }: ProductTableProps) {
  if (products.length === 0) {
    return <p className="text-sm text-charcoal/55">no products yet. add your first one below.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => {
        const lowStock = product.stock <= LOW_STOCK_THRESHOLD;
        return (
          <div
            key={product._id}
            className="group overflow-hidden rounded-card border border-charcoal/10 bg-white transition-shadow hover:shadow-md"
          >
            {/* Image */}
            <div className="relative aspect-square w-full overflow-hidden bg-charcoal/5">
              <Image
                src={product.imageUrls[0]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-105"
                sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              />

              {/* Stock badge */}
              {product.stock === 0 ? (
                <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-medium text-white">
                  Out of stock
                </span>
              ) : lowStock ? (
                <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-medium text-white">
                  Low stock
                </span>
              ) : null}

              {/* Action buttons */}
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Link
                  href={`/admin/products/${product._id}/edit`}
                  aria-label="Edit product"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-charcoal/70 shadow-sm hover:text-brass"
                >
                  <Pencil size={12} />
                </Link>
                <button
                  onClick={() => onDelete(product._id)}
                  aria-label="Delete product"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-charcoal/70 shadow-sm hover:text-red-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-0.5 px-3 py-2">
              <p className="truncate text-sm font-medium text-charcoal">{product.name}</p>
              <p className="text-xs text-charcoal/55">{product.category}</p>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-sm font-medium text-charcoal">{formatINR(product.price)}</span>
                <span className={lowStock ? "text-xs font-medium text-red-600" : "text-xs text-charcoal/55"}>
                  {product.stock} in stock
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}