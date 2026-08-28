"use client";

import { useState } from "react";

type OrderStatus = "Confirmed" | "Out for Delivery" | "Delivered" | "Cancelled" | "Returned";

const STATUS_COLORS: Record<OrderStatus, string> = {
  Confirmed: "border-charcoal/40 text-charcoal",
  "Out for Delivery": "border-brass text-brass",
  Delivered: "border-green-600 text-green-700",
  Cancelled: "border-red-600 text-red-700",
  Returned: "border-purple-600 text-purple-700",
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
      <option value="Confirmed">Confirmed</option>
      <option value="Out for Delivery">Out for Delivery</option>
      <option value="Delivered">Delivered</option>
      <option value="Cancelled">Cancelled</option>
    </select>
  );
}