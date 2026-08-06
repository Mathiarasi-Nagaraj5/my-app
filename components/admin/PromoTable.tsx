"use client";

import { useMemo, useState } from "react";

export interface PromoCodeRecord {
  _id: string;
  code: string;
  description: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

interface PromoTableProps {
  promos: PromoCodeRecord[];
  onPromosChange: (promos: PromoCodeRecord[]) => void;
  pageSize?: number;
}

function isExpired(promo: PromoCodeRecord) {
  return !!promo.expiresAt && new Date(promo.expiresAt) < new Date();
}

export default function PromoTable({ promos, onPromosChange, pageSize = 10 }: PromoTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return promos;
    return promos.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [promos, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleActive = async (promo: PromoCodeRecord) => {
    setBusyId(promo._id);
    try {
      const res = await fetch(`/api/promo/${promo._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !promo.isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        onPromosChange(promos.map((p) => (p._id === promo._id ? data.data : p)));
      }
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (promo: PromoCodeRecord) => {
    if (!confirm(`delete promo code "${promo.code}"? this can't be undone.`)) return;
    setBusyId(promo._id);
    try {
      const res = await fetch(`/api/promo/${promo._id}`, { method: "DELETE" });
      if (res.ok) {
        onPromosChange(promos.filter((p) => p._id !== promo._id));
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search by code or description..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="ml-4 text-sm text-gray-500 whitespace-nowrap">
          {filtered.length} code{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Code</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Discount</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Min order</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Uses</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Expires</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No promo codes found.
                </td>
              </tr>
            ) : (
              paginated.map((p) => {
                const expired = isExpired(p);
                const limitReached = p.maxUses > 0 && p.usedCount >= p.maxUses;
                const effectivelyActive = p.isActive && !expired && !limitReached;

                return (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-medium text-gray-900">{p.code}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.discountType === "percentage" ? `${p.discountValue}%` : `₹${p.discountValue}`}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.minOrderValue > 0 ? `₹${p.minOrderValue}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.usedCount}{p.maxUses > 0 ? ` / ${p.maxUses}` : " / ∞"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          effectivelyActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {effectivelyActive
                          ? "Active"
                          : expired
                          ? "Expired"
                          : limitReached
                          ? "Limit reached"
                          : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(p)}
                        disabled={busyId === p._id}
                        className="mr-3 text-xs font-medium text-blue-600 hover:underline disabled:opacity-40"
                      >
                        {p.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => remove(p)}
                        disabled={busyId === p._id}
                        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
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