"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, MapPin, Package } from "lucide-react";
import Button from "@/components/ui/Button";

const formatINR = (v: number) => `₹${v.toLocaleString("en-IN")}`;
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

interface ConfirmedOrder {
  _id: string;
  orderNumber: string;
  createdAt: string;
  items: { name: string; imageUrls: string[]; price: number; quantity: number; size?: string; color?: string }[];
  shippingAddress: { fullName: string; phone: string; addressLine: string; city: string; state: string; pincode: string };
  paymentMethod: "upi" | "card" | "cod";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  subtotal: number;
  delivery: number;
  total: number;
}

export default function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<ConfirmedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    fetch(`/api/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((result) => setOrder(result.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return <p className="px-6 py-24 text-center text-sm text-charcoal/55">loading your order...</p>;
  }

  if (notFound || !order) {
    return (
      <div className="flex flex-col items-center px-6 py-24 text-center">
        <p className="text-sm text-red-600">we couldn&apos;t find that order.</p>
        <Link href="/orders" className="mt-4">
          <Button variant="outline">view your orders</Button>
        </Link>
      </div>
    );
  }

  const estimatedDelivery = new Date(order.createdAt);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 6);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      {/* step indicator — "Done" active, matches the checkout page's style */}
      <div className="mb-8 flex justify-center gap-6 text-lg">
        <Link href="/cart" className="text-pink hover:underline">1. Bag</Link>
        <Link href="/checkout" className="text-pink hover:underline">2. Checkout</Link>
        <span className="font-semibold text-pink">3. Done</span>
      </div>

      {/* success header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <CheckCircle2 size={52} className="mb-3 text-green-600" />
        <h1 className="font-serif text-2xl font-medium text-charcoal">Order Confirmed!</h1>
        <p className="mt-1.5 text-md text-charcoal/80">
          Thank you — your order <span className="font-medium text-charcoal">#{order.orderNumber}</span> has been placed.
        </p>
        {order.paymentMethod !== "cod" && (
          <p className="mt-1 text-sm text-charcoal/50">
            {order.paymentStatus === "PAID" ? "Payment received" : "Payment pending"}
          </p>
        )}
      </div>

      {/* estimated delivery */}
      <div className="mb-6 flex items-center justify-center gap-2 rounded-card border border-charcoal/15 bg-pink/5 px-4 py-3 text-sm text-charcoal">
        <Package size={16} className="text-pink" />
        Estimated delivery by <span className="font-medium">{formatDate(estimatedDelivery.toISOString())}</span>
      </div>

      {/* items */}
      <div className="mb-6 rounded-card border border-charcoal/15 p-5">
        <p className="mb-4 text-sm font-medium text-charcoal">Items</p>
        <div className="flex flex-col gap-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-charcoal">
                <Image src={item.imageUrls[0]} alt={item.name} fill className="object-cover" sizes="48px" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-charcoal">{item.name}</p>
                <p className="text-xs text-charcoal/55">
                  {item.size && `size: ${item.size}`}
                  {item.size && item.color && " · "}
                  {item.color && `color: ${item.color}`}
                  {(item.size || item.color) && " · "}
                  qty: {item.quantity}
                </p>
              </div>
              <p className="text-sm text-charcoal">{formatINR(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5 border-t border-charcoal/15 pt-4 text-sm text-charcoal/70">
          <div className="flex justify-between"><span>subtotal</span><span>{formatINR(order.subtotal)}</span></div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{order.delivery === 0 ? "free" : formatINR(order.delivery)}</span>
          </div>
          <div className="flex justify-between border-t border-charcoal/15 pt-2 text-base font-medium text-charcoal">
            <span>Total</span><span>{formatINR(order.total)}</span>
          </div>
        </div>
      </div>

      {/* shipping address */}
      <div className="mb-8 rounded-card border border-charcoal/15 p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-medium text-charcoal">
          <MapPin size={15} className="text-pink" /> Shipping to
        </p>
        <p className="text-sm text-charcoal/75">{order.shippingAddress.fullName}</p>
        <p className="text-sm text-charcoal/75">{order.shippingAddress.phone}</p>
        <p className="text-sm text-charcoal/75">
          {order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href={`/orders/${order._id}`} className="flex-1">
          <Button variant="primary" fullWidth>View Order Details</Button>
        </Link>
        <Link href="/shop" className="flex-1">
          <Button variant="outline" fullWidth>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}