// File: components/ui/ReviewStars.tsx
import { Star } from "lucide-react";

// 1-2 stars = red (poor), 3 = yellow (mixed), 4-5 = green (good)
function colorClassFor(rating: number) {
  if (rating <= 2) return "fill-red-500 text-red-500";
  if (rating === 3) return "fill-yellow-400 text-yellow-400";
  return "fill-green-500 text-green-500";
}

export default function ReviewStars({
  rating,
  size = 14,
}: {
  rating: number;
  size?: number;
}) {
  const colorClass = colorClassFor(rating);

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= rating ? colorClass : "text-charcoal/20"}
        />
      ))}
    </div>
  );
}