"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

const formatINR = (v: number) => `₹${v.toLocaleString("en-IN")}`;
const FREE_DELIVERY_THRESHOLD = 999;

interface OrderSummaryProps {
  subtotal: number;
  itemCount: number;
}

export default function OrderSummary({ subtotal, itemCount }: OrderSummaryProps) {
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : 79;
  const total = subtotal + delivery - discount;

  const applyCoupon = () => {
    // TODO: validate against your real coupons API
    if (coupon.trim().toUpperCase() === "WELCOME10") {
      const value = Math.round(subtotal * 0.1);
      setDiscount(value);
      setCouponMessage(`coupon applied — you saved ${formatINR(value)}`);
    } else {
      setDiscount(0);
      setCouponMessage("invalid coupon code");
    }
  };

  return (
    <div className="rounded-card bg-charcoal p-6">
      <p className="mb-3.5 text-sm font-medium text-ivory">Have a coupon?</p>
      <div className="mb-5 flex gap-2">
        <input
          type="text"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder="Enter code"
          className="h-9 flex-1 rounded border border-pink bg-transparent px-3 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none"
        />
        <Button variant="outline" size="sm" onClick={applyCoupon} className="border-pink text-pink">
          Apply
        </Button>
      </div>
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