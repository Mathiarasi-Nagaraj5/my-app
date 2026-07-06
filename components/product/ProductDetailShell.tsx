"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import Gallery from "./Gallery";
import ProductInfo from "./ProductInfo";
import SizeGuideModal from "./SizeGuideModal";

export default function ProductDetailShell({ product }: { product: Product }) {
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  return (
    <>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-6 py-6 md:grid-cols-2">
        <Gallery slug={product.slug} productName={product.name} />
        <ProductInfo
          product={product}
          onSizeGuideClick={() => setSizeGuideOpen(true)}
        />
      </div>
      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </>
  );
}