import StarRating from "../ui/StarRating";

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
  {
    name: "Arjun K.",
    rating: 5,
    text: "best hoodie i've bought under 2000. heavy fabric, doesn't feel cheap at all.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-ivory px-6 py-14">
      <h2 className="mb-8 text-center font-serif text-2xl font-medium text-charcoal">
        what customers are saying
      </h2>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-3">
        {REVIEWS.map((review) => (
          <div
            key={review.name}
            className="rounded-card border border-charcoal/15 bg-ivory p-5"
          >
            <StarRating rating={review.rating} />
            <p className="mt-3 text-sm text-charcoal/80">{review.text}</p>
            <p className="mt-4 text-xs text-charcoal/50">
              {review.name} · verified buyer
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}