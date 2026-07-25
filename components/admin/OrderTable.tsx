"use client";

import { useState } from "react";
import { Truck, ExternalLink } from "lucide-react";
import OrderStatusSelect from "./OrderStatusSelect";

export interface AdminOrder {
  _id: string;
  orderNumber: string;
  shippingAddress: { fullName: string };
  total: number;
  status: "confirmed" | "in transit" | "delivered" | "cancelled";
  createdAt: string;
  paymentMethod?: "upi" | "card" | "cod";
  paymentStatus?: "PENDING" | "PAID" | "FAILED";
  shipment?: {
    awbCode?: string;
    courierName?: string;
    trackingUrl?: string;
  };
}

const formatINR = (v: number) => `₹${v.toLocaleString("en-IN")}`;
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

interface OrderTableProps {
  orders: AdminOrder[];
  onStatusChanged: (orderId: string, newStatus: AdminOrder["status"]) => void;
  onShipped?: (orderId: string, shipment: AdminOrder["shipment"]) => void;
}

export default function OrderTable({ orders, onStatusChanged, onShipped }: OrderTableProps) {
  const [shippingId, setShippingId] = useState<string | null>(null);

  const handleShip = async (order: AdminOrder) => {
    setShippingId(order._id);
    try {
      const res = await fetch(`/api/admin/orders/${order._id}/ship`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "failed to ship order");
        return;
      }

      onShipped?.(order._id, data.shipment);
      onStatusChanged(order._id, "in transit");
    } catch {
      alert("something went wrong while creating the shipment");
    } finally {
      setShippingId(null);
    }
  };

  if (orders.length === 0) {
    return <p className="text-sm text-charcoal/55">no orders yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-card border border-charcoal/10 bg-white">
      <div className="grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr_1fr_1.3fr] gap-2 border-b border-charcoal/10 px-4 py-1.5 text-xs text-charcoal/55">
        <span>order</span>
        <span>customer</span>
        <span>date</span>
        <span>total</span>
        <span>status</span>
        <span>shipping</span>
      </div>
      {orders.map((order) => {
        const canShip =
          !order.shipment?.awbCode &&
          (order.paymentStatus === "PAID" || order.paymentMethod === "cod") &&
          order.status !== "cancelled";

        return (
          <div
            key={order._id}
            className="grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr_1fr_1.3fr] items-center gap-2 border-b border-charcoal/10 px-4 py-1 text-xs text-charcoal last:border-0"
          >
            <span>#{order.orderNumber}</span>
            <span className="truncate">{order.shippingAddress.fullName}</span>
            <span className="text-charcoal/70">{formatDate(order.createdAt)}</span>
            <span>{formatINR(order.total)}</span>
            <OrderStatusSelect
              orderId={order._id}
              status={order.status}
              onChanged={onStatusChanged}
            />

            {order.shipment?.awbCode ? (
              <a
                href={order.shipment.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-brass hover:underline"
              >
                {order.shipment.courierName ?? "Track"}
                <ExternalLink size={11} />
              </a>
            ) : canShip ? (
              <button
                onClick={() => handleShip(order)}
                disabled={shippingId === order._id}
                className="flex items-center gap-1 rounded border border-charcoal/20 px-2 py-1 text-charcoal/70 hover:border-brass hover:text-brass disabled:opacity-50"
              >
                <Truck size={12} />
                {shippingId === order._id ? "shipping..." : "ship"}
              </button>
            ) : (
              <span className="text-charcoal/30">—</span>
            )}
          </div>
        );
      })}
    </div>
  );
}