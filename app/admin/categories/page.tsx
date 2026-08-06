"use client";

import { useEffect, useState, useCallback } from "react";
import CategoryTable, { AdminCategory } from "@/components/admin/CategoryTable";

export default function AdminCategoriesPage() {
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
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    await fetchCategories();
  };

  if (loading) return <p className="text-sm text-charcoal/55">loading categories...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-medium text-charcoal">Categories</h1>
      <CategoryTable
        categories={categories}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}