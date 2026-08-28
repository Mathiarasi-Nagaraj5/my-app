import Link from "next/link";

export interface RecentOrderRow {
  orderNumber: string;
  customer: string;
  product: string;
  amount: number;
  status: string;
}

const STATUS_STYLE: Record<string, string> = {
  confirmed: "bg-amber-50 text-amber-700",
  "Out for Delivery": "bg-blue-50 text-blue-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

// Dashboard-only summary table — the full sortable/actionable order list
// with status-change controls stays in OrderTable on /admin/orders.
export default function RecentOrdersList({ orders }: { orders: RecentOrderRow[] }) {
  return (
    <div className="rounded-card border border-charcoal/10 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-md text-charcoal">Recent ordersss</p>
        <Link href="/admin/orders" className="text-xs text-pink hover:underline">
          View all
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="py-6 text-center text-xs text-charcoal/50">No orders yet.</p>
      ) : (
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-charcoal/50">
              <th className="pb-2 font-normal">Order ID</th>
              <th className="pb-2 font-normal">Customer</th>
              <th className="pb-2 font-normal">Product</th>
              <th className="pb-2 font-normal">Amount</th>
              <th className="pb-2 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderNumber} className="border-t border-charcoal/5">
                <td className="py-2.5 font-medium text-charcoal">{order.orderNumber}</td>
                <td className="py-2.5 text-charcoal/70">{order.customer}</td>
                <td className="py-2.5 text-charcoal/70">{order.product}</td>
                <td className="py-2.5 text-charcoal/70">₹{order.amount.toLocaleString("en-IN")}</td>
                <td className="py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 capitalize ${
                      STATUS_STYLE[order.status] ?? "bg-charcoal/5 text-charcoal/70"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}