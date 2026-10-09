"use client";

import { useEffect, useState } from "react";
import OrderTable, { AdminOrder } from "@/components/admin/OrderTable";
import type { ReturnRecord } from "@/components/admin/ReturnsTable";
import RequireAdmin from "@/components/auth/RequireAdmin";
import ExportButtons from "@/components/admin/ExportButton";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/orders").then((res) => res.json()),
      fetch("/api/returns")
        .then((res) => res.json())
        .catch(() => ({ success: false, data: [] })),
    ])
      .then(([ordersData, returnsData]) => {
        setOrders(ordersData);
        setReturns(returnsData.success ? returnsData.data : []);
      })
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

  const handleReturnChanged = (updated: ReturnRecord) => {
    setReturns((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
  };

  return (
    <RequireAdmin>
      <div>
      
   
   <div className="mb-4 flex flex-wrap items-center justify-between gap-2 p-4">
    <div>
        <h1 className="mb-1 text-2xl font-medium text-charcoal">Orders</h1>
        <p className="mb-4 text-sm text-gray-500">
          View and manage all products available in the store.
        </p>
    </div>
                   <ExportButtons type="orders" label="Export orders" />   

   </div>
        {loading ? (
          <p className="text-sm text-charcoal/55">loading orders...</p>
        ) : (
          <>
          <OrderTable
            orders={orders}
            returns={returns}
            onReturnChanged={handleReturnChanged}
            onStatusChanged={handleStatusChanged}
            onShipped={handleShipped}
          />
          </>
        )}
      </div>
    </RequireAdmin>
  );
}