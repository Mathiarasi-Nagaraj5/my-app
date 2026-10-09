"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, Wallet, ShoppingBag, Zap, MessageCircle } from "lucide-react";
import { Product } from "@/app/lib/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";
import QuantityStepper from "@/components/ui/QuantityStepper";
import { useCart } from "@/app/lib/context/CartContext";
import { buildWhatsAppLink } from "@/app/lib/contact";
import { getColorName } from "@/app/lib/colorNames"; // adjust path to wherever you put colorNames.ts

const formatINR = (value: number) => `₹${value.toLocaleString("en-IN")}`;

interface ProductInfoProps {
  product: Product;
  onSizeGuideClick: () => void;
  whatsappNumber: string;
}

export default function ProductInfo({
  product,
  onSizeGuideClick,
  whatsappNumber,
}: ProductInfoProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [deliveryChecked, setDeliveryChecked] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const requireSize = () => {
    if (!selectedSize) {
      setSizeError(true);
      return false;
    }
    return true;
  };

  // same id for add-to-cart and buy-now, so different sizes/colours stay separate lines in the cart
  const buildCartItem = () => ({
    id: `${product._id}-${selectedSize}-${selectedColor ?? "default"}`,
    productId: product._id,
    slug: product.slug,
    name: product.name,
    imageUrls: product.imageUrls,
    price: product.price,
    size: selectedSize ?? undefined,
    color: selectedColor,
    quantity,
  });

  const handleAddToCart = () => {
    if (!requireSize()) return;
    addItem(buildCartItem());
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!requireSize()) return;
    addItem(buildCartItem());
    router.push("/checkout");
  };

  const handleCustomizeRequest = () => {
    const lines = [
      `Hi! I'd like to ask about customizing this product:`,
      ``,
      `${product.name}`,
      selectedColor ? `Color: ${getColorName(selectedColor)}` : null,
      selectedSize ? `Size: ${selectedSize}` : null,
      typeof window !== "undefined" ? window.location.href : "",
      ``,
      `I'm interested in custom fit / size / embroidery options.`,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(buildWhatsAppLink(lines, whatsappNumber), "_blank");
  };

  return (
    <div>
      {product.isBestseller && <Badge variant="brand">Bestseller</Badge>}

      <h1 className="mt-2 font-serif text-3xl font-medium capitalize leading-tight text-charcoal">
        {product.name}
      </h1>

      <div className="mt-2">
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
      </div>

      {/* price */}
      <div className="mt-5 flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-semibold text-charcoal">{formatINR(product.price)}</span>
        {product.originalPrice && (
          <>
            <span className="text-base text-charcoal/40 line-through">
              {formatINR(product.originalPrice)}
            </span>
            <Badge variant="brand">{discountPercent}% off</Badge>
          </>
        )}
      </div>
      <p className="mt-1 text-xs text-charcoal/55">inclusive of all taxes</p>

      <div className="my-5 h-px bg-gradient-to-r from-pink/60 via-pink/20 to-transparent" />

      {/* color */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium text-charcoal">
            Color
            {selectedColor && (
              <span className="font-normal text-charcoal/60"> — {getColorName(selectedColor)}</span>
            )}
          </p>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Select color ${getColorName(color)}`}
                aria-pressed={selectedColor === color}
                onClick={() => setSelectedColor(color)}
                style={{ backgroundColor: color }}
                className={`h-9 w-9 rounded-full border border-charcoal/20 transition-all duration-200 hover:scale-110 ${
                  selectedColor === color
                    ? "ring-2 ring-pink ring-offset-2 ring-offset-ivory"
                    : ""
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* size */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-charcoal">Select size</p>
            <button
              type="button"
              onClick={onSizeGuideClick}
              className="text-sm text-pink underline-offset-4 hover:underline"
            >
              Size chart
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={selectedSize === size}
                onClick={() => {
                  setSelectedSize(size);
                  setSizeError(false);
                }}
                className={`flex h-10 min-w-11 items-center justify-center rounded-md border px-3 text-sm transition-all duration-200 ${
                  selectedSize === size
                    ? "border-pink bg-pink font-medium text-white shadow-[0_4px_14px_rgba(236,72,153,0.4)]"
                    : "border-charcoal/30 text-charcoal hover:border-pink hover:text-pink"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          {sizeError && (
            <p className="mt-2 text-xs text-red-600">Please select a size before continuing</p>
          )}
        </div>
      )}

      {/* quantity */}
      <div className="mt-5 flex items-center gap-4">
        <p className="text-sm font-medium text-charcoal">Quantity</p>
        <QuantityStepper quantity={quantity} onChange={setQuantity} />
      </div>

      {/* CTAs */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button variant="primary" fullWidth onClick={handleAddToCart}>
          {added ? (
            <>Added to bag ✓</>
          ) : (
            <>
              <ShoppingBag size={18} className="mr-2 inline" />
              Add to bag
            </>
          )}
        </Button>

        <Button variant="secondary" fullWidth onClick={handleBuyNow}>
          <Zap size={18} className="mr-2 inline" />
          Buy now
        </Button>
      </div>

      <Button variant="customize" fullWidth className="mt-3" onClick={handleCustomizeRequest}>
        <MessageCircle size={18} className="mr-2 inline" />
        Customize on WhatsApp
      </Button>

      {/* description */}
      {product.description && (
        <p className="mt-6 whitespace-pre-line border-t border-charcoal/10 pt-5 text-sm leading-relaxed text-charcoal/70">
          {product.description}
        </p>
      )}

      {/* delivery check */}
      <div className="mt-7 rounded-xl border border-charcoal/10 bg-white p-4 shadow-sm">
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-charcoal">
          <Truck size={16} className="text-pink" />
          Check delivery
        </p>
        <div className="flex max-w-xs gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, ""));
              setDeliveryChecked(false);
            }}
            placeholder="Enter pincode"
            maxLength={6}
            className="h-10 flex-1 rounded-md border border-charcoal/30 bg-ivory px-3 text-sm text-charcoal transition-colors focus:border-pink focus:outline-none focus:ring-1 focus:ring-pink"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeliveryChecked(pincode.length === 6)}
          >
            Check
          </Button>
        </div>
        {deliveryChecked && (
          <div className="mt-3 space-y-1.5 text-xs text-charcoal/70">
            <p className="flex items-center gap-1.5">
              <Truck size={14} className="text-pink" />
              Free delivery · Usually arrives in 4-6 days
            </p>
            <p className="flex items-center gap-1.5">
              <Wallet size={14} className="text-pink" />
              Cash on delivery available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}