import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import PromoCode from "@/app/models/Promocode";

// GET /api/promo -> all promo codes, newest first (admin table)
export async function GET() {
  try {
    await connectDB();

    const promos = await PromoCode.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: promos });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch promo codes" },
      { status: 500 }
    );
  }
}

// POST /api/promo -> create a new promo code
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const promo = await PromoCode.create({
      ...body,
      code: body.code?.trim().toUpperCase(),
    });

    return NextResponse.json({ success: true, data: promo }, { status: 201 });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && (err as { code?: number }).code === 11000) {
      return NextResponse.json(
        { success: false, message: "a promo code with this code already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create promo code" },
      { status: 500 }
    );
  }
}