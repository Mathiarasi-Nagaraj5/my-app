"use client";

import { useEffect, useState } from "react";
import { Star, Pencil, Check, X } from "lucide-react";

export interface ReviewRecord {
  _id: string;
  rating: number;
  comment: string;
}

interface ReviewFormProps {
  orderId: string;
  productId: string;
  userId: string;
  customerName: string;
  existingReview?: ReviewRecord;
  onSubmitted?: (review: ReviewRecord) => void;
}

export default function ReviewForm({
  orderId,
  productId,
  userId,
  customerName,
  existingReview,
  onSubmitted,
}: ReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedReview, setSubmittedReview] = useState<ReviewRecord | undefined>(
    existingReview
  );

  // ── Edit state ────────────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editHover, setEditHover] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (existingReview) {
      setSubmittedReview(existingReview);
    }
  }, [existingReview]);

  const openEdit = () => {
    if (!submittedReview) return;
    setEditRating(submittedReview.rating);
    setEditComment(submittedReview.comment);
    setEditError("");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditError("");
  };

  const handleEditSubmit = async () => {
    if (editRating === 0) { setEditError("Please select a rating"); return; }
    if (!editComment.trim()) { setEditError("Please write a short review"); return; }

    setSubmitting(true);
    setEditError("");
    try {
      const res = await fetch(`/api/reviews/${submittedReview!._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, rating: editRating, comment: editComment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.message ?? "Failed to update review"); return; }

      const updated = { ...submittedReview!, rating: editRating, comment: editComment.trim() };
      setSubmittedReview(updated);
      onSubmitted?.(updated);
      setEditing(false);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Already reviewed ──────────────────────────────────────────────────────
  if (submittedReview) {
    // Editing mode — inline edit form
    if (editing) {
      return (
        <div className="mt-2 rounded-md border border-charcoal/20 p-3">
          {/* Star picker */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setEditHover(n)}
                onMouseLeave={() => setEditHover(0)}
                onClick={() => setEditRating(n)}
              >
                <Star
                  size={18}
                  className={
                    n <= (editHover || editRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-charcoal/25"
                  }
                />
              </button>
            ))}
          </div>

          <textarea
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Update your review…"
            className="mt-2 w-full resize-none rounded-md border border-charcoal/15 px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brass"
          />

          {editError && <p className="mt-1 text-xs text-red-600">{editError}</p>}

          <div className="mt-2 flex gap-2">
            <button
              onClick={handleEditSubmit}
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-md bg-charcoal px-3 py-1.5 text-xs font-medium text-ivory disabled:opacity-50"
            >
              <Check size={12} />
              {submitting ? "Saving…" : "Save"}
            </button>
            <button
              onClick={cancelEdit}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-charcoal/60 hover:text-charcoal"
            >
              <X size={12} />
              Cancel
            </button>
          </div>
        </div>
      );
    }

    // Read-only display with edit icon
    return (
      <div className="mt-2 rounded-md bg-charcoal/5 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={13}
                className={
                  n <= submittedReview.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-charcoal/25"
                }
              />
            ))}
          </div>

          {/* Edit button */}
          <button
            onClick={openEdit}
            title="Edit review"
            className="flex items-center gap-1 rounded p-1 text-charcoal/40 transition-colors hover:bg-charcoal/10 hover:text-charcoal"
          >
            <Pencil size={12} />
            <span className="text-[11px]">Edit</span>
          </button>
        </div>

        {submittedReview.comment && (
          <p className="mt-1 text-xs text-charcoal/60">{submittedReview.comment}</p>
        )}
      </div>
    );
  }

  // ── Not yet reviewed ──────────────────────────────────────────────────────
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-1.5 rounded-md border-4 bg-pink p-1.5 text-sm font-medium text-ivory hover:underline"
      >
        Rate this product
      </button>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) { setError("Please select a rating"); return; }
    if (!comment.trim()) { setError("Please write a short review"); return; }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, productId, userId, customerName, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message ?? "Failed to submit review"); return; }
      setSubmittedReview(data.data);
      onSubmitted?.(data.data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-2 rounded-md border border-charcoal/15 p-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(n)}
          >
            <Star
              size={18}
              className={
                n <= (hoverRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-charcoal/25"
              }
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="share your experience with this product..."
        className="mt-2 w-full rounded-md border border-charcoal/15 px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brass"
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      <div className="mt-2 flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-md bg-charcoal/90 px-3 py-1.5 text-xs font-medium text-ivory disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-md px-3 py-1.5 text-xs text-charcoal/60 hover:text-charcoal"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}