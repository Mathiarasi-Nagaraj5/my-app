// File: app/admin/products/[id]/edit/page.tsx  (adjust path to match your actual route)
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProductForm, { ProductFormValues } from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialValues, setInitialValues] = useState<
    (Partial<ProductFormValues> & { _id?: string }) | null
  >(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("not found");

        const product = await res.json();
        console.log("Fetched product data:", product);

        return product.data;
      })
      .then((product) => {
        console.log("Setting initial values:", product);

        setInitialValues({
          // THE FIX: this object was picking out individual fields and
          // silently dropping _id (and sku) in the process. ProductForm
          // needs _id to know it's editing an existing product rather than
          // staging reviews for one that doesn't exist yet.
          _id: product._id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          stock: product.stock,
          category: product.category,
          price: product.price,
          originalPrice: product.originalPrice,
          imageUrls: product.imageUrls ?? [],
          isBestseller: product.isBestseller,
          sizes: (product.sizes ?? []).join(", "),
          colors: (product.colors ?? []).join(", "),
          description: product.description,
        });
      })
      .catch((err) => {
        console.error(err);
        setNotFound(true);
      });
  }, [id]);

  const handleSubmit = async (values: ProductFormValues) => {
    console.log("Submitting updated product values:", values);
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "failed to update product");
    }

    const data = await res.json();
    router.push("/admin/products");
    // Returned so ProductForm can flush any staged reviews against this
    // product's id even in edit mode (belt-and-suspenders — with _id now
    // set above, ProductForm should already be in "live" review mode and
    // not need this, but it costs nothing to also return it here).
    return data.data;
  };

  if (notFound) {
    return <p className="text-sm text-red-600">product not found.</p>;
  }

  if (!initialValues) {
    return <p className="text-sm text-charcoal/55">Loading product...</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-medium text-charcoal">Edit Product</h1>
      <ProductForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </div>
  );
}