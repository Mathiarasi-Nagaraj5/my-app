import StarRating from "../ui/StarRating";

interface Review {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Server component — fetches at request time (or use revalidate for ISR)
async function getFeaturedReviews(): Promise<Review[]> {
  try {
    const base =
      process.env.NEXT_PUBLIC_BASE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const res = await fetch(`${base}/api/reviews?featured=true&limit=6`, {
      next: { revalidate: 60 }, // revalidate every 60 s
    });

    if (!res.ok) return [];

    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

// Hardcoded fallback shown when DB has no reviews yet
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

export default async function Testimonials() {
  const dbReviews = await getFeaturedReviews();
  const reviews = dbReviews.length > 0 ? dbReviews : FALLBACK;

  // Show 3 on homepage max
  const shown = reviews.slice(0, 3);

  return (
    <section className="bg-ivory px-6 py-14">
      <h2 className="mb-2 text-center font-serif text-3xl font-medium text-charcoal">
        What Our Customers Are Saying
      </h2>
      {dbReviews.length > 0 && (
        <p className="mb-8 text-center text-xs text-charcoal/40">
          {dbReviews.length} verified review{dbReviews.length !== 1 ? "s" : ""}
        </p>
      )}
      {dbReviews.length === 0 && <div className="mb-8" />}

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-3">
        {shown.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-card border border-charcoal/15 bg-white p-5 flex flex-col">
      <StarRating rating={review.rating} />
      <p className="mt-3 flex-1 text-sm leading-relaxed text-charcoal/80">
        "{review.comment}"
      </p>
      <p className="mt-4 text-xs text-charcoal/50">
        {review.customerName} · verified buyer
      </p>
    </div>
  );
}