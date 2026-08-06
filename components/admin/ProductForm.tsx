"use client";

import { useState, useRef ,useEffect} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductFormValues {
  name: string;
  slug: string;
  category: string[];
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrls: string[];          // up to 5 uploaded URLs
  isBestseller: boolean;
  sizes: string;
  colors: string;
}
interface Category {
  name: string;
  slug: string;
}

const EMPTY_VALUES: ProductFormValues = {
  name: "",
  slug: "",
  category: ["t-shirts"],
  price: 0,
  originalPrice: undefined,
  stock: 0,
  imageUrls: [],
  isBestseller: false,
  sizes: "S, M, L, XL",
  colors: "",
};

interface ProductFormProps {
  initialValues?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
  submitLabel?: string;
}

// ─── Image thumbnail with remove button ──────────────────────────────────────

function ImageThumb({
  url,
  index,
  total,
  onRemove,
  onMoveLeft,
  onMoveRight,
}: {
  url: string;
  index: number;
  total: number;
  onRemove: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}) {
  
  return (
    <div className="relative group w-24 h-24 rounded border border-charcoal overflow-hidden flex-shrink-0">
      <img src={url} alt={`product image ${index + 1}`} className="w-full h-full object-cover" />

      {/* overlay controls */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1">
        {/* move arrows */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onMoveLeft}
            disabled={index === 0}
            className="text-white text-xs bg-black/50 rounded px-1 disabled:opacity-30"
            title="Move left"
          >
            ←
          </button>
          <button
            type="button"
            onClick={onMoveRight}
            disabled={index === total - 1}
            className="text-white text-xs bg-black/50 rounded px-1 disabled:opacity-30"
            title="Move right"
          >
            →
          </button>
        </div>

        {/* remove */}
        <button
          type="button"
          onClick={onRemove}
          className="self-center text-white text-xs bg-red-600/80 rounded px-2 py-0.5 hover:bg-red-600"
        >
          remove
        </button>
      </div>

      {/* primary badge on first image */}
      {index === 0 && (
        <span className="absolute top-1 left-1 bg-brass text-white text-[10px] px-1 rounded leading-4">
          main
        </span>
      )}
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

const MAX_IMAGES = 5;

export default function ProductForm({
  initialValues,
  onSubmit,
  submitLabel = "save product",
}: ProductFormProps) {

  const [values, setValues] = useState<ProductFormValues>({
  ...EMPTY_VALUES,
  ...initialValues,
  imageUrls: initialValues?.imageUrls ?? [],
});
  const [categories, setCategories] = useState<Category[]>([]);
   useEffect(() => {
    fetch("/api/categories").then((res) => res.json()).then((data) => {
      setCategories(data); // Assuming the API returns an array of category objects with a 'name' property
    }).catch((err) => {
      console.error("Failed to fetch categories:", err);
    });
  }, []);

console.log("ProductForm initialValues:", initialValues);
useEffect(() => {
  if (!initialValues) return;

  setValues({
    ...EMPTY_VALUES,
    ...initialValues,
    imageUrls: initialValues.imageUrls ?? [],
  });
}, [initialValues]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Per-slot upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const update = <K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K]
  ) => setValues((prev) => ({ ...prev, [field]: value }));

  const handleNameChange = (name: string) => {
    update("name", name);
    if (!initialValues?.slug) {
      update(
        "slug",
        name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  // ── Image upload ─────────────────────────────────────────────────────────

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError("");

    const remaining = MAX_IMAGES - values.imageUrls.length;
    if (remaining <= 0) {
      setUploadError(`Maximum ${MAX_IMAGES} imageUrls already added`);
      return;
    }

    // Slice to how many we can still accept
    const selected = Array.from(files).slice(0, remaining);

    // Client-side validation
    for (const file of selected) {
      if (!file.type.startsWith("image/")) {
        setUploadError(`"${file.name}" is not an image file`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`"${file.name}" exceeds the 5 MB limit`);
        return;
      }
    }

    setUploading(true);
    try {
      const formData = new FormData();
      selected.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      const newUrls: string[] = data.imageUrls ?? [];
      update("imageUrls", [...values.imageUrls, ...newUrls]);

      if (files.length > remaining) {
        setUploadError(
          `Only ${remaining} image(s) added — maximum of ${MAX_IMAGES} reached`
        );
      }
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected after removal
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Image reordering / removal ───────────────────────────────────────────

  const removeImage = (idx: number) => {
    update(
      "imageUrls",
      values.imageUrls.filter((_, i) => i !== idx)
    );
  };

  const moveImage = (from: number, to: number) => {
    const imgs = [...values.imageUrls];
    const [item] = imgs.splice(from, 1);
    imgs.splice(to, 0, item);
    update("imageUrls", imgs);
  };

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!values.name.trim()) { setError("Product name is required"); return; }
    if (!values.slug.trim()) { setError("Slug is required"); return; }
    if (values.price <= 0)   { setError("Enter a valid price"); return; }
    if (values.imageUrls.length === 0) {
      setError("Upload at least one product image");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(values);
    } catch {
      setError("Something went wrong while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
console.log("ProductForm values:", values);
  const canAddMore = values.imageUrls.length < MAX_IMAGES;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Name + Slug */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            className="h-10 w-full rounded border border-charcoal bg-ivory px-3 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-brass"
            value={values.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Black Oversized Tee"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">
            Slug (URL) <span className="text-red-500">*</span>
          </label>
          <input
            className="h-10 w-full rounded border border-charcoal bg-ivory px-3 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-brass"
            value={values.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="auto-generated from name"
          />
        </div>
      </div>

      {/* Category */}
      <div>
  <label className="mb-1.5 block text-sm font-medium text-charcoal">
    Category
  </label>

  <select
    value={values.category}
    onChange={(e) => update("category", e.target.value)}
    className="h-10 w-full rounded border border-charcoal bg-ivory px-3 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-brass"
  >
    <option value="">Select a category</option>

    {categories.map((category) => (
      <option key={category._id} value={category.slug ?? category.name}>
        {category.name}
      </option>
    ))}
  </select>
</div>
      {/* Price + Original Price + Stock */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">
            Price (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            className="h-10 w-full rounded border border-charcoal bg-ivory px-3 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-brass"
            value={values.price || ""}
            onChange={(e) => update("price", Number(e.target.value))}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">
            Original Price (₹){" "}
            <span className="text-charcoal/50 font-normal">optional</span>
          </label>
          <input
            type="number"
            min={0}
            className="h-10 w-full rounded border border-charcoal bg-ivory px-3 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-brass"
            value={values.originalPrice || ""}
            onChange={(e) =>
              update(
                "originalPrice",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">
            Stock Quantity
          </label>
          <input
            type="number"
            min={0}
            className="h-10 w-full rounded border border-charcoal bg-ivory px-3 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-brass"
           value={values.stock ?? ""}
            onChange={(e) => update("stock", Number(e.target.value))}
          />
        </div>
      </div>

      {/* ── imageUrls ─────────────────────────────────────────────────────────── */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal">
          Product imageUrls{" "}
          <span className="text-red-500">*</span>{" "}
          <span className="text-charcoal/50 font-normal">
            (up to {MAX_IMAGES}, first image = main)
          </span>
        </label>

        {/* Thumbnails row */}
        {values.imageUrls.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {values.imageUrls.map((url, idx) => (
              <ImageThumb
                key={url + idx}
                url={url}
                index={idx}
                total={values.imageUrls.length}
                onRemove={() => removeImage(idx)}
                onMoveLeft={() => moveImage(idx, idx - 1)}
                onMoveRight={() => moveImage(idx, idx + 1)}
              />
            ))}
          </div>
        )}

        {/* Upload area */}
        {canAddMore && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFilesSelected(e.dataTransfer.files);
            }}
            className="flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-charcoal/30 bg-ivory/50 py-8 text-charcoal/50 hover:border-charcoal/60 hover:text-charcoal/70 transition-colors"
          >
            <svg className="mb-2 h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4-4m0 0l4 4m-4-4v9M20 12a8 8 0 10-16 0"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 16l-4-4m0 0l-4 4"
              />
            </svg>
            <p className="text-sm">
              {uploading
                ? "uploading..."
                : `click or drag to upload (${values.imageUrls.length}/${MAX_IMAGES})`}
            </p>
            <p className="text-xs mt-1">jpg, png, webp — max 5 MB each</p>
          </div>
        )}

        {/* Hidden multi-file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />

        {uploadError && (
          <p className="mt-1.5 text-xs text-red-600">{uploadError}</p>
        )}
        {!canAddMore && (
          <p className="mt-1.5 text-xs text-charcoal/50">
            Maximum {MAX_IMAGES} imageUrls reached. Remove one to add another.
          </p>
        )}
      </div>

      {/* Sizes + Colors */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">
            Sizes{" "}
            <span className="text-charcoal/50 font-normal">(comma-separated)</span>
          </label>
          <input
            className="h-10 w-full rounded border border-charcoal bg-ivory px-3 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-brass"
            value={values.sizes}
            onChange={(e) => update("sizes", e.target.value)}
            placeholder="S, M, L, XL, XXL"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">
            Colors — hex codes{" "}
            <span className="text-charcoal/50 font-normal">(optional)</span>
          </label>
          <input
            className="h-10 w-full rounded border border-charcoal bg-ivory px-3 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-brass"
            value={values.colors}
            onChange={(e) => update("colors", e.target.value)}
            placeholder="#1C1B19, #6B5B45"
          />
        </div>
      </div>

      {/* Bestseller toggle */}
      <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={values.isBestseller}
          onChange={(e) => update("isBestseller", e.target.checked)}
          className="accent-brass h-4 w-4"
        />
        Mark as Bestseller
      </label>

      {/* Global error */}
      {error && (
        <p className="rounded bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={saving || uploading}
        className="w-fit rounded bg-charcoal px-6 py-2.5 text-sm text-ivory hover:bg-charcoal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? "saving..." : submitLabel}
      </button>
    </form>
  );
}