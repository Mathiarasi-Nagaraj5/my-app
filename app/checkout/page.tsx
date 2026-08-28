"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import Button from "@/components/ui/Button";
import ShippingForm, { ShippingAddress } from "@/components/checkout/ShippingForm";
import SavedAddressSelector, { SavedAddress } from "@/components/checkout/SavedAddressSelector";
import PaymentMethodSelector, { PaymentMethod } from "@/components/checkout/PaymentMethodSelector";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import PincodeCheck from "@/components/checkout/PincodeCheck";
import { useCart } from "@/app/lib/context/CartContext";
import { useAuth } from "@/app/lib/context/AuthContext";
import { computeDelivery } from "@/app/lib/pricing";

const EMPTY_ADDRESS: ShippingAddress = {
  fullName: "",
  phone: "",
  email: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CheckoutSteps() {
  const router = useRouter();
  const { items, subtotal, clearCart, promoCode, hydrated } = useCart();
  const { user } = useAuth();

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [payment, setPayment] = useState<PaymentMethod>("upi");
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  const [previewDiscount, setPreviewDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [pincodeServiceable, setPincodeServiceable] = useState<boolean | null>(null);

  const delivery = computeDelivery(subtotal);
  const total = Math.max(subtotal + delivery - previewDiscount, 0);

  useEffect(() => {
    if (!user) {
      setLoadingAddresses(false);
      return;
    }
    fetch(`/api/addresses?userId=${user.id}`)
      .then((res) => res.json())
      .then((result) => {
        const addresses: SavedAddress[] = result.data ?? [];
        setSavedAddresses(addresses);
        if (addresses.length > 0) setSelectedAddressId(addresses[0]._id);
      })
      .finally(() => setLoadingAddresses(false));
  }, [user]);

  useEffect(() => {
    if (selectedAddressId === "new") {
      setShippingAddress(EMPTY_ADDRESS);
      return;
    }
    const match = savedAddresses.find((a) => a._id === selectedAddressId);
    if (match) {
      setShippingAddress({
        fullName: match.fullName,
        phone: match.phone,
        email: match.email,
        addressLine: match.addressLine,
        city: match.city,
        state: match.state,
        pincode: match.pincode,
      });
      setErrors({});
    }
  }, [selectedAddressId, savedAddresses]);

  useEffect(() => {
    if (!hydrated || !promoCode || subtotal === 0) {
      setPreviewDiscount(0);
      setPromoMessage("");
      return;
    }
    fetch("/api/promo/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoCode, subtotal }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPreviewDiscount(data.data.discount);
          setPromoMessage(`${promoCode} applied`);
        } else {
          setPreviewDiscount(0);
          setPromoMessage(data.message ?? "coupon no longer valid");
        }
      })
      .catch(() => {
        setPreviewDiscount(0);
        setPromoMessage("");
      });
  }, [hydrated, promoCode, subtotal]);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center px-6 py-24">
        <p className="text-sm text-charcoal/55">loading your bag...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-24 text-center">
        <p className="font-serif text-xl font-medium text-charcoal">Your bag is empty</p>
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
    if (!shippingAddress.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email))
      next.email = "enter a valid email address";
    if (!shippingAddress.addressLine) next.addressLine = "required";
    if (!shippingAddress.city) next.city = "required";
    if (!shippingAddress.state) next.state = "required";
    if (!shippingAddress.pincode || shippingAddress.pincode.length !== 6) next.pincode = "enter a valid 6-digit pincode";
    else if (pincodeServiceable === false) next.pincode = "we don't deliver to this pincode yet";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goToConfirmation = (orderId: string) => {
    clearCart();
    router.push(`/checkout/success?orderId=${orderId}`);
  };

  const cartItemsForApi = () =>
    items.map((i) => ({
      productId: i.id,
      quantity: i.quantity,
      size: (i as any).size,
      color: (i as any).color,
    }));

  const handlePlaceOrder = async () => {
    setOrderError("");
    if (!validate()) return;

    if (payment === "cod") {
      setPlacing(true);
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            items: cartItemsForApi(),
            shippingAddress,
            promoCode: promoCode ?? undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "failed to place order");
        goToConfirmation(data.data._id);
      } catch (err) {
        setOrderError(err instanceof Error ? err.message : "something went wrong while placing your order.");
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
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          items: cartItemsForApi(),
          shippingAddress,
          promoCode: promoCode ?? undefined,
        }),
      });

      const data = await res.json();
      console.log("Create order response:", data);
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create Razorpay order");
      }

      const appOrderId = data.appOrderId;

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
          email: shippingAddress.email,
        },
        theme: { color: "#e0629b" },

        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                appOrderId,
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.verified) {
              throw new Error(verifyData.message || "Payment verification failed");
            }

            goToConfirmation(verifyData.data._id);
          } catch (err) {
            console.error(err);
            setOrderError("Payment was successful but verification failed.");
          } finally {
            setPlacing(false);
          }
        },

        modal: {
          ondismiss: () => setPlacing(false),
        },
      };

      const razorpay = new (window as any).Razorpay(options);

      razorpay.on("payment.failed", function (response: any) {
        console.error("Payment Failed:", response);
        setOrderError(response.error?.description || "Payment failed. Please try again.");
        setPlacing(false);
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      setOrderError(err instanceof Error ? err.message : "Something went wrong while starting the payment.");
      setPlacing(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-7 flex justify-center gap-6 text-lg">
          <Link href="/cart" className="text-pink hover:underline">1. Bag</Link>
          <span className="font-semibold text-pink">2. Checkout</span>
          <span className="text-charcoal/40">3. Done</span>
        </div>

        {orderError && (
          <p className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-2.5 text-center text-sm text-red-700">
            {orderError}
          </p>
        )}

        {promoCode && (
          <p
            className={`mb-5 rounded px-4 py-2.5 text-center text-sm ${
              previewDiscount > 0
                ? "border border-pink/40 bg-pink/5 text-pink"
                : "border border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            {promoMessage}
          </p>
        )}

        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-8">
            {loadingAddresses ? (
              <p className="text-sm text-charcoal/55">loading your addresses...</p>
            ) : savedAddresses.length > 0 ? (
              <>
                <SavedAddressSelector
                  addresses={savedAddresses}
                  selectedId={selectedAddressId}
                  onSelect={setSelectedAddressId}
                />
                {selectedAddressId === "new" && (
                  <div>
                    <ShippingForm value={shippingAddress} onChange={setShippingAddress} errors={errors} />
                    <PincodeCheck
                      pincode={shippingAddress.pincode}
                      itemCount={items.reduce((sum, i) => sum + i.quantity, 0)}
                      cod={payment === "cod"}
                      onServiceabilityChange={setPincodeServiceable}
                    />
                  </div>
                )}
              </>
            ) : (
              <div>
                <ShippingForm value={shippingAddress} onChange={setShippingAddress} errors={errors} />
                <PincodeCheck
                  pincode={shippingAddress.pincode}
                  itemCount={items.reduce((sum, i) => sum + i.quantity, 0)}
                  cod={payment === "cod"}
                  onServiceabilityChange={setPincodeServiceable}
                />
              </div>
            )}

            <PaymentMethodSelector value={payment} onChange={setPayment} />
          </div>

          <CheckoutSummary
            items={items}
            subtotal={subtotal}
            delivery={delivery}
            discount={previewDiscount}
            total={total}
            onPlaceOrder={handlePlaceOrder}
            placing={placing}
          />
        </div>
      </div>
    </>
  );
}