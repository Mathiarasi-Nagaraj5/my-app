"use client";

import { useState } from "react";

interface Review {
  _id: string;
  rating: number;
  comment: string;
}

interface EditReviewModalProps {
  review: Review;
  userId: string;
  onClose: () => void;
  onSaved: (updated: Review) => void;
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl leading-none transition-transform hover:scale-110"
          aria-label={`${n} star${n !== 1 ? "s" : ""}`}
        >
          <span
            className={
              n <= (hovered || value) ? "text-amber-400" : "text-charcoal/20"
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export default function EditReviewModal({
  review,
  userId,
  onClose,
  onSaved,
}: EditReviewModalProps) {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    if (comment.trim().length < 5) {
      setError("Comment must be at least 5 characters");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/reviews/${review._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, rating, comment: comment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update review");
      onSaved(data.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Close on backdrop
  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 backdrop-blur-sm p-4"
      onClick={onBackdrop}
    >
      <div className="w-full max-w-md rounded-lg bg-ivory shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-4">
          <h2 className="font-serif text-base font-medium text-charcoal">
            Edit your review
          </h2>
          <button
            onClick={onClose}
            className="text-charcoal/40 hover:text-charcoal transition-colors"
            aria-label="Close"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 px-6 py-5">
          {/* Star picker */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-charcoal/50">
              Rating
            </label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          {/* Comment */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-charcoal/50">
              Your review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full resize-none rounded border border-charcoal/20 bg-white px-3 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none"
              placeholder="What did you think about this product?"
            />
            <p className="mt-1 text-right text-xs text-charcoal/30">
              {comment.trim().length} chars
            </p>
          </div>

          {error && (
            <p className="rounded bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-charcoal/10 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded px-4 py-2 text-sm text-charcoal/60 hover:text-charcoal transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-charcoal px-5 py-2 text-sm text-ivory hover:bg-charcoal/90 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}