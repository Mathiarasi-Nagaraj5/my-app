// File: components/admin/ReviewComposer.tsx
"use client";

import { useRef, useState } from "react";
import { Star } from "lucide-react";

const MAX_IMAGES = 3;

export interface ComposedReview {
  customerName: string;
  rating: number;
  comment: string;
  images: string[];
}

export default function ReviewComposer({
  onAdd,
  submitLabel = "+ Add review",
}: {
  onAdd: (review: ComposedReview) => void | Promise<void>;
  submitLabel?: string;
}) {
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError("");

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`Maximum ${MAX_IMAGES} photos allowed`);
      return;
    }

    const selected = Array.from(files).slice(0, remaining);
    for (const file of selected) {
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" is not an image file`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 5 MB limit`);
        return;
      }
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("type", "review");
      selected.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setImages((prev) => [...prev, ...(data.imageUrls ?? [])]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const reset = () => {
    setCustomerName("");
    setRating(0);
    setComment("");
    setImages([]);
    setError("");
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) { setError("Reviewer name is required"); return; }
    if (rating === 0) { setError("Please select a rating"); return; }
    if (!comment.trim()) { setError("Please write a comment"); return; }

    setSubmitting(true);
    setError("");
    try {
      await onAdd({ customerName: customerName.trim(), rating, comment: comment.trim(), images });
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded border border-dashed border-charcoal/30 p-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          className="h-9 rounded border border-charcoal/30 bg-ivory px-2.5 text-sm text-charcoal"
          placeholder="Reviewer name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
            >
              <Star
                size={18}
                className={
                  n <= (hover || rating) ? "fill-yellow-400 text-yellow-400" : "text-charcoal/25"
                }
              />
            </button>
          ))}
        </div>
      </div>

      <textarea
        className="mt-2 w-full resize-none rounded border border-charcoal/30 bg-ivory px-2.5 py-2 text-sm text-charcoal"
        rows={2}
        placeholder="Review text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {images.map((url, idx) => (
          <div key={url} className="relative h-12 w-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`photo ${idx + 1}`} className="h-12 w-12 rounded object-cover border border-charcoal/15" />
            <button
              type="button"
              onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
              className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-charcoal text-[10px] text-ivory"
            >
              ×
            </button>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex h-12 w-12 items-center justify-center rounded border border-dashed border-charcoal/30 text-[10px] text-charcoal/50 disabled:opacity-50"
          >
            {uploading ? "…" : "+ photo"}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || uploading}
        className="mt-2.5 rounded bg-charcoal px-3 py-1.5 text-xs font-medium text-ivory disabled:opacity-50"
      >
        {submitting ? "Adding…" : submitLabel}
      </button>
    </div>
  );
}