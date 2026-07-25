"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export interface ProductFormValues {
  name: string;
  slug: string;
  category: "t-shirts" | "hoodies" | "pyjamas";
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrl: string;
  isBestseller: boolean;
  sizes: string;
  colors: string;
}

const EMPTY_VALUES: ProductFormValues = {
  name: "",
  slug: "",
  category: "t-shirts",
  price: 0,
  originalPrice: undefined,
  stock: 0,
  imageUrl: "",
  isBestseller: false,
  sizes: "S, M, L, XL",
  colors: "",
};

interface ProductFormProps {
  initialValues?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
  submitLabel?: string;
}

export default function ProductForm({
  initialValues,
  onSubmit,
  submitLabel = "save product",
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  // auto-generate a slug from the name, unless the user has typed their own
  const handleNameChange = (name: string) => {
    update("name", name);
    if (!initialValues?.slug) {
      update(
        "slug",
        name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!values.name || !values.slug || !values.imageUrl || values.price <= 0) {
      setError("please fill in name, image URL, and a valid price");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(values);
    } catch {
      setError("something went wrong while saving. please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="product name"
          value={values.name}
          onChange={(e) => handleNameChange(e.target.value)}
        />
        <Input
          label="slug (URL)"
          value={values.slug}
          onChange={(e) => update("slug", e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-charcoal">category</label>
        <select
          value={values.category}
          onChange={(e) => update("category", e.target.value as ProductFormValues["category"])}
          className="h-[42px] w-full rounded border border-charcoal bg-ivory px-3 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-brass"
        >
          <option value="t-shirts">t-shirts</option>
          <option value="hoodies">hoodies</option>
          <option value="pyjamas">pyjamas</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="price (₹)"
          type="number"
          value={values.price || ""}
          onChange={(e) => update("price", Number(e.target.value))}
        />
        <Input
          label="original price (₹) — optional, for discounts"
          type="number"
          value={values.originalPrice || ""}
          onChange={(e) =>
            update("originalPrice", e.target.value ? Number(e.target.value) : undefined)
          }
        />
      </div>

      <Input
        label="stock quantity"
        type="number"
        value={values.stock || ""}
        onChange={(e) => update("stock", Number(e.target.value))}
      />

      <Input
        label="image URL"
        placeholder="https://..."
        value={values.imageUrl}
        onChange={(e) => update("imageUrl", e.target.value)}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="sizes (comma-separated)"
          value={values.sizes}
          onChange={(e) => update("sizes", e.target.value)}
        />
        <Input
          label="colors — hex codes (comma-separated, optional)"
          placeholder="#1C1B19, #6B5B45"
          value={values.colors}
          onChange={(e) => update("colors", e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-charcoal">
        <input
          type="checkbox"
          checked={values.isBestseller}
          onChange={(e) => update("isBestseller", e.target.checked)}
          className="accent-brass"
        />
        mark as bestseller
      </label>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <Button type="submit" variant="primary" disabled={saving} className="w-fit">
        {saving ? "saving..." : submitLabel}
      </Button>
    </form>
  );
}