"use client";

import { useState } from "react";
import { RETURN_REASONS } from "@/app/lib/returns";

interface ReturnRequestModalProps {
  orderId: string;
  userId?: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function ReturnRequestModal({ orderId, userId, onClose, onSubmitted }: ReturnRequestModalProps) {
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!reason) return setError("please select a reason");
    if (reason === "Other" && !otherReason.trim()) return setError("please describe your reason");

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          userId,
          reason,
          otherReason: reason === "Other" ? otherReason.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message ?? "failed to submit return request");
        return;
      }
      onSubmitted();
    } catch {
      setError("something went wrong, please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-1 font-serif text-lg font-medium text-charcoal">Request a return</h2>
        <p className="mb-4 text-sm text-charcoal/60">Tell us why you&apos;d like to return this order.</p>

        <label className="mb-1 block text-xs font-medium text-charcoal/70">Reason</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Select a reason</option>
          {RETURN_REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {reason === "Other" && (
          <>
            <label className="mb-1 block text-xs font-medium text-charcoal/70">Please describe</label>
            <textarea
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              rows={3}
              placeholder="Tell us more..."
              className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </>
        )}

        {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md px-4 py-2 text-sm text-charcoal/60 hover:text-charcoal">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-md bg-pink px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "submitting..." : "Submit return request"}
          </button>
        </div>
      </div>
    </div>
  );
}