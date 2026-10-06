"use client";

import { useState } from "react";
import { useModal } from "@/components/ui/ModalProvider";
import type { ReturnRecord } from "./ReturnsTable";

interface ReturnPanelProps {
  ret: ReturnRecord;
  onChanged: (ret: ReturnRecord) => void;
}

const REFUND_STYLES: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
  Failed: "bg-red-100 text-red-700",
  NotApplicable: "bg-gray-100 text-gray-500",
};

export default function ReturnPanel({ ret, onChanged }: ReturnPanelProps) {
  const { confirm, alert } = useModal();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function call(url: string, init: RequestInit, fallback: string) {
    setBusy(true);
    try {
      const res = await fetch(url, init);
      const data = await res.json();
      if (res.ok && data.success) onChanged(data.data as ReturnRecord);
      else await alert({ message: data.message ?? fallback, variant: "error" });
    } catch {
      await alert({ message: "Network error", variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  const decide = (status: "Accepted" | "Rejected") =>
    call(
      `/api/returns/${ret._id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote: note.trim() || undefined }),
      },
      "failed to update return"
    );

  const retryPickup = () =>
    call(`/api/returns/${ret._id}/retry-pickup`, { method: "POST" }, "failed to retry pickup");

  const markRefunded = async () => {
    const ok = await confirm({
      title: "Confirm refund",
      message: `Confirm you've completed the bank transfer for order #${ret.orderNumber}?`,
      confirmLabel: "Confirm",
    });
    if (!ok) return;
    await call(
      `/api/returns/${ret._id}/mark-refunded`,
      { method: "POST" },
      "failed to mark as refunded"
    );
  };

  return (
    <div className="space-y-2 border-t border-charcoal/10 bg-ivory/60 px-4 py-3 text-sm">
      <div>
        <span className="font-medium text-charcoal">Reason: </span>
        <span className="text-charcoal/80">{ret.reason}</span>
        {ret.reason === "Other" && ret.otherReason && (
          <p className="mt-0.5 text-xs text-charcoal/55">{ret.otherReason}</p>
        )}
      </div>

      {ret.status === "Pending" && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="optional note to customer"
            className="w-full max-w-xs rounded-md border border-charcoal/15 bg-white px-2 py-1.5 text-xs outline-none focus:border-pink"
          />
          <button
            onClick={() => void decide("Accepted")}
            disabled={busy}
            className="rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-40"
          >
            Accept
          </button>
          <button
            onClick={() => void decide("Rejected")}
            disabled={busy}
            className="rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-40"
          >
            Reject
          </button>
        </div>
      )}

      {ret.status !== "Pending" && ret.adminNote && (
        <p className="text-xs text-charcoal/60">Admin note: {ret.adminNote}</p>
      )}

      {ret.status === "Accepted" && (
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${REFUND_STYLES[ret.refundStatus]}`}
          >
            Refund: {ret.refundStatus === "NotApplicable" ? "N/A" : ret.refundStatus}
            {ret.refundMethod ? ` · ${ret.refundMethod}` : ""}
          </span>

          {ret.refundMethod === "manual" && ret.refundStatus === "Pending" && (
            <button
              onClick={() => void markRefunded()}
              disabled={busy}
              className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-40"
            >
              Mark refunded
            </button>
          )}

          {ret.reverseShipment?.failedReason && (
            <span className="flex items-center gap-2 text-xs text-red-500">
              pickup: {ret.reverseShipment.failedReason}
              <button
                onClick={() => void retryPickup()}
                disabled={busy}
                className="font-medium text-blue-600 hover:underline disabled:opacity-40"
              >
                retry pickup
              </button>
            </span>
          )}
          {ret.reverseShipment?.shiprocketOrderId && (
            <span className="text-xs text-charcoal/50">
              reverse pickup scheduled (#{ret.reverseShipment.shiprocketOrderId})
            </span>
          )}
        </div>
      )}
    </div>
  );
}