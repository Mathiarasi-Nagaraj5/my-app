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

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <section className="mx-auto max-w-4xl px-6 py-14 md:col-span-2">
      {/* Heading + divider */}
      <div className="mb-10 text-center">
        <h2 className="font-serif text-2xl font-medium text-charcoal md:text-3xl">
          Customer Reviews
        </h2>
        <div className="mt-4 flex items-center justify-center gap-3" aria-hidden="true">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-pink md:w-28" />
          <span className="text-sm leading-none text-pink">✦</span>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-pink md:w-28" />
        </div>
        <p className="mt-4 text-sm text-charcoal/50">
          <span className="font-semibold text-charcoal">{average.toFixed(1)}</span> average from{" "}
          {reviews.length} review{reviews.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {reviews.map((review) => (
          <figure
            key={review._id}
            className="group relative flex flex-col overflow-hidden rounded-card border border-charcoal/10 bg-white p-5 shadow-md shadow-pink/10 transition-all duration-300 hover:-translate-y-1 hover:border-pink/30 hover:shadow-[0_8px_24px_rgba(236,72,153,0.3)]"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-2 right-4 select-none font-serif text-7xl leading-none text-pink/10 transition-colors duration-300 group-hover:text-pink/20"
            >
              &rdquo;
            </span>

            <ReviewStars rating={review.rating} />
            <blockquote className="relative mt-3 flex-1 text-sm leading-relaxed text-charcoal/80">
              {review.comment}
            </blockquote>

            {review.images && review.images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {review.images.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt="Customer photo"
                    className="h-16 w-16 rounded-lg border border-charcoal/10 object-cover transition-transform duration-300 hover:scale-105"
                  />
                ))}
              </div>
            )}

            <figcaption className="mt-4 flex items-center gap-3 border-t border-charcoal/10 pt-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink text-sm font-semibold uppercase text-white">
                {review.customerName.trim().charAt(0) || "?"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-charcoal">{review.customerName}</p>
                <p className="flex items-center gap-1 text-xs font-medium text-pink">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified buyer
                </p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}