import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import PromoCode from "@/app/models/Promocode";

// POST /api/promo/validate
// body: { code: string, subtotal: number }
// Only checks validity + computes the discount. usedCount is incremented
// separately when the order is actually placed (see note at bottom).
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { code, subtotal } = body;

    if (!code || typeof subtotal !== "number") {
      return NextResponse.json(
        { success: false, message: "code and subtotal are required" },
        { status: 400 }
      );
    }

    const promo = await PromoCode.findOne({ code: code.trim().toUpperCase() });

    if (!promo) {
      return NextResponse.json(
        { success: false, message: "invalid coupon code" },
        { status: 404 }
      );
    }

    if (!promo.isActive) {
      return NextResponse.json(
        { success: false, message: "this coupon is no longer active" },
        { status: 400 }
      );
    }

    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: "this coupon has expired" },
        { status: 400 }
      );
    }

    if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) {
      return NextResponse.json(
        { success: false, message: "this coupon has reached its usage limit" },
        { status: 400 }
      );
    }

    if (subtotal < promo.minOrderValue) {
      return NextResponse.json(
        {
          success: false,
          message: `minimum order value for this coupon is ₹${promo.minOrderValue.toLocaleString("en-IN")}`,
        },
        { status: 400 }
      );
    }

    const discount =
      promo.discountType === "percentage"
        ? Math.round((subtotal * promo.discountValue) / 100)
        : Math.min(promo.discountValue, subtotal); // flat discount can't exceed subtotal

    return NextResponse.json({
      success: true,
      data: {
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discount,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "failed to validate coupon" },
      { status: 500 }
    );
  }
}

// NOTE: increment `usedCount` on the PromoCode when the order is actually
// created/confirmed (in your /api/orders POST handler), not here — otherwise
// someone could "burn" a limited-use coupon just by checking it without
// completing checkout. e.g.:
//   await PromoCode.updateOne({ code }, { $inc: { usedCount: 1 } });