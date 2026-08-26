"use client";

import { useState } from "react";
import { Truck, ExternalLink } from "lucide-react";
import OrderStatusSelect from "./OrderStatusSelect";
import ShipmentPanel from "./ShipmentPanel";

export interface AdminOrder {
  _id: string;
  orderNumber: string;
  shippingAddress: { fullName: string };
  total: number;
  status: "Confirmed" | "In Transit" | "Delivered" | "Cancelled" | "Returned";
  createdAt: string;
  paymentMethod?: "upi" | "card" | "cod";
  paymentStatus?: "PENDING" | "PAID" | "FAILED";
  shipment?: {
    awbCode?: string;
    courierName?: string;
    trackingUrl?: string;
    labelUrl?: string;
    manifestUrl?: string;
    pickupScheduledAt?: string;
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      onStatusChanged(order._id, "In Transit");
    } catch {
      alert("something went wrong while creating the shipment");
    } finally {
      setShippingId(null);
    }
  };

  const handleShipmentUpdated = (orderId: string, shipment: AdminOrder["shipment"]) => {
    onShipped?.(orderId, shipment);
  };

  if (orders.length === 0) {
    return <p className="text-sm text-charcoal/55">no orders yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-card border border-charcoal/10 bg-white">
      <div className="grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr_1fr_1.3fr] gap-2 border-b border-charcoal/10 px-4 py-1.5 text-lg text-pink">
        <span>Order No</span>
        <span>Customer</span>
        <span>Date</span>
        <span>Total</span>
        <span>Status</span>
        <span>Shipping</span>
      </div>
      {orders.map((order) => {
        const canShip =
          !order.shipment?.awbCode &&
          (order.paymentStatus === "PAID" || order.paymentMethod === "cod") &&
          order.status !== "Cancelled";
        const isExpanded = expandedId === order._id;

        return (
          <div key={order._id} className="border-b border-charcoal/10 last:border-0">
            <div className="grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr_1fr_1.3fr] items-center gap-2 px-4 py-1 text-sm text-charcoal">
              <span>#{order.orderNumber}</span>
              <span className="truncate">{order.shippingAddress.fullName}</span>
              <span className="text-charcoal">{formatDate(order.createdAt)}</span>
              <span>{formatINR(order.total)}</span>
              <OrderStatusSelect
                orderId={order._id}
                status={order.status}
                onChanged={onStatusChanged}
              />

              {order.shipment?.awbCode ? (
                <div className="flex items-center gap-2">
                  <a
                    href={order.shipment.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-brass hover:underline"
                  >
                    {order.shipment.courierName ?? "Track"}
                    <ExternalLink size={11} />
                  </a>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order._id)}
                    className="text-[11px] text-charcoal/40 hover:text-charcoal/60"
                  >
                    {isExpanded ? "hide" : "more"}
                  </button>
                </div>
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

            {isExpanded && order.shipment?.awbCode && (
              <ShipmentPanel
                orderId={order._id}
                shipment={order.shipment}
                onUpdated={(shipment) => handleShipmentUpdated(order._id, shipment)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}