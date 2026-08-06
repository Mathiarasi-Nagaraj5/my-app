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
        category: values.category,
        price: values.price,
        originalPrice: values.originalPrice,
        stock: values.stock,
        // imageUrls is already an array of uploaded URLs from the form
        imageUrls: values.imageUrls,
        isBestseller: values.isBestseller,
        // pass as comma strings — route.ts splits them
        sizes: values.sizes,
        colors: values.colors,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to create product");
    }

    router.push("/admin/products");
  };

  return (
    <div className="max-w-2xl">
        <h1 className="mb-5 text-2xl font-bold text-pink">Add Product</h1>
        <ProductForm onSubmit={handleSubmit} submitLabel="Create product" />
      </div>
  );
}