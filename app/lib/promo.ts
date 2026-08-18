import PromoCode from "@/app/models/Promocode";

export interface PromoPreview {
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  discount: number;
}

export function computeDiscount(
  discountType: "percentage" | "flat",
  discountValue: number,
  subtotal: number
): number {
  return discountType === "percentage"
    ? Math.round((subtotal * discountValue) / 100)
    : Math.min(discountValue, subtotal);
}

/**
 * Read-only check — safe to call from the cart page or checkout preview.
 * Does NOT touch usedCount. Never treat this result as authorization to
 * charge a discounted amount — only PromoCode.reserve() at order creation
 * does that.
 */
export async function previewPromo(
  code: string,
  subtotal: number
): Promise<{ ok: true; data: PromoPreview } | { ok: false; message: string; status: number }> {
  const promo = await PromoCode.findOne({ code: code.trim().toUpperCase() });

  if (!promo) return { ok: false, message: "invalid coupon code", status: 404 };
  if (!promo.isActive) return { ok: false, message: "this coupon is no longer active", status: 400 };
  if (promo.expiresAt && promo.expiresAt < new Date())
    return { ok: false, message: "this coupon has expired", status: 400 };
  if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses)
    return { ok: false, message: "this coupon has reached its usage limit", status: 400 };
  if (subtotal < promo.minOrderValue)
    return {
      ok: false,
      message: `minimum order value for this coupon is ₹${promo.minOrderValue.toLocaleString("en-IN")}`,
      status: 400,
    };

  const discount = computeDiscount(promo.discountType, promo.discountValue, subtotal);

  return {
    ok: true,
    data: { code: promo.code, discountType: promo.discountType, discountValue: promo.discountValue, discount },
  };
}