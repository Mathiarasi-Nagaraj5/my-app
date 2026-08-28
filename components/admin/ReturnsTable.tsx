"use client";

import { useMemo, useState } from "react";

export interface ReturnRecord {
  _id: string;
  orderId: string;
  orderNumber: string;
  userId?: string;
  reason: string;
  otherReason?: string;
  status: "Pending" | "Accepted" | "Rejected";
  adminNote?: string;
  refundStatus: "NotApplicable" | "Pending" | "Completed" | "Failed";
  refundMethod: "razorpay" | "manual" | null;
  reverseShipment?: { shiprocketOrderId?: number; awbCode?: string; failedReason?: string };
  createdAt: string;
  resolvedAt?: string | null;
}

interface ReturnsTableProps {
  returns: ReturnRecord[];
  onReturnsChange: (returns: ReturnRecord[]) => void;
}

const REFUND_STYLES: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
  Failed: "bg-red-100 text-red-700",
  NotApplicable: "bg-gray-100 text-gray-500",
};

export default function ReturnsTable({ returns, onReturnsChange }: ReturnsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Pending" | "Accepted" | "Rejected">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    return returns.filter((r) => {
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || r.orderNumber.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [returns, search, statusFilter]);

  const decide = async (r: ReturnRecord, status: "Accepted" | "Rejected") => {
    setBusyId(r._id);
    try {
      const res = await fetch(`/api/returns/${r._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote: noteDraft[r._id]?.trim() || undefined }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onReturnsChange(returns.map((x) => (x._id === r._id ? data.data : x)));
      } else {
        alert(data.message ?? "failed to update return");
      }
    } finally {
      setBusyId(null);
    }
  };

  const markRefunded = async (r: ReturnRecord) => {
    if (!confirm(`Confirm you've completed the bank transfer for order #${r.orderNumber}?`)) return;
    setBusyId(r._id);
    try {
      const res = await fetch(`/api/returns/${r._id}/mark-refunded`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        onReturnsChange(returns.map((x) => (x._id === r._id ? data.data : x)));
      } else {
        alert(data.message ?? "failed to mark as refunded");
      }
    } finally {
      setBusyId(null);
    }
  };

  const retryPickup = async (r: ReturnRecord) => {
    setBusyId(r._id);
    try {
      const res = await fetch(`/api/returns/${r._id}/retry-pickup`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        onReturnsChange(returns.map((x) => (x._id === r._id ? data.data : x)));
      } else {
        alert(data.message ?? "failed to retry pickup");
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by order number or reason..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
        <span className="ml-auto text-sm text-gray-500 whitespace-nowrap">
          {filtered.length} request{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Order</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Reason</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Refund</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Admin note</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No return requests found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 font-mono font-medium text-gray-900">{r.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.reason}
                    {r.reason === "Other" && r.otherReason && (
                      <p className="mt-1 max-w-xs text-xs text-gray-400">{r.otherReason}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        r.status === "Accepted"
                          ? "bg-green-100 text-green-700"
                          : r.status === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "Accepted" ? (
                      <>
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${REFUND_STYLES[r.refundStatus]}`}>
                          {r.refundStatus === "NotApplicable" ? "N/A" : r.refundStatus}
                          {r.refundMethod ? ` · ${r.refundMethod}` : ""}
                        </span>
                        {r.reverseShipment?.failedReason && (
                          <>
                            <p className="mt-1 text-[11px] text-red-500">pickup: {r.reverseShipment.failedReason}</p>
                            <button
                              onClick={() => retryPickup(r)}
                              disabled={busyId === r._id}
                              className="mt-1 block text-[11px] font-medium text-blue-600 hover:underline disabled:opacity-40"
                            >
                              retry pickup
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "Pending" ? (
                      <input
                        type="text"
                        placeholder="optional note"
                        value={noteDraft[r._id] ?? ""}
                        onChange={(e) => setNoteDraft((prev) => ({ ...prev, [r._id]: e.target.value }))}
                        className="w-full min-w-[160px] rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                      />
                    ) : (
                      <span className="text-xs text-gray-500">{r.adminNote || "-"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {r.status === "Pending" ? (
                      <>
                        <button
                          onClick={() => decide(r, "Accepted")}
                          disabled={busyId === r._id}
                          className="mr-3 text-xs font-medium text-green-600 hover:underline disabled:opacity-40"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => decide(r, "Rejected")}
                          disabled={busyId === r._id}
                          className="text-xs font-medium text-red-600 hover:underline disabled:opacity-40"
                        >
                          Reject
                        </button>
                      </>
                    ) : r.status === "Accepted" && r.refundMethod === "manual" && r.refundStatus === "Pending" ? (
                      <button
                        onClick={() => markRefunded(r)}
                        disabled={busyId === r._id}
                        className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-40"
                      >
                        Mark refunded
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">
                        resolved {r.resolvedAt ? new Date(r.resolvedAt).toLocaleDateString() : ""}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}