"use client";

import { useEffect, useState } from "react";
import OrderTable, { AdminOrder } from "@/components/admin/OrderTable";
import type { ReturnRecord } from "@/components/admin/ReturnsTable"; // adjust path

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChanged = (orderId: string, newStatus: AdminOrder["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const handleShipped = (orderId: string, shipment: AdminOrder["shipment"]) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, shipment } : o))
    );
  };

const [returns, setReturns] = useState<ReturnRecord[]>([]);

useEffect(() => {
  fetch("/api/admin/returns") // use whatever endpoint ReturnsTable's parent uses
    .then((res) => res.json())
    .then((data) => {
      if (data.success) setReturns(data.data);
    });
}, []);

const handleReturnChanged = (updated: ReturnRecord) => {
  setReturns((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
};
  return (
    <div>
      <h1 className="mb-5 text-lg font-medium text-charcoal">orders</h1>

      {loading ? (
        <p className="text-sm text-charcoal/55">loading orders...</p>
      ) : (
       <OrderTable
  orders={orders}
  returns={returns}
  onReturnChanged={handleReturnChanged}
  onStatusChanged={handleStatusChanged}
  onShipped={handleShipped}
/>
      )}
    </div>
  );
}