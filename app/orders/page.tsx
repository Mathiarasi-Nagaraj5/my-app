"use client";

import { useEffect, useState } from "react";
import AccountSidebar from "../../components/account/AccountSidebar";
import OrderCard, { Order } from "../../components/orders/OrderCard";
import RequireAuth from "../../components/auth/RequireAuth";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/orders");

      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await res.json();

      // Your API returns:
      // {
      //   success: true,
      //   data: [...]
      // }

  const formattedOrders: Order[] = data.data.map((order: any) => ({
  id: order._id,
  date: new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
  itemsSummary: order.items.map((item: any) => item.name).join(", "),
  itemCount: order.items.length,
  total: `₹${order.total}`,
  status: order.orderStatus,
}));

setOrders(formattedOrders||[]);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <RequireAuth>
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
        <AccountSidebar />

        <div>
          <h1 className="mb-6 font-serif text-2xl font-medium text-charcoal">
            your orders
          </h1>

          {orders.length === 0 ? (
            <p className="text-sm text-charcoal/55">
              You haven't placed any orders yet.
            </p>
          ) : (
            orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}