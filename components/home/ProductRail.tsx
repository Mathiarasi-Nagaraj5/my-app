import Link from "next/link";
import { Product } from "@/app/lib/types";
import ProductCard from "../ui/ProductCard";

interface ProductRailProps {
  title: string;
  products: Product[];
  viewAllHref?: string;
  /** alternate background so consecutive rails read as distinct sections */
  tone?: "ivory" | "charcoal-tint";
}

export default function ProductRail({
  title,
  products,
  viewAllHref = "/shop",
  tone = "ivory",
}: ProductRailProps) {
  return (
    <section
      className={`px-6 py-12 ${
        tone === "charcoal-tint" ? "bg-[#FFFDFC]" : "bg-[#FDF5F8]"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-serif text-3xl font-medium text-charcoal">
            {title}
          </h2>
          <Link href={viewAllHref} className="text-lg italic text-black hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}