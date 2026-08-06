"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { useAuth } from "../../app/lib/context/AuthContext";

type OrderStatus = "Confirmed" | "In Transit" | "Delivered" | "Cancelled";

interface RecentOrder {
  id: string;
  orderNumber: string;
  itemCount: number;
  total: string;
  status: OrderStatus;
}

const STATUS_VARIANT: Record<OrderStatus, "success" | "info" | "danger" | "brand"> = {
  Confirmed: "brand",
  "In Transit": "info",
  Delivered: "success",
  Cancelled: "danger",
};

const RECENT_ORDERS_LIMIT = 2;

export default function RecentOrdersPreview() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (!user) return;

    fetch(`/api/orders?userId=${user.id}`)
       .then(async (res) => {

    const response =await res.json();

    return response.data;
  })
      .then((data) => {
  
        const mapped: RecentOrder[] = data
          .slice(0, RECENT_ORDERS_LIMIT)
          .map((o: any) => ({
            id: o._id,
            orderNumber: o.orderNumber,
            itemCount: o.items.reduce((sum: number, i: any) => sum + i.quantity, 0),
            total: `₹${o.total.toLocaleString("en-IN")}`,
            status: o.status,
          }));
   
        setOrders(mapped);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-medium text-charcoal">Recent Orders</h2>
        <Link href="/orders" className="text-xs text-pink hover:underline">
          View all
        </Link>
      </div>

      {loading ? (
        <p className="text-lg text-charcoal/55">loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-lg text-charcoal/55">you haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {orders.map((order) => (
              <Link
                  href={`/orders/${order.id}`}
                  className="mb-3.5 block rounded-card  transition-colors hover:border-brass"
                >
            <div
              key={order.id}
              className="flex items-center justify-between rounded border border-charcoal/15 px-4 py-3"
            >
              <div>
                <p className="text-lg font-medium text-charcoal">
                  Order Number : {order.orderNumber}
                </p>
                <p className="text-md text-charcoal/55">
                  {order.itemCount} {order.itemCount === 1 ? "item" : "items"} · {order.total}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge>
            </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}