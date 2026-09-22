"use client";

import { useRouter } from "next/navigation";
import ProductForm, { ProductFormValues } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  const router = useRouter();

  const handleSubmit = async (values: ProductFormValues) => {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        slug: values.slug,
        sku: values.sku,
        description: values.description,
        category: values.category,
        price: values.price,
        originalPrice: values.originalPrice,
        stock: values.stock,
        imageUrls: values.imageUrls,
        isBestseller: values.isBestseller,
        sizes: values.sizes,
        colors: values.colors,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to create product");
    }

    // ProductForm needs the created product's _id back to flush any
    // reviews staged during creation (see stageReview/pendingReviews in
    // ProductForm.tsx) — without returning this, staged reviews were
    // silently dropped with only an in-form error message to notice it.
    router.push("/admin/products");
    return data.data ?? data;
  };

  return (
    <div className="max-w-2xl">
      <h1 className="mb-5 text-2xl font-bold text-pink">Add Product</h1>
      <ProductForm onSubmit={handleSubmit} submitLabel="Create product" />
    </div>
  );
}