"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/app/lib/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";
import QuantityStepper from "@/components/ui/QuantityStepper";
import { useCart } from "@/app/lib/context/CartContext";
import { Truck, Wallet } from "lucide-react";

const formatINR = (value: number) => `₹${value.toLocaleString("en-IN")}`;

interface ProductInfoProps {
  product: Product;
  onSizeGuideClick: () => void;
}

export default function ProductInfo({ product, onSizeGuideClick }: ProductInfoProps) {
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
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : null;

  const requireSize = () => {
    if (!selectedSize) {
      setSizeError(true);
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!requireSize()) return;
    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor ?? "default"}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      size: selectedSize ?? undefined,
      color: selectedColor,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!requireSize()) return;
    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor ?? "default"}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      size: selectedSize ?? undefined,
      color: selectedColor,
      quantity,
    });
    router.push("/checkout");
  };

  return (
    <div>
      {product.isBestseller && <Badge variant="neutral">bestseller</Badge>}

      <h1 className="mt-2 font-serif text-2xl font-medium text-charcoal capitalize">
        {product.name}
      </h1>

      <div className="mt-2">
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
      </div>

      {/* price */}
      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-2xl font-medium text-charcoal">
          {formatINR(product.price)}
        </span>
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

      {/* color */}
      {product.colors && product.colors.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-charcoal">
            color{selectedColor ? ` — ${selectedColor}` : ""}
          </p>
          <div className="flex gap-2">
            {product.colors.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Select color ${color}`}
                onClick={() => setSelectedColor(color)}
                style={{ backgroundColor: color }}
                className={`h-8 w-8 rounded-full border-2 ${
                  selectedColor === color ? "border-pink" : "border-charcoal/20"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* size */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-charcoal">Select size</p>
            <button
              type="button"
              onClick={onSizeGuideClick}
              className="text-md text-pink hover:underline"
            >
                Size chart
            </button>
          </div>
          <div className="flex gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setSelectedSize(size);
                  setSizeError(false);
                }}
                className={`flex h-10 w-11 items-center justify-center rounded border text-sm ${
                  selectedSize === size
                    ? "border-pink bg-charcoal text-pink font-medium"
                    : "border-charcoal text-charcoal"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          {sizeError && (
            <p className="mt-1.5 text-xs text-red-600">
              Please select a size before continuing
            </p>
          )}
        </div>
      )}

      {/* quantity */}
      <div className="mt-6">
        <p className="mb-2 text-sm font-medium text-charcoal">Quantity</p>
        <QuantityStepper quantity={quantity} onChange={setQuantity} />
      </div>

      {/* CTAs */}
      <div className="mt-6 flex gap-3">
        <Button variant="primary" fullWidth onClick={handleAddToCart}>
          {added ? "Added to bag ✓" : "Add to bag"}
        </Button>
      </div>
      <Button variant="secondary" fullWidth className="mt-3" onClick={handleBuyNow}>
        Buy now
      </Button>

      {/* delivery check */}
      <div className="mt-6 border-t border-charcoal/15 pt-5">
        <p className="mb-2 text-sm font-medium text-charcoal">Check delivery</p>
        <div className="flex max-w-xs gap-2">
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="Enter pincode"
            maxLength={6}
            className="h-10 flex-1 rounded border border-charcoal bg-ivory px-3 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-pink"
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
          <div className="mt-3 space-y-1.5 text-xs text-charcoal/60">
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