import AccountSidebar from "@/components/account/Accountsidebar";
import OrderCard, { Order } from "@/components/orders/OrderCard";

// TODO: replace with the logged-in user's real order history from your backend.
const ORDERS: Order[] = [
  {
    id: "ES2381",
    date: "24 June 2026",
    itemsSummary: "black oversized tee, fleece hoodie",
    itemCount: 2,
    total: "₹2,698",
    status: "delivered",
  },
  {
    id: "ES2405",
    date: "29 June 2026",
    itemsSummary: "co-ord pyjama set",
    itemCount: 1,
    total: "₹1,499",
    status: "in transit",
  },
  {
    id: "ES2298",
    date: "10 June 2026",
    itemsSummary: "printed graphic tee",
    itemCount: 1,
    total: "₹949",
    status: "cancelled",
  },
];

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
        <AccountSidebar />

        <div>
          <h1 className="mb-6 font-serif text-2xl font-medium text-charcoal">
            your orders
          </h1>

          {ORDERS.length === 0 ? (
            <p className="text-sm text-charcoal/55">
              you haven&apos;t placed any orders yet.
            </p>
          ) : (
            ORDERS.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </div>
      </div>
    </div>
  );
}