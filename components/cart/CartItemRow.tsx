import Image from "next/image";
import Link from "next/link";
import { CartItem } from "../../app/lib/types";
import QuantityStepper from "@/components/ui/QuantityStepper";

const formatINR = (v: number) => `₹${v.toLocaleString("en-IN")}`;

interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItemRow({
  item,
  onQuantityChange,
  onRemove,
}: CartItemRowProps) {
  return (
    <div className="flex gap-4 border-b border-charcoal/15 py-4">
      <Link href={`/shop/${item.slug}`} className="relative h-[100px] w-20 flex-shrink-0 overflow-hidden rounded bg-charcoal">
        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="80px" />
      </Link>

      <div className="flex-1">
        <Link href={`/shop/${item.slug}`}>
          <p className="text-sm font-medium text-charcoal">{item.name}</p>
        </Link>
        <p className="mt-1 text-xs text-charcoal/55">
          {item.size && `size: ${item.size}`}
          {item.size && item.color && "  ·  "}
          {item.color && `color: ${item.color}`}
        </p>
        <div className="mt-2.5 flex items-center gap-3">
          <QuantityStepper
            quantity={item.quantity}
            onChange={(q) => onQuantityChange(item.id, q)}
          />
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="text-xs text-charcoal/50 underline hover:text-red-600"
          >
            remove
          </button>
        </div>
      </div>

      <p className="text-sm font-medium text-charcoal">
        {formatINR(item.price * item.quantity)}
      </p>
    </div>
  );
}