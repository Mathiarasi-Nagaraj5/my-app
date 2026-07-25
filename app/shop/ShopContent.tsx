"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import Breadcrumb from "../../components/ui/Breadcrumb";
import Button from "../../components/ui/Button";
import ProductCard from "../../components/ui/ProductCard";
import FilterSidebar from "../../components/shop/Filtersidebar";
import SortSelect from "../../components/shop/Sortselect";

import {
  DEFAULT_FILTERS,
  Product,
  ShopFilters,
  SortOption,
} from "../lib/types";

import { getProducts } from "@/services/product.service";

const PAGE_SIZE = 6;

const URL_SORT_MAP: Record<string, SortOption> = {
  newest: "newest",
  "price-low": "price-low-high",
  "price-high": "price-high-low",
  featured: "featured",
};

export default function ShopContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<ShopFilters>({
    ...DEFAULT_FILTERS,
    categories: searchParams.get("category") ? [searchParams.get("category")!] : [],
  });

  const [sort, setSort] = useState<SortOption>(
    URL_SORT_MAP[searchParams.get("sort") ?? ""] ?? "featured"
  );

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Re-sync category + sort from the URL whenever it changes. Without this,
  // clicking a Navbar link while already on /shop does nothing — Next.js
  // reuses this same component instance instead of remounting it, so the
  // useState initializers above only ever run once.
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    const sortFromUrl = searchParams.get("sort");

    setFilters((prev) => ({
      ...prev,
      categories: categoryFromUrl ? [categoryFromUrl] : [],
    }));

    if (sortFromUrl) {
      setSort(URL_SORT_MAP[sortFromUrl] ?? "featured");
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        if (filters.categories.length) {
          params.append("category", filters.categories[0]);
        }

        switch (sort) {
          case "price-low-high":
            params.append("sort", "price-low");
            break;
          case "price-high-low":
            params.append("sort", "price-high");
            break;
          case "newest":
            params.append("sort", "newest");
            break;
          case "featured":
            params.append("sort", "rating");
            break;
          default:
            break;
        }

        const data = await getProducts(params);

        const filtered = data.filter((product) => {
          if (product.price > filters.maxPrice) return false;

          if (
            filters.sizes.length &&
            !product.sizes?.some((size) => filters.sizes.includes(size))
          ) {
            return false;
          }

          if (
            filters.colors.length &&
            !product.colors?.some((color) => filters.colors.includes(color))
          ) {
            return false;
          }

          return true;
        });

        setProducts(filtered);
        setVisibleCount(PAGE_SIZE);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [filters, sort]);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <>
      <Breadcrumb items={[{ label: "home", href: "/" }, { label: "shop" }]} />

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="font-serif text-2xl font-medium text-charcoal">
            All Products
          </h1>

          <SortSelect value={sort} onChange={setSort} />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
          <FilterSidebar filters={filters} onChange={setFilters} />

          <div>
            {loading ? (
              <div className="py-16 text-center">Loading products...</div>
            ) : products.length === 0 ? (
              <p className="py-16 text-center text-sm text-charcoal/55">
                No products found.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}