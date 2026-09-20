"use client";

import { useMemo, useState } from "react";
import { TAG_LABELS, TAG_STYLES, CustomerTag } from "@/app/lib/customers/classify";

export interface Customer {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderAt?: string | null;
  tag?: CustomerTag;
}

interface CustomerTableProps {
  customers: Customer[];
  pageSize?: number;
}

const formatINR = (v: number) => `₹${v.toLocaleString("en-IN")}`;

export default function CustomerTable({ customers, pageSize = 10 }: CustomerTableProps) {
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<"all" | CustomerTag>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      const matchesTag = tagFilter === "all" || c.tag === tagFilter;
      const matchesSearch =
        !q ||
        c.fullName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q);
      return matchesTag && matchesSearch;
    });
  }, [customers, search, tagFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={tagFilter}
          onChange={(e) => {
            setTagFilter(e.target.value as typeof tagFilter);
            setPage(1);
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="all">All customers</option>
          <option value="good">Good</option>
          <option value="new">New</option>
          <option value="watch">Watch</option>
          <option value="risk">Risk</option>
        </select>
        <span className="ml-auto text-sm text-gray-500 whitespace-nowrap">
          {filtered.length} customer{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Phone</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Orders</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Total Spent</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Joined</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No customers found.
                </td>
              </tr>
            ) : (
              paginated.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.fullName}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.totalOrders ?? 0}</td>
                  <td className="px-4 py-3 text-gray-600">{formatINR(c.totalSpent ?? 0)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {c.tag ? (
                      <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${TAG_STYLES[c.tag]}`}>
                        {TAG_LABELS[c.tag]}
                      </span>
                    ) : (
                      "-"
                    )}
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