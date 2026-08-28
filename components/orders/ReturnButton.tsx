"use client";

import { useEffect, useState } from "react";
import ReturnRequestModal from "./ReturnRequestModal";
import { isReturnEligible } from "@/app/lib/returns";

interface ReturnRecord {
  _id: string;
  status: "Pending" | "Accepted" | "Rejected";
  reason: string;
  otherReason?: string;
  adminNote?: string;
}

interface ReturnButtonProps {
  orderId: string;
  orderStatus: string;
  deliveredAt?: string | Date | null;
  userId?: string;
}

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Accepted: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function ReturnButton({ orderId, orderStatus, deliveredAt, userId }: ReturnButtonProps) {
  const [existingReturn, setExistingReturn] = useState<ReturnRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchReturn = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/returns?orderId=${orderId}`);
      const data = await res.json();
      setExistingReturn(data.success && data.data.length > 0 ? data.data[0] : null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) return null;

  if (existingReturn) {
    return (
      <div className="mt-2">
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[existingReturn.status]}`}
        >
          Return {existingReturn.status.toLowerCase()}
        </span>
        {existingReturn.status === "Rejected" && existingReturn.adminNote && (
          <p className="mt-1 text-xs text-charcoal/60">{existingReturn.adminNote}</p>
        )}
      </div>
    );
  }

  const eligibility = isReturnEligible({ status: orderStatus, deliveredAt });
  if (!eligibility.eligible) return null;

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="mt-2 rounded-md border border-pink px-3 py-1.5 text-xs font-medium text-pink hover:bg-pink/5"
      >
        Return order
      </button>
      {modalOpen && (
        <ReturnRequestModal
          orderId={orderId}
          userId={userId}
          onClose={() => setModalOpen(false)}
          onSubmitted={() => {
            setModalOpen(false);
            fetchReturn();
          }}
        />
      )}
    </>
  );
}