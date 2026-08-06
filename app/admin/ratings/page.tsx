"use client";
import RatingsTable, { Review } from "@/components/admin/RatingsTable";
import { useEffect, useState } from "react";


export default  function RatingsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => { 
    fetch("/api/reviews")
      .then((res) => res.json())    
    .then((data) => setReviews(data.data))
        .catch((err) => console.error("Failed to fetch reviews:", err))
    }, []);
    

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Ratings</h1>
        <p className="text-sm text-gray-500">
          Reviews left by customers after their orders are delivered.
        </p>
      </div>

      <RatingsTable reviews={reviews} />
    </div>
  );
}