// File: app/(shop)/product/[slug]/page.tsx  (adjust path to match your actual route)
import { notFound } from "next/navigation";

import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductDetailShell from "@/components/product/ProductDetailShell";
import RelatedProducts from "@/components/product/RelatedProducts";
import { CONTACT_NUMBER } from "@/app/lib/contact";
import { getProductBySlug } from "@/services/product.service";
import ProductDescription from "@/components/product/ProductDescription";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let data;

  try {
    data = await getProductBySlug(slug);
  } catch {
    notFound();
  }

  const { product, relatedProducts } = data;

  return (
    <>
      <Breadcrumb
        items={[
          {
            label: "home",
            href: "/",
          },
          {
            label: product.category,
            href: `/shop?category=${product.category}`,
          },
          {
            label: product.name,
          },
        ]}
      />

      <ProductDetailShell product={product} whatsappNumber={CONTACT_NUMBER} />
  

   

      <RelatedProducts products={relatedProducts} />
    </>
  );
}