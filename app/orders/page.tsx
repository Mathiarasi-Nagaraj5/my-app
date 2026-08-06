"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import AccountSidebar from "@/components/account/AccountSidebar";
import OrderCard, { Order } from "@/components/orders/OrderCard";
import { useAuth } from "@/app/lib/context/AuthContext";

function OrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/orders?userId=${user.id}`)
      .then((res) => res.json())
      .then((result) => {
        const rawOrders = result.data ?? [];
        setOrders(
          rawOrders.map((o: any) => ({
            id: o._id,
            orderNumber: o.orderNumber,
            date: new Date(o.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            itemsSummary: o.items.map((i: any) => i.name).join(", "),
            itemCount: o.items.reduce((sum: number, i: any) => sum + i.quantity, 0),
            total: `₹${o.total.toLocaleString("en-IN")}`,
            status: o.status,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
        <AccountSidebar />
        <div>
          <h1 className="mb-6 font-serif text-2xl font-medium text-charcoal">
            Your Orders
          </h1>

          {loading ? (
            <p className="text-sm text-charcoal/55">loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-charcoal/55">
              you haven&apos;t placed any orders yet.
            </p>
          ) : (
            orders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <RequireAuth>
      <OrdersContent />
    </RequireAuth>
  );
}