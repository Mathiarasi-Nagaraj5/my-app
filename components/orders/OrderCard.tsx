"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Download, ChevronRight } from "lucide-react";

export type OrderStatus = "confirmed" | "Out for Delivery" | "delivered" | "cancelled";

export interface Order {
  id: string; // real MongoDB _id — used for the detail page link
  orderNumber: string; // human-readable, e.g. "ES4821" — used for display
  date: string;
  itemsSummary: string;
  itemCount: number;
  total: string;
  status: OrderStatus;
}

const STATUS_VARIANT = {
  confirmed: "brand",
  "Out for Delivery": "info",
  delivered: "success",
  cancelled: "danger",
} as const;

export default function OrderCard({ order }: { order: Order }) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="mb-3.5 block rounded-card border border-charcoal/15 p-5 transition-colors hover:border-brass"
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-charcoal">Order Number : {order.orderNumber}</p>
          <p className="text-xs text-charcoal/55">Placed on : {order.date}</p>
        </div>
        <Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge>
      </div>

      <div className="flex flex-col gap-3 border-t border-charcoal/15 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-charcoal/75">
          {order.itemsSummary} · {order.itemCount}{" "}
          {order.itemCount === 1 ? "item" : "items"} · {order.total}
        </p>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-sm text-brass">
            {order.status === "Out for Delivery" ? "Track Order" : "View Details"}
            <ChevronRight size={14} />
          </span>
          {order.status === "delivered" && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Download size={14} />}
              onClick={(e) => e.preventDefault()} // don't trigger the card's own link
            >
              Invoice
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
}
