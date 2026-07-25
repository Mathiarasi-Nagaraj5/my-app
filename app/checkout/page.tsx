"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import Button from "@/components/ui/Button";
import ShippingForm, { ShippingAddress } from "@/components/checkout/ShippingForm";
import PaymentMethodSelector, { PaymentMethod } from "@/components/checkout/PaymentMethodSelector";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import { useCart } from "@/app/lib/context/CartContext";

const EMPTY_ADDRESS: ShippingAddress = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
};

const FREE_DELIVERY_THRESHOLD = 999;
const DELIVERY_FEE = 1;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
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
          Your bag is empty
        </p>
        <p className="mt-2 text-sm text-charcoal/60">
          Add something to your bag before checking out.
        </p>
        <Link href="/shop" className="mt-6">
          <Button variant="primary">Start Shopping !</Button>
        </Link>
      </div>
    );
  }

  const validate = () => {
    const next: typeof errors = {};
    if (!shippingAddress.fullName) next.fullName = "required";
    if (!shippingAddress.phone || shippingAddress.phone.length < 10) next.phone = "enter a valid phone number";
    if (!shippingAddress.addressLine) next.addressLine = "required";
    if (!shippingAddress.city) next.city = "required";
    if (!shippingAddress.state) next.state = "required";
    if (!shippingAddress.pincode || shippingAddress.pincode.length !== 6) next.pincode = "enter a valid 6-digit pincode";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

const handlePlaceOrder = async () => {
  setOrderError("");

  if (!validate()) return;

  // Cash on Delivery
  if (payment === "cod") {
    setPlacing(true);
    try {
      // TODO: Save COD order to DB
      await new Promise((r) => setTimeout(r, 700));
      clearCart();
      router.push("/orders");
    } finally {
      setPlacing(false);
    }
    return;
  }

  if (typeof window === "undefined" || !(window as any).Razorpay) {
    setOrderError("Payment could not load. Please refresh and try again.");
    return;
  }

  setPlacing(true);

  try {
    // Create Razorpay Order
    const res = await fetch("/api/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: total,
      }),
    });

    const data = await res.json();

    console.log("Create Order Response:", data);

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to create Razorpay order");
    }

    const options = {
      key: data.key,
      amount: data.order.amount,
      currency: data.order.currency,
      order_id: data.order.id,

      name: "Elite Soul",
      description: `${items.length} item${items.length > 1 ? "s" : ""}`,

      prefill: {
        name: shippingAddress.fullName,
        contact: shippingAddress.phone,
      },

      theme: {
        color: "#e0629b",
      },

      handler: async (response: any) => {
        console.log("Payment Response:", response);

        try {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          console.log("Verify Response:", verifyData);

          if (!verifyRes.ok || !verifyData.verified) {
            throw new Error(
              verifyData.message || "Payment verification failed"
            );
          }


          await fetch("/api/orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    items,
     shippingAddress,
    subtotal,
    delivery,
    total,
    paymentMethod: payment,
    paymentStatus: "PAID",
    razorpayOrderId: response.razorpay_order_id,
    razorpayPaymentId: response.razorpay_payment_id,
  }),
});


          clearCart();
          router.push("/orders");
        } catch (err) {
          console.error(err);
          setOrderError(
            "Payment was successful but verification failed."
          );
        } finally {
          setPlacing(false);
        }
      },

      modal: {
        ondismiss: () => {
          setPlacing(false);
        },
      },
    };

    const razorpay = new (window as any).Razorpay(options);

    razorpay.on("payment.failed", function (response: any) {
      console.error("Payment Failed:", response);

      setOrderError(
        response.error?.description ||
          "Payment failed. Please try again."
      );

      setPlacing(false);
    });

    razorpay.open();
  } catch (err) {
    console.error(err);

    setOrderError(
      "Something went wrong while starting the payment."
    );

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
          <span className="font-medium text-pink">1. bag</span>
          <span className="font-medium text-pink">2. checkout</span>
          <span className="text-charcoal/40">3. done</span>
        </div>

        {orderError && (
          <p className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-2.5 text-center text-sm text-red-700">
            {orderError}
          </p>
        )}

        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-8">
            <ShippingForm value={shippingAddress} onChange={setShippingAddress} errors={errors} />
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