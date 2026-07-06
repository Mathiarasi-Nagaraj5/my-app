import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Download } from "lucide-react";

export type OrderStatus = "delivered" | "in transit" | "cancelled";

export interface Order {
  id: string;
  date: string;
  itemsSummary: string;
  itemCount: number;
  total: string;
  status: OrderStatus;
}

const STATUS_VARIANT = {
  delivered: "success",
  "in transit": "info",
  cancelled: "danger",
} as const;

export default function OrderCard({ order }: { order: Order }) {
  return (
    <div className="mb-3.5 rounded-card border border-charcoal/15 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-charcoal">order #{order.id}</p>
          <p className="text-xs text-charcoal/55">placed on {order.date}</p>
        </div>
        <Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge>
      </div>

      <div className="flex flex-col gap-3 border-t border-charcoal/15 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-charcoal/75">
          {order.itemsSummary} · {order.itemCount}{" "}
          {order.itemCount === 1 ? "item" : "items"} · {order.total}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-brass text-brass">
            {order.status === "in transit" ? "track order" : "view details"}
          </Button>
          {order.status === "delivered" && (
            <Button variant="ghost" size="sm" icon={<Download size={14} />}>
              invoice
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}