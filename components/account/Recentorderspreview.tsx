import Link from "next/link";
import Badge from "@/components/ui/Badge";

const RECENT_ORDERS = [
  { id: "ES2381", items: "2 items", total: "₹2,698", status: "delivered" as const },
  { id: "ES2405", items: "1 item", total: "₹1,499", status: "in transit" as const },
];

const STATUS_VARIANT = {
  delivered: "success",
  "in transit": "info",
} as const;

export default function RecentOrdersPreview() {
  return (
    <div className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-charcoal">recent orders</h2>
        <Link href="/orders" className="text-xs text-black hover:underline">
          View all
        </Link>
      </div>
      <div className="flex flex-col gap-2.5">
        {RECENT_ORDERS.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between rounded border border-charcoal/15 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-charcoal">order #{order.id}</p>
              <p className="text-xs text-charcoal/55">
                {order.items} · {order.total}
              </p>
            </div>
            <Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}