"use client";
import RatingsTable, { Review } from "@/components/admin/RatingsTable";
import RequireAdmin from "@/components/auth/RequireAdmin";
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
    <RequireAdmin>
    <div >
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-medium text-charcoal">Ratings</h1>
        <p className="text-sm text-gray-500">
          Reviews left by customers after their orders are delivered.
        </p>
      </div>

      <RatingsTable reviews={reviews} />
    </div>
    </RequireAdmin>
  );
}