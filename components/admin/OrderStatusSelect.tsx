"use client";

import { useState } from "react";

type OrderStatus = "confirmed" | "in transit" | "delivered" | "cancelled";

const STATUS_COLORS: Record<OrderStatus, string> = {
  confirmed: "border-charcoal/40 text-charcoal",
  "in transit": "border-brass text-brass",
  delivered: "border-green-600 text-green-700",
  cancelled: "border-red-600 text-red-700",
};

interface OrderStatusSelectProps {
  orderId: string;
  status: OrderStatus;
  onChanged: (orderId: string, newStatus: OrderStatus) => void;
}

export default function OrderStatusSelect({
  orderId,
  status,
  onChanged,
}: OrderStatusSelectProps) {
  const [current, setCurrent] = useState(status);
  const [updating, setUpdating] = useState(false);

  const handleChange = async (newStatus: OrderStatus) => {
    setUpdating(true);
    setCurrent(newStatus);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("update failed");
      onChanged(orderId, newStatus);
    } catch {
      setCurrent(status); // revert on failure
    } finally {
      setUpdating(false);
    }
  };

  return (
    <select
      value={current}
      disabled={updating}
      onChange={(e) => handleChange(e.target.value as OrderStatus)}
      className={`h-8 rounded border bg-white px-2 text-xs ${STATUS_COLORS[current]} ${
        updating ? "opacity-50" : ""
      }`}
    >
      <option value="confirmed">confirmed</option>
      <option value="in transit">in transit</option>
      <option value="delivered">delivered</option>
      <option value="cancelled">cancelled</option>
    </select>
  );
}