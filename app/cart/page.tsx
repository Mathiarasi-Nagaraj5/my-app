"use client";

import Link from "next/link";
import CartItemRow from "@/components/cart/CartItemRow";
import OrderSummary from "@/components/cart/OrderSummary";
import Button from "@/components/ui/Button";
import { useCart } from "@/app/lib/context/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-24 text-center">
        <p className="font-serif text-xl font-medium text-charcoal">
          Your bag is empty
        </p>
        <p className="mt-2 text-sm text-charcoal/60">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link href="/shop" className="mt-6">
          <Button variant="primary">Start Shopping !</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-6 font-serif text-2xl font-medium text-charcoal">
        Your bag ({items.length} {items.length === 1 ? "item" : "items"})
      </h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.6fr_1fr]">
        <div>
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onQuantityChange={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        <OrderSummary subtotal={subtotal} itemCount={items.length} />
      </div>
    </div>
  );
}