import StarRating from "@/components/ui/StarRating";

// Replace with real reviews for this product (filtered by product.id) once you have a reviews table.
const REVIEWS = [
  {
    name: "Rohit S.",
    rating: 5,
    text: "fabric quality is really good, fits perfectly oversized. worth the price.",
  },
  {
    name: "Priya M.",
    rating: 4,
    text: "delivery was fast, packaging was neat. color is exactly as shown.",
  },
];

export default function ProductReviews() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <h2 className="mb-5 font-serif text-lg font-medium text-charcoal">
        customer reviews
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {REVIEWS.map((review) => (
          <div
            key={review.name}
            className="rounded-card border border-charcoal/15 p-4"
          >
            <StarRating rating={review.rating} />
            <p className="mt-2 text-sm text-charcoal/80">{review.text}</p>
            <p className="mt-3 text-xs text-charcoal/50">
              {review.name} · verified buyer
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}