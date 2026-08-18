import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import { previewPromo } from "@/app/lib/promo";

// POST /api/promo/validate
// body: { code: string, subtotal: number }
// Read-only preview only. Never increments usedCount — see PromoCode.reserve
// for the atomic claim that happens at actual order creation.
export async function POST(req: Request) {
  try {
    await connectDB();
    const { code, subtotal } = await req.json();

    if (!code || typeof subtotal !== "number") {
      return NextResponse.json(
        { success: false, message: "code and subtotal are required" },
        { status: 400 }
      );
    }

    const result = await previewPromo(code, subtotal);
    if (!result.ok) {
      return NextResponse.json({ success: false, message: result.message }, { status: result.status });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch {
    return NextResponse.json({ success: false, message: "failed to validate coupon" }, { status: 500 });
  }
}