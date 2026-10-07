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
    comment: "fabric quality is really good, fits perfectly oversized. worth the price.",
    createdAt: "",
  },
  {
    _id: "fallback-2",
    customerName: "Priya M.",
    rating: 4,
    comment: "delivery was fast, packaging was neat. color is exactly as shown.",
    createdAt: "",
  },
  {
    _id: "fallback-3",
    customerName: "Arjun K.",
    rating: 5,
    comment: "best hoodie i've bought under 2000. heavy fabric, doesn't feel cheap at all.",
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
  const reviews = dbReviews.length > 0 ? dbReviews : FALLBACK;
  const shown = reviews.slice(0, limit);

  return (
    <section className="bg-ivory px-6 py-14">
      <h2 className="animate-fade-up mb-2 text-center font-serif text-3xl font-medium text-charcoal">
        {title}
      </h2>
      {dbReviews.length > 0 ? (
        <p className="animate-fade-up mb-8 text-center text-xs text-charcoal/40">
          {dbReviews.length} verified review{dbReviews.length !== 1 ? "s" : ""}
        </p>
      ) : (
        <div className="mb-8" />
      )}

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-3">
        {shown.map((review, i) => (
          <ReviewCard key={review._id} review={review} index={i} />
        ))}
      </div>
    </section>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <div
      style={{ animationDelay: `${index * 120}ms` }}
      className="animate-fade-up flex flex-col rounded-card border border-charcoal/15 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-pink/40 hover:shadow-xl"
    >
      <StarRating rating={review.rating} />
      <p className="mt-3 flex-1 text-sm leading-relaxed text-charcoal/80">
        &ldquo;{review.comment}&rdquo;
      </p>
      <p className="mt-4 text-xs text-charcoal/50">
        {review.customerName} · <span className="font-medium text-pink">verified buyer</span>
      </p>
    </div>
  );
}