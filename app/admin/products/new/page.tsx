"use client";

import { useRouter } from "next/navigation";
import ProductForm, { ProductFormValues } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  const router = useRouter();

  const handleSubmit = async (values: ProductFormValues) => {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "failed to create product");
    }

    router.push("/admin/products");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="mb-5 text-lg font-medium text-charcoal">Add product</h1>
      <ProductForm onSubmit={handleSubmit} submitLabel="Create product" />
    </div>
  );
}