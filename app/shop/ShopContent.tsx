"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Button from "../../components/ui/Button";
import ProductCard from "../../components/ui/ProductCard";
import FilterSidebar from "../../components/shop/Filtersidebar";
import SortSelect from "../../components/shop/Sortselect";
import { DEFAULT_FILTERS, ShopFilters, SortOption } from "../../lib/types";
import { products as allProducts } from "@/lib/data";

const PAGE_SIZE = 6;

export default function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [filters, setFilters] = useState<ShopFilters>({
    ...DEFAULT_FILTERS,
    categories: initialCategory ? [initialCategory] : [],
  });
  const [sort, setSort] = useState<SortOption>("featured");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    let result = allProducts.filter((p) => {
      if (filters.categories.length && !filters.categories.includes(p.category))
        return false;
      if (p.price > filters.maxPrice) return false;
      if (
        filters.sizes.length &&
        !p.sizes?.some((s) => filters.sizes.includes(s))
      )
        return false;
      if (
        filters.colors.length &&
        !p.colors?.some((c) => filters.colors.includes(c))
      )
        return false;
      return true;
    });

    if (sort === "price-low-high") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-high-low") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "newest") result = [...result].reverse();

    return result;
  }, [filters, sort]);

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <>
      <Breadcrumb items={[{ label: "home", href: "/" }, { label: "shop" }]} />

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="font-serif text-2xl font-medium text-charcoal">
            all products
          </h1>
          <SortSelect value={sort} onChange={setSort} />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
          <FilterSidebar filters={filters} onChange={setFilters} />

          <div>
            {visibleProducts.length === 0 ? (
              <p className="py-16 text-center text-sm text-charcoal/55">
                no products match your filters. try adjusting them.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {hasMore && (
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                >
                  load more
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}