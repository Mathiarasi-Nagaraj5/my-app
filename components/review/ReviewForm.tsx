"use client";

import { useState } from "react";
import { Star } from "lucide-react";

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

  // already reviewed -> show read-only summary instead of the form
  if (submittedReview) {
    return (
      <div className="mt-2 rounded-md bg-charcoal/5 px-3 py-2">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              size={13}
              className={n <= submittedReview.rating ? "fill-brass text-brass" : "text-charcoal/20"}
            />
          ))}
        </div>
        {submittedReview.comment && (
          <p className="mt-1 text-xs text-charcoal/60">{submittedReview.comment}</p>
        )}
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-1.5 text-xs font-medium text-brass hover:underline"
      >
        Rate this product
      </button>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("please select a rating");
      return;
    }
    if (!comment.trim()) {
      setError("please write a short review");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, productId, userId, customerName, rating, comment }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "failed to submit review");
        return;
      }

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
          <button key={n} type="button" onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(n)}>
            <Star
              size={18}
              className={n <= (hoverRating || rating) ? "fill-brass text-brass" : "text-charcoal/25"}
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
          className="rounded-md bg-brass px-3 py-1.5 text-xs font-medium text-charcoal disabled:opacity-50"
        >
          {submitting ? "submitting..." : "submit review"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-md px-3 py-1.5 text-xs text-charcoal/60 hover:text-charcoal"
        >
          cancel
        </button>
      </div>
    </div>
  );
}