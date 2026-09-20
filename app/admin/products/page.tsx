"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import ProductTable, { AdminProduct } from "@/components/admin/ProductTable";
import Pagination from "@/components/admin/Pagination";
import { useModal } from "@/components/ui/ModalProvider";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function AdminProductsPage() {
  const { confirm, alert } = useModal();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadProducts = () => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((res) => {
        setProducts(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete product",
      message: "Delete this product? This cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;

    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } else {
      await alert({ title: "Couldn't delete product", message: "failed to delete product", variant: "error" });
    }
  };

  // filter by search, then slice for the current page
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // reset to page 1 whenever the search or page size changes, so you
  // never land on a page that no longer has any results
  useEffect(() => {
    setCurrentPage(1);
  }, [search, pageSize]);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-medium text-charcoal">Products</h1>
        <Link href="/admin/products/new">
          <Button variant="primary" size="lg" icon={<Plus size={14} />}>
            Add product
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded border border-charcoal/15 px-3 py-2 max-w-xs w-full">
          <Search size={18} className="text-charcoal" />
          <input
            type="text"
            placeholder="Search Products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xl text-charcoal placeholder:text-charcoal/70 focus:outline-none"
          />
        </div>

        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="h-9 rounded border border-charcoal/15 px-2 text-sm text-charcoal"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-charcoal/55">Loading products...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-charcoal/55">
          {search ? `no products match "${search}".` : "no products yet."}
        </p>
      ) : (
        <>
          <ProductTable products={paginated} onDelete={handleDelete} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}