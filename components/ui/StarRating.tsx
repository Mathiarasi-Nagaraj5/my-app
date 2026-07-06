interface StarRatingProps {
  rating: number; // e.g. 4.6
  reviewCount?: number;
  size?: "sm" | "md";
}

export default function StarRating({
  rating,
  reviewCount,
  size = "sm",
}: StarRatingProps) {
  const fontSize = size === "sm" ? "text-xs" : "text-sm";
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i + 1 <= Math.round(rating);
    return filled ? "★" : "☆";
  }).join("");

  return (
    <div className={`flex items-center gap-1.5 ${fontSize}`}>
      <span className="text-brass tracking-tight">{stars}</span>
      {reviewCount !== undefined ? (
        <span className="text-charcoal/50">
          {rating.toFixed(1)} ({reviewCount.toLocaleString("en-IN")})
        </span>
      ) : (
        <span className="text-charcoal/50">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}