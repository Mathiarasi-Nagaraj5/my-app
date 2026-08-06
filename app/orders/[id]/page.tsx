"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, MapPin, Truck, ExternalLink, Download } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuth } from "@/app/lib/context/AuthContext";
import ReviewForm, { ReviewRecord } from "@/components/review/ReviewForm";

const formatINR = (v: number) => `₹${v.toLocaleString("en-IN")}`;
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

const STATUS_VARIANT: Record<string, "brand" | "success" | "danger" | "info"> = {
  Confirmed: "brand",
  "In Transit": "info",
  Delivered: "success",
  Cancelled: "danger",
};

const STATUS_STEPS = ["Confirmed", "In Transit", "Delivered", "Cancelled"];

interface OrderDetail {
  _id: string;
  orderNumber: string;
  createdAt: string;
  items: { productId: string; name: string; imageUrls: string[]; price: number; quantity: number; size?: string; color?: string }[];
  shippingAddress: { fullName: string; phone: string; addressLine: string; city: string; state: string; pincode: string };
  paymentMethod: "upi" | "card" | "cod";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  subtotal: number;
  delivery: number;
  total: number;
  status: "Confirmed" | "In Transit" | "Delivered" | "Cancelled";
  shipment?: { awbCode?: string; courierName?: string; trackingUrl?: string };
}

function OrderDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  // productId -> existing review for this order, so we know which items
  // already have feedback vs. still need the "rate this product" prompt
  const [reviewsByProduct, setReviewsByProduct] = useState<Record<string, ReviewRecord>>({});

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((result) => setOrder(result.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!order || order.status !== "Delivered") return;

    fetch(`/api/reviews?orderId=${order._id}`)
      .then((res) => res.json())
      .then((result) => {
        const map: Record<string, ReviewRecord> = {};
        for (const review of result.data ?? []) {
          map[review.productId] = review;
        }
        setReviewsByProduct(map);
      })
      .catch(() => {
        /* non-critical - review form just falls back to "not yet reviewed" */
      });
  }, [order]);

  const handleCancel = async () => {
    if (!confirm("cancel this order? if you've already paid, a refund will be issued.")) return;

    setCancelling(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "failed to cancel order");
        return;
      }

      setOrder(data.data);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <p className="px-6 py-16 text-center text-sm text-charcoal/55">loading order...</p>;
  if (notFound || !order) return <p className="px-6 py-16 text-center text-sm text-red-600">order not found.</p>;

  const canCancel = order.status === "Confirmed";
  const canReview = order.status === "Delivered";
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  console.log(canReview, reviewsByProduct, order.items,order .status,order.status === "Delivered");

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <button
        onClick={() => router.push("/orders")}
        className="mb-5 flex items-center gap-1 text-lg text-pink hover:text-charcoal/80"
      >
        <ChevronLeft size={16} /> Back to Orders
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-charcoal">
            Order Number : {order.orderNumber}
          </h1>
          <p className="text-xs text-charcoal/55">placed on {formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge>
      </div>

      {/* status timeline */}
      {order.status !== "Cancelled" && (
        <div className="mb-8 flex items-center">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                    i <= currentStepIndex ? "bg-brass text-charcoal" : "bg-charcoal/10 text-charcoal/40"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="mt-1.5 text-[11px] capitalize text-charcoal/60">{step}</span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`mx-2 h-0.5 flex-1 ${i < currentStepIndex ? "bg-brass" : "bg-charcoal/10"}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* tracking */}
      {order.shipment?.awbCode && (
        <div className="mb-6 flex items-center justify-between rounded-card border border-charcoal/15 p-4">
          <div className="flex items-center gap-2.5">
            <Truck size={18} className="text-brass" />
            <div>
              <p className="text-sm font-medium text-charcoal">{order.shipment.courierName}</p>
              <p className="text-xs text-charcoal/55">AWB: {order.shipment.awbCode}</p>
            </div>
          </div>
          <a
            href={order.shipment.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-brass hover:underline"
          >
            track shipment <ExternalLink size={12} />
          </a>
        </div>
      )}

      {/* items */}
      <div className="mb-6 rounded-card border border-charcoal/15 p-5">
        <p className="mb-4 text-lg font-medium text-charcoal">Items</p>
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

                {/* reviews only unlock once the order has been delivered */}
                {canReview && user?.id && (
                  <ReviewForm
                    orderId={order._id}
                    productId={item.productId}
                    userId={user.id}
                    customerName={order.shippingAddress.fullName}
                    existingReview={reviewsByProduct[item.productId]}
                  />
                )}
              </div>
              <p className="text-sm text-charcoal">{formatINR(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5 border-t border-charcoal/15 pt-4 text-md text-charcoal/70">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{order.delivery === 0 ? "Free" : formatINR(order.delivery)}</span>
          </div>
          <div className="flex justify-between border-t border-charcoal/15 pt-2 text-base font-medium text-charcoal">
            <span>Total</span><span>{formatINR(order.total)}</span>
          </div>
        </div>
      </div>

      {/* shipping address */}
      <div className="mb-6 rounded-card border border-charcoal/15 p-5">
        <p className="mb-3 flex items-center gap-2 text-md font-medium text-charcoal">
          <MapPin size={15} className="text-brass" /> Shipping Address
        </p>
        <p className="text-sm text-charcoal/75">{order.shippingAddress.fullName}</p>
        <p className="text-sm text-charcoal/75">{order.shippingAddress.phone}</p>
        <p className="text-sm text-charcoal/75">
          {order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
        </p>
      </div>

      {/* payment */}
      <div className="mb-6 rounded-card border border-charcoal/15 p-5">
        <p className="mb-2 text-md font-medium text-charcoal">Payment Details</p>
        <p className="text-sm text-charcoal/75 uppercase">
          {order.paymentMethod} · {order.paymentStatus.toLowerCase()}
        </p>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        {canCancel && (
          <Button variant="danger" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? "cancelling..." : "Cancel Order"}
          </Button>
        )}
        {order.status === "Delivered" && (
          <Button variant="ghost" icon={<Download size={14} />}>
            download invoice
          </Button>
        )}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <RequireAuth>
      <OrderDetailContent />
    </RequireAuth>
  );
}