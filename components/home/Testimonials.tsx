import StarRating from "../ui/StarRating";

interface Review {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface TestimonialsProps {
  title?: string;
  minRating?: number;
  limit?: number;
}

async function getFeaturedReviews(limit: number): Promise<Review[]> {
  try {
    const base =
      process.env.NEXT_PUBLIC_BASE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const res = await fetch(`${base}/api/reviews?featured=true&limit=${limit}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

const FALLBACK: Review[] = [
  {
    _id: "fallback-1",
    customerName: "Rohit S.",
    rating: 5,
    comment: "Fabric quality is really good, fits perfectly oversized. Worth the price.",
    createdAt: "",
  },
  {
    _id: "fallback-2",
    customerName: "Priya M.",
    rating: 4,
    comment: "Delivery was fast, packaging was neat. Color is exactly as shown.",
    createdAt: "",
  },
  {
    _id: "fallback-3",
    customerName: "Arjun K.",
    rating: 5,
    comment: "Best hoodie I've bought under 2000. Heavy fabric, doesn't feel cheap at all.",
    createdAt: "",
  },
];

export default async function Testimonials({
  title = "What Our Customers Are Saying",
  minRating = 0,
  limit = 6,
}: TestimonialsProps) {
  const fetched = await getFeaturedReviews(limit);
  const dbReviews = fetched.filter((r) => r.rating >= minRating);
  const isFallback = dbReviews.length === 0;
  const reviews = isFallback ? FALLBACK : dbReviews;
  const shown = reviews.slice(0, limit);

  const average = !isFallback
    ? dbReviews.reduce((sum, r) => sum + r.rating, 0) / dbReviews.length
    : 0;

  return (
    <section className="bg-ivory px-6 py-16">
      {/* Heading + divider (matches Shop by Category) */}
      <div className="animate-fade-up mb-12 text-center">
        <h2 className="font-serif text-3xl font-medium text-charcoal">{title}</h2>

        <div className="mt-4 flex items-center justify-center gap-3" aria-hidden="true">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-pink md:w-28" />
          <span className="text-sm leading-none text-pink">✦</span>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-pink md:w-28" />
        </div>

        {!isFallback && (
          <p className="mt-4 text-sm text-charcoal/50">
            <span className="font-semibold text-charcoal">{average.toFixed(1)}</span> average from{" "}
            {dbReviews.length} verified review{dbReviews.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
        {shown.map((review, i) => (
          <ReviewCard key={review._id} review={review} index={i} verified={!isFallback} />
        ))}
      </div>
    </section>
  );
}

function ReviewCard({
  review,
  index,
  verified,
}: {
  review: Review;
  index: number;
  verified: boolean;
}) {
  const initial = review.customerName.trim().charAt(0).toUpperCase() || "?";

  return (
    <figure
      style={{ animationDelay: `${index * 120}ms` }}
      className="animate-fade-up group relative flex flex-col overflow-hidden rounded-card border border-charcoal/10 bg-white p-6 shadow-md shadow-pink/10 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-pink/30 hover:shadow-[0_8px_24px_rgba(236,72,153,0.3)]"
    >
      {/* Decorative quote mark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-2 right-4 select-none font-serif text-8xl leading-none text-pink/10 transition-colors duration-300 group-hover:text-pink/20"
      >
        &rdquo;
      </span>

      <StarRating rating={review.rating} />

      <blockquote className="relative mt-4 flex-1 font-serif text-base leading-relaxed text-charcoal/85">
        {review.comment}
      </blockquote>

      <div className="mt-6 flex items-center gap-3 border-t border-charcoal/10 pt-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink text-sm font-semibold text-white">
          {initial}
        </span>
        <figcaption className="min-w-0">
          <p className="truncate text-sm font-medium text-charcoal">{review.customerName}</p>
          {verified && (
            <p className="flex items-center gap-1 text-xs font-medium text-pink">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
                  clipRule="evenodd"
                />
              </svg>
              Verified buyer
            </p>
          )}
        </figcaption>
      </div>
    </figure>
  );
}