import { Product } from "@/lib/types";
import ProductCard from "@/components/ui/ProductCard";

export default function RelatedProducts({
  products,
}: {
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="bg-charcoal/[0.03] px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-5 font-serif text-lg font-medium text-charcoal">
          you may also like
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}