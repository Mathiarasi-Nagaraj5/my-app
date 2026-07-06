import { notFound } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductDetailShell from "@/components/product/ProductDetailShell";
import ProductDescription from "@/components/product/ProductDescription";
import ProductReviews from "@/components/product/ProductReviews";
import RelatedProducts from "@/components/product/RelatedProducts";
import { products } from "@/lib/data";

// Pre-renders a static page per product at build time.
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "home", href: "/" },
          { label: product.category, href: `/shop?category=${product.category}` },
          { label: product.name },
        ]}
      />

      <ProductDetailShell product={product} />
      <ProductDescription />
      <ProductReviews />
      <RelatedProducts products={related} />
    </>
  );
}