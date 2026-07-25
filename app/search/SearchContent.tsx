"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import SortSelect from "@/components/shop/Sortselect";
import { SortOption } from "@/app/lib/types";
import {
  getProducts,
} from "@/services/product.service";
export default async function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [sort, setSort] = useState<SortOption>("featured");
  const allProducts = await getProducts(); // Fetch all products (you may want to filter this based on the search query)
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filtered = q
      ? allProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        )
      : allProducts;

    if (sort === "price-low-high") filtered = [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "price-high-low") filtered = [...filtered].sort((a, b) => b.price - a.price);
    if (sort === "newest") filtered = [...filtered].reverse();

    return filtered;
  }, [query, sort]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* search input */}
      <div className="mb-6 flex items-center gap-2 rounded border border-charcoal px-4 py-2.5">
        <SearchIcon size={18} className="text-charcoal/50" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search for t-shirts, hoodies, pyjamas..."
          className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none"
          autoFocus
        />
      </div>

      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-charcoal/70">
          {query
            ? `${results.length} results for "${query}"`
            : `showing all ${results.length} products`}
        </p>
        <SortSelect value={sort} onChange={setSort} />
      </div>

      {results.length === 0 ? (
        <p className="py-16 text-center text-sm text-charcoal/55">
          no products found. try a different search term.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}