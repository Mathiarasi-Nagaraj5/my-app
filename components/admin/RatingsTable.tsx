"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";

export interface Review {
  _id: string;
  productId: string;
  orderId: { _id: string; orderNumber?: string } | string;
  userId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface RatingsTableProps {
  reviews: Review[];
  pageSize?: number;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          className={n <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}
        />
      ))}
    </div>
  );
}

function orderLabel(orderId: Review["orderId"]) {
  if (typeof orderId === "string") return orderId.slice(-6).toUpperCase();
  return orderId?.orderNumber ?? orderId?._id?.slice(-6).toUpperCase() ?? "-";
}

export default function RatingsTable({ reviews, pageSize = 10 }: RatingsTableProps) {
  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter((r) => {
      const matchesSearch =
        !q ||
        r.customerName.toLowerCase().includes(q) ||
        r.productId.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q);
      const matchesRating = minRating === 0 || r.rating >= minRating;
      return matchesSearch && matchesRating;
    });
  }, [reviews, search, minRating]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by customer, product or comment..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center gap-2">
          <select
            value={minRating}
            onChange={(e) => {
              setMinRating(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-md border border-gray-300 px-2 py-2 text-sm"
          >
            <option value={0}>All ratings</option>
            <option value={4}>4 stars & up</option>
            <option value={3}>3 stars & up</option>
            <option value={2}>2 stars & up</option>
            <option value={1}>1 star & up</option>
          </select>
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {filtered.length} review{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Product</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Order</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Rating</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Comment</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No reviews found.
                </td>
              </tr>
            ) : (
              paginated.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {r.customerName}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.productId}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    #{orderLabel(r.orderId)}
                  </td>
                  <td className="px-4 py-3">
                    <StarRow rating={r.rating} />
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">{r.comment}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}