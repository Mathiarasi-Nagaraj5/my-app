"use client";

import { useEffect, useState, useCallback } from "react";
import CategoryTable, { AdminCategory } from "@/components/admin/CategoryTable";
import { useModal } from "@/components/ui/ModalProvider";
import RequireAdmin from "@/components/auth/RequireAdmin";

export default function AdminCategoriesPage() {
  const { confirm } = useModal();

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async (name: string) => {
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await fetchCategories();
  };

  const handleUpdate = async (id: string, name: string) => {
    await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await fetchCategories();
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete category",
      message: "Delete this category? This can't be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;

    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    await fetchCategories();
  };

  if (loading) return <p className="text-sm text-charcoal/55">loading categories...</p>;

  return (
    <RequireAdmin>
      <div className="space-y-4">
        <h1 className="mb-1 text-2xl font-medium text-charcoal">Categories</h1>
        <p className="text-sm text-gray-500">
          View and manage all product categories available in the store.
        </p>
   

        <CategoryTable
          categories={categories}
          onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
    </RequireAdmin>
  );
}