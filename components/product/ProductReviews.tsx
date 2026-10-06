"use client";

import ReviewStars from "@/components/ui/ReviewStars";

export interface ReviewItem {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  images?: string[];
}

export default function ProductReviews({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-6 py-10 md:col-span-2">
      <h2 className="mb-5 font-serif text-xl font-medium text-charcoal">
        Customer Reviews
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="rounded-card border border-charcoal/15 p-4"
          >
            <ReviewStars rating={review.rating} />
            <p className="mt-2 text-sm text-charcoal/80">{review.comment}</p>

            {review.images && review.images.length > 0 && (
              <div className="mt-2.5 flex gap-2">
                {review.images.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt="customer photo"
                    className="h-14 w-14 rounded object-cover border border-charcoal/10"
                  />
                ))}
              </div>
            )}

            <p className="mt-3 text-xs text-charcoal/90">
              {review.customerName} ·{" "}
              <span className="rounded bg-pink-200 px-2 py-1 text-pink-700">
                verified buyer
              </span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}