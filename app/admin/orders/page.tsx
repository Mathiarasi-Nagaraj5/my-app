"use client";

import { useEffect, useState } from "react";
import OrderTable, { AdminOrder } from "@/components/admin/OrderTable";

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

  return (
    <div>
      <h1 className="mb-5 text-2xl font-medium text-charcoal">Orders</h1>

      {loading ? (
        <p className="text-sm text-charcoal/55">loading orders...</p>
      ) : (
        <OrderTable
          orders={orders}
          onStatusChanged={handleStatusChanged}
          onShipped={handleShipped}
        />
      )}
    </div>
  );
}