"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";

export interface AdminReturn {
  _id: string;
  orderNumber: string;
  customerName: string;
  reason: string;
  note?: string;
  amount: number;
  paymentMethod: "upi" | "card" | "cod";
  status: "requested" | "approved" | "rejected" | "refunded";
  createdAt: string;
}

const formatINR = (v: number) => `₹${v.toLocaleString("en-IN")}`;
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const STATUS_VARIANT: Record<AdminReturn["status"], "brand" | "success" | "danger" | "info"> = {
  requested: "info",
  approved: "brand",
  rejected: "danger",
  refunded: "success",
};

interface ReturnsTableProps {
  returns: AdminReturn[];
  onProcessed: (id: string, updated: Partial<AdminReturn>) => void;
}

export default function ReturnsTable({ returns, onProcessed }: ReturnsTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    if (action === "approve" && !confirm("approve this return and issue a refund?")) return;

    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/returns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "failed to process return");
        return;
      }

      onProcessed(id, { status: data.status });
    } catch {
      alert("something went wrong");
    } finally {
      setProcessingId(null);
    }
  };

  if (returns.length === 0) {
    return <p className="text-xl text-charcoal/55">No Returns requests yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-card border border-charcoal/10 bg-white">
      <div className="grid grid-cols-[0.8fr_1fr_1.2fr_0.8fr_1fr_1.2fr] gap-2 border-b border-charcoal/10 px-4 py-1.5 text-xs text-charcoal/55">
        <span>Order</span>
        <span>Customer</span>
        <span>Reason</span>
        <span>Amount</span>
        <span>Status</span>
        <span>Action</span>
      </div>
      {returns.map((r) => (
        <div
          key={r._id}
          className="grid grid-cols-[0.8fr_1fr_1.2fr_0.8fr_1fr_1.2fr] items-center gap-2 border-b border-charcoal/10 px-4 py-1.5 text-xs text-charcoal last:border-0"
        >
          <span>#{r.orderNumber}</span>
          <span className="truncate">{r.customerName}</span>
          <span className="truncate text-charcoal/70" title={r.note}>
            {r.reason}
          </span>
          <span>{formatINR(r.amount)}</span>
          <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>

          {r.status === "requested" ? (
            <div className="flex gap-2">
              <button
                onClick={() => handleAction(r._id, "approve")}
                disabled={processingId === r._id}
                className="rounded border border-green-600 px-2 py-1 text-green-700 hover:bg-green-50 disabled:opacity-50"
              >
                {processingId === r._id ? "..." : "approve"}
              </button>
              <button
                onClick={() => handleAction(r._id, "reject")}
                disabled={processingId === r._id}
                className="rounded border border-red-600 px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                reject
              </button>
            </div>
          ) : (
            <span className="text-charcoal/40">{formatDate(r.createdAt)}</span>
          )}
        </div>
      ))}
    </div>
  );
}