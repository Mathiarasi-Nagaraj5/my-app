"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import Button from "@/components/ui/Button";
import ShippingForm, { ShippingAddress } from "@/components/checkout/ShippingForm";
import PaymentMethodSelector, { PaymentMethod } from "@/components/checkout/PaymentMethodSelector";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import { useCart } from "@/lib/context/CartContext";

const EMPTY_ADDRESS: ShippingAddress = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
};

const FREE_DELIVERY_THRESHOLD = 999;
const DELIVERY_FEE = 79;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [payment, setPayment] = useState<PaymentMethod>("upi");
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  // this must match the delivery logic inside CheckoutSummary — if you ever
  // change one, change the other, or better: move this into a shared helper.
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-24 text-center">
        <p className="font-serif text-xl font-medium text-charcoal">
          your bag is empty
        </p>
        <p className="mt-2 text-sm text-charcoal/60">
          add something to your bag before checking out.
        </p>
        <Link href="/shop" className="mt-6">
          <Button variant="primary">start shopping</Button>
        </Link>
      </div>
    );
  }

  const validate = () => {
    const next: typeof errors = {};
    if (!address.fullName) next.fullName = "required";
    if (!address.phone || address.phone.length < 10) next.phone = "enter a valid phone number";
    if (!address.addressLine) next.addressLine = "required";
    if (!address.city) next.city = "required";
    if (!address.state) next.state = "required";
    if (!address.pincode || address.pincode.length !== 6) next.pincode = "enter a valid 6-digit pincode";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePlaceOrder = async () => {
    setOrderError("");

    // never open the payment popup on an invalid address
    if (!validate()) return;

    // Cash on Delivery skips Razorpay entirely — confirm directly.
    if (payment === "cod") {
      setPlacing(true);
      try {
        // TODO: call your real order-creation API here (status: "confirmed", paymentMethod: "cod")
        await new Promise((r) => setTimeout(r, 700));
        clearCart();
        router.push("/orders");
      } finally {
        setPlacing(false);
      }
      return;
    }

    if (typeof window === "undefined" || !(window as any).Razorpay) {
      setOrderError("payment could not load. please refresh and try again.");
      return;
    }

    setPlacing(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });

      if (!res.ok) throw new Error("failed to create order");
      const order = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Elite Soul",
        description: `${items.length} item${items.length > 1 ? "s" : ""}`,
        prefill: {
          name: address.fullName,
          contact: address.phone,
        },
        theme: { color: "#A8823D" }, // brass, matches the site theme

        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) throw new Error("payment verification failed");

            // TODO: call your real order-creation API here to persist the
            // order (items, address, payment method, payment_id) before
            // clearing the cart.
            clearCart();
            router.push("/orders");
          } catch {
            setOrderError(
              "payment was received but couldn't be confirmed. contact support with your payment ID."
            );
          } finally {
            setPlacing(false);
          }
        },

        modal: {
          // fires when the customer closes the popup without paying
          ondismiss: () => setPlacing(false),
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", () => {
        setOrderError("payment failed. please try again or use a different method.");
        setPlacing(false);
      });

      rzp.open();
    } catch {
      setOrderError("something went wrong while starting payment. please try again.");
      setPlacing(false);
    }
  };

  return (
    <>
      {/* loads the Razorpay checkout script once, only on this page */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* step indicator */}
        <div className="mb-7 flex justify-center gap-6 text-xs">
          <span className="font-medium text-brass">1. bag</span>
          <span className="font-medium text-brass">2. checkout</span>
          <span className="text-charcoal/40">3. done</span>
        </div>

        {orderError && (
          <p className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-2.5 text-center text-sm text-red-700">
            {orderError}
          </p>
        )}

        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-8">
            <ShippingForm value={address} onChange={setAddress} errors={errors} />
            <PaymentMethodSelector value={payment} onChange={setPayment} />
          </div>

          <CheckoutSummary
            items={items}
            subtotal={subtotal}
            onPlaceOrder={handlePlaceOrder}
            placing={placing}
          />
        </div>
      </div>
    </>
  );
}