// File: components/admin/ProductReviewsManager.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import ReviewStars from "@/components/ui/ReviewStars";
import ReviewComposer, { ComposedReview } from "@/components/admin/ReviewComposer";

interface AdminReview {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  images?: string[];
  isVisible: boolean;
  source: "customer" | "admin";
}

export default function ProductReviewsManager({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?productId=${productId}&includeHidden=true`);
      const data = await res.json();
      if (data.success) setReviews(data.data);
    } catch {
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async (review: ComposedReview) => {
    const res = await fetch("/api/reviews/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, ...review }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to add review");
    setReviews((prev) => [data.data, ...prev]);
  };

  const toggleVisible = async (review: AdminReview) => {
    const res = await fetch(`/api/reviews/${review._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAdmin: true, isVisible: !review.isVisible }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message || "Failed to update review"); return; }
    setReviews((prev) => prev.map((r) => (r._id === review._id ? data.data : r)));
  };

  const remove = async (review: AdminReview) => {
    if (!confirm("Delete this review?")) return;
    const res = await fetch(`/api/reviews/${review._id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAdmin: true }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message || "Failed to delete review"); return; }
    setReviews((prev) => prev.filter((r) => r._id !== review._id));
  };

  return (
    <div className="flex flex-col gap-3">
      <ReviewComposer onAdd={handleAdd} />

      {error && <p className="text-xs text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-charcoal/50">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-charcoal/50">No reviews yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {reviews.map((review) => (
            <div
              key={review._id}
              className={`rounded border p-3 ${
                review.isVisible ? "border-charcoal/15" : "border-charcoal/15 bg-charcoal/5 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ReviewStars rating={review.rating} size={13} />
                    <span className="text-xs font-medium text-charcoal">{review.customerName}</span>
                    {review.source === "admin" && (
                      <span className="rounded-full bg-charcoal/10 px-1.5 py-0.5 text-[10px] text-charcoal/50">
                        admin-added
                      </span>
                    )}
                    {!review.isVisible && (
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] text-red-600">
                        hidden
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-charcoal/70">{review.comment}</p>
                  {review.images && review.images.length > 0 && (
                    <div className="mt-1.5 flex gap-1.5">
                      {review.images.map((url) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={url} src={url} alt="review" className="h-10 w-10 rounded object-cover" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleVisible(review)}
                    className="rounded border border-charcoal/20 px-2 py-1 text-[11px] text-charcoal/70 hover:bg-charcoal/5"
                  >
                    {review.isVisible ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(review)}
                    className="rounded border border-red-200 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}