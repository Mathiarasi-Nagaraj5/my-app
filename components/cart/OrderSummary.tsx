"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useCart } from "@/app/lib/context/CartContext";

const formatINR = (v: number) => `₹${v.toLocaleString("en-IN")}`;
const FREE_DELIVERY_THRESHOLD = 999;
const DELIVERY_FEE = 79;

interface OrderSummaryProps {
  subtotal: number;
  itemCount: number;
}

export default function OrderSummary({ subtotal, itemCount }: OrderSummaryProps) {
  const { promoCode: appliedCode, setPromoCode } = useCart();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [applying, setApplying] = useState(false);

  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery - discount;

  const applyCoupon = async () => {
    if (!coupon.trim()) return;

    setApplying(true);
    setCouponMessage("");
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.trim(), subtotal }),
      });
      const data = await res.json();

      if (!res.ok) {
        setDiscount(0);
        setPromoCode(null);
        setCouponMessage(data.message ?? "invalid coupon code");
        return;
      }

      setDiscount(data.data.discount);
      setPromoCode(data.data.code); // carries into CheckoutSteps via CartContext
      setCouponMessage(`coupon applied — you saved ${formatINR(data.data.discount)}`);
    } catch {
      setDiscount(0);
      setPromoCode(null);
      setCouponMessage("something went wrong, please try again");
    } finally {
      setApplying(false);
    }
  };

  const removeCoupon = () => {
    setCoupon("");
    setPromoCode(null);
    setDiscount(0);
    setCouponMessage("");
  };

  return (
    <div className="rounded-card bg-charcoal p-6">
      <p className="mb-3.5 text-sm font-medium text-ivory">Have a coupon?</p>

      {appliedCode ? (
        <div className="mb-5 flex items-center justify-between rounded border border-pink/40 bg-pink/5 px-3 py-2">
          <span className="text-sm font-medium text-pink">{appliedCode}</span>
          <button onClick={removeCoupon} className="text-xs text-ivory/60 hover:text-ivory">
            remove
          </button>
        </div>
      ) : (
        <div className="mb-5 flex gap-2">
          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
            placeholder="Enter code"
            disabled={applying}
            className="h-9 flex-1 rounded border border-pink bg-transparent px-3 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none disabled:opacity-50"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={applyCoupon}
            disabled={applying || !coupon.trim()}
            className="border-pink text-pink"
          >
            {applying ? "checking..." : "Apply"}
          </Button>
        </div>
      )}

      {couponMessage && (
        <p className={`-mt-3 mb-4 text-xs ${discount > 0 ? "text-pink" : "text-red-400"}`}>
          {couponMessage}
        </p>
      )}

      <div className="space-y-2 border-t border-ivory/15 pt-4 text-sm text-ivory/75">
        <div className="flex justify-between">
          <span>Subtotal ({itemCount} items)</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery</span>
          <span className={delivery === 0 ? "text-pink" : ""}>
            {delivery === 0 ? "Free" : formatINR(delivery)}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span>Discount</span>
            <span>−{formatINR(discount)}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between border-t border-ivory/15 pt-4 text-base font-medium text-ivory">
        <span>Total</span>
        <span>{formatINR(Math.max(total, 0))}</span>
      </div>

      <Link href="/checkout" className="mt-5 block">
        <Button variant="primary" fullWidth disabled={itemCount === 0}>
          Proceed to Checkout
        </Button>
      </Link>
    </div>
  );
}