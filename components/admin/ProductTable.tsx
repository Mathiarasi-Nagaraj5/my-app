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
  imageUrl: string;
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
    <div className="overflow-hidden rounded-card border border-charcoal/20 bg-white">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-2 border-b border-charcoal/10 px-4 py-1.5 text-lg text-charcoal">
        <span>Product</span>
        <span>Category</span>
        <span>Price</span>
        <span>Stock</span>
        <span>Action</span>
      </div>
      {products.map((product) => {
        const lowStock = product.stock <= LOW_STOCK_THRESHOLD;
        return (
          <div
            key={product._id}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] items-center gap-2 border-b border-charcoal/10 px-4 py-1 text-md text-charcoal last:border-0"
          >
            <div className="flex items-center gap-2">
              <div className="relative h-6 w-5 flex-shrink-0 overflow-hidden rounded bg-charcoal">
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="20px" />
              </div>
              <span className="truncate">{product.name}</span>
            </div>
            <span className="text-charcoal/70">{product.category}</span>
            <span>{formatINR(product.price)}</span>
            <span className={lowStock ? "font-medium text-red-600" : "text-charcoal/70"}>
              {product.stock}
              {lowStock && product.stock > 0 && (
                <span className="ml-1 text-[10px]">low</span>
              )}
              {product.stock === 0 && <span className="ml-1 text-[10px]">out</span>}
            </span>
            <div className="flex gap-3 text-charcoal/50">
              <Link href={`/admin/products/${product._id}/edit`} aria-label="Edit product">
                <Pencil size={13} className="hover:text-brass" />
              </Link>
              <button onClick={() => onDelete(product._id)} aria-label="Delete product">
                <Trash2 size={13} className="hover:text-red-600" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}