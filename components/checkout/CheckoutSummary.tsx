import { Lock } from "lucide-react";
import Button from "@/components/ui/Button";
import { CartItem } from "@/app/lib/types";

const formatINR = (v: number) => `₹${v.toLocaleString("en-IN")}`;

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
  onPlaceOrder: () => void;
  placing: boolean;
}

export default function CheckoutSummary({
  items,
  subtotal,
  onPlaceOrder,
  placing,
}: CheckoutSummaryProps) {
  const delivery = subtotal >= 999 ? 0 : 79;
  const total = subtotal + delivery;

  return (
    <div className="rounded-card bg-charcoal p-6">
      <p className="mb-3.5 text-sm font-medium text-ivory">order summary</p>
      <div className="mb-4 space-y-1.5">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-xs text-ivory/70">
            <span>
              {item.name} x{item.quantity}
            </span>
            <span>{formatINR(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-ivory/15 pt-3.5 text-sm text-ivory/75">
        <div className="flex justify-between">
          <span>subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>delivery</span>
          <span className={delivery === 0 ? "text-pink" : ""}>
            {delivery === 0 ? "free" : formatINR(delivery)}
          </span>
        </div>
      </div>

      <div className="mt-3.5 flex justify-between border-t border-ivory/15 pt-3.5 text-base font-medium text-ivory">
        <span>total</span>
        <span>{formatINR(total)}</span>
      </div>

      <Button
        variant="primary"
        fullWidth
        className="mt-5"
        onClick={onPlaceOrder}
        disabled={placing || items.length === 0}
      >
        {placing ? "placing order..." : "place order"}
      </Button>
      <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-ivory/50">
        <Lock size={12} /> secure checkout
      </p>
    </div>
  );
}