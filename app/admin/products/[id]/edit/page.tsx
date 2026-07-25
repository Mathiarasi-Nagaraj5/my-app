"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProductForm, { ProductFormValues } from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialValues, setInitialValues] = useState<Partial<ProductFormValues> | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((product) =>
        setInitialValues({
          name: product.name,
          slug: product.slug,
          category: product.category,
          price: product.price,
          originalPrice: product.originalPrice,
          imageUrl: product.imageUrl,
          isBestseller: product.isBestseller,
          sizes: (product.sizes || []).join(", "),
          colors: (product.colors || []).join(", "),
        })
      )
      .catch(() => setNotFound(true));
  }, [id]);

  const handleSubmit = async (values: ProductFormValues) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "failed to update product");
    }

    router.push("/admin/products");
  };

  if (notFound) {
    return <p className="text-sm text-red-600">product not found.</p>;
  }

  if (!initialValues) {
    return <p className="text-sm text-charcoal/55">Loading product...</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-5 text-lg font-medium text-charcoal">Edit product</h1>
      <ProductForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </div>
  );
}