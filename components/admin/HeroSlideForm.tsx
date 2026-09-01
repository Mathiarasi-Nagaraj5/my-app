"use client";

import { useRef, useState } from "react";

export interface HeroSlideFormValues {
  eyebrow: string;
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  accentColor: string;
  panelColor: string;
}

const EMPTY_VALUES: HeroSlideFormValues = {
  eyebrow: "",
  headline: "",
  sub: "",
  ctaLabel: "",
  ctaHref: "",
  image: "",
  accentColor: "#C9A96E",
  panelColor: "#EDE7DD",
};

interface HeroSlideFormProps {
  initialValues?: Partial<HeroSlideFormValues>;
  onSubmit: (values: HeroSlideFormValues) => Promise<void> | void;
  submitLabel?: string;
}

export default function HeroSlideForm({
  initialValues,
  onSubmit,
  submitLabel = "save slide",
}: HeroSlideFormProps) {
  const [values, setValues] = useState<HeroSlideFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof HeroSlideFormValues>(
    field: K,
    value: HeroSlideFormValues[K]
  ) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ─────────────────────────────────────────────
  // Hero PNG upload
  // ─────────────────────────────────────────────

  const handleImageSelected = async (
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    setUploadError("");

    if (file.type !== "image/png") {
      setUploadError("Hero image must be a PNG file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Hero image must be smaller than 5 MB.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("files", file);
      formData.append("type", "hero");

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      const imageUrl = data.imageUrls?.[0];

      if (!imageUrl) {
        throw new Error("No image URL returned");
      }

      update("image", imageUrl);
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? err.message
          : "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // ─────────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────────

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (!values.eyebrow.trim()) {
      setError("Eyebrow is required");
      return;
    }

    if (!values.headline.trim()) {
      setError("Headline is required");
      return;
    }

    if (!values.sub.trim()) {
      setError("Sub text is required");
      return;
    }

    if (!values.ctaLabel.trim()) {
      setError("CTA label is required");
      return;
    }

    if (!values.ctaHref.trim()) {
      setError("CTA link is required");
      return;
    }

    if (!values.image) {
      setError("Hero PNG image is required");
      return;
    }

    setSaving(true);

    try {
      await onSubmit(values);
    } catch {
      setError(
        "Something went wrong while saving the slide."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
    >
      {/* ─────────────────────────────
          Text
      ───────────────────────────── */}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal">
          Eyebrow
        </label>

        <input
          value={values.eyebrow}
          onChange={(e) =>
            update("eyebrow", e.target.value)
          }
          placeholder="New Arrival"
          className="h-10 w-full rounded border border-charcoal bg-ivory px-3 text-sm"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal">
          Headline
        </label>

        <textarea
          value={values.headline}
          onChange={(e) =>
            update("headline", e.target.value)
          }
          placeholder={"Oversized comfort.\nBuilt to last."}
          rows={3}
          className="w-full rounded border border-charcoal bg-ivory px-3 py-2 text-sm"
        />

        <p className="mt-1 text-xs text-charcoal/50">
          Use Enter for line breaks.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal">
          Description
        </label>

        <textarea
          value={values.sub}
          onChange={(e) =>
            update("sub", e.target.value)
          }
          placeholder="Heavy-weight cotton tees — made for everyday wear."
          rows={3}
          className="w-full rounded border border-charcoal bg-ivory px-3 py-2 text-sm"
        />
      </div>

      {/* ─────────────────────────────
          CTA
      ───────────────────────────── */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">
            CTA Label
          </label>

          <input
            value={values.ctaLabel}
            onChange={(e) =>
              update("ctaLabel", e.target.value)
            }
            placeholder="Shop T-shirts"
            className="h-10 w-full rounded border border-charcoal bg-ivory px-3 text-sm"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">
            CTA Link
          </label>

          <input
            value={values.ctaHref}
            onChange={(e) =>
              update("ctaHref", e.target.value)
            }
            placeholder="/shop?category=t-shirts"
            className="h-10 w-full rounded border border-charcoal bg-ivory px-3 text-sm"
          />
        </div>
      </div>

      {/* ─────────────────────────────
          Colors
      ───────────────────────────── */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Panel Color */}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">
            Panel Color
          </label>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={values.panelColor}
              onChange={(e) =>
                update("panelColor", e.target.value)
              }
              className="h-10 w-14 cursor-pointer rounded border border-charcoal p-1"
            />

            <input
              value={values.panelColor}
              onChange={(e) =>
                update("panelColor", e.target.value)
              }
              className="h-10 flex-1 rounded border border-charcoal bg-ivory px-3 text-sm uppercase"
              placeholder="#EDE7DD"
            />
          </div>
        </div>

        {/* Accent Color */}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">
            Accent Color
          </label>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={values.accentColor}
              onChange={(e) =>
                update("accentColor", e.target.value)
              }
              className="h-10 w-14 cursor-pointer rounded border border-charcoal p-1"
            />

            <input
              value={values.accentColor}
              onChange={(e) =>
                update("accentColor", e.target.value)
              }
              className="h-10 flex-1 rounded border border-charcoal bg-ivory px-3 text-sm uppercase"
              placeholder="#C9A96E"
            />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────
          Hero PNG
      ───────────────────────────── */}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal">
          Hero Image <span className="text-red-500">*</span>
        </label>

        {values.image && (
          <div className="mb-3 relative w-full max-w-md rounded border border-charcoal/20 overflow-hidden bg-ivory">
            <img
              src={values.image}
              alt="Hero preview"
              className="w-full h-48 object-contain"
            />

            <button
              type="button"
              onClick={() => update("image", "")}
              className="absolute right-2 top-2 rounded bg-red-600 px-2 py-1 text-xs text-white"
            >
              Remove
            </button>
          </div>
        )}

        <div
          onClick={() =>
            !uploading &&
            fileInputRef.current?.click()
          }
          className="
            flex
            cursor-pointer
            flex-col
            items-center
            justify-center
            rounded
            border-2
            border-dashed
            border-charcoal/30
            bg-ivory/50
            py-8
            text-charcoal/50
            transition-colors
            hover:border-charcoal/60
            hover:text-charcoal/70
          "
        >
          <svg
            className="mb-2 h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
            />
          </svg>

          <p className="text-sm">
            {uploading
              ? "Uploading..."
              : "Click to upload hero image"}
          </p>

          <p className="mt-1 text-xs">
            PNG only — maximum 5 MB
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,.png"
          className="hidden"
          onChange={(e) =>
            handleImageSelected(e.target.files)
          }
        />

        {uploadError && (
          <p className="mt-1.5 text-xs text-red-600">
            {uploadError}
          </p>
        )}
      </div>

      {/* Error */}

      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {/* Submit */}

      <button
        type="submit"
        disabled={saving || uploading}
        className="
          w-fit
          rounded
          bg-charcoal
          px-6
          py-2.5
          text-sm
          text-ivory
          transition-colors
          hover:bg-charcoal/90
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {saving
          ? "saving..."
          : submitLabel}
      </button>
    </form>
  );
}