import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import PromoCode from "@/app/models/Promocode";

interface Params {
  params: { id: string };
}

// PATCH /api/promo/[id] -> partial update (e.g. { isActive: false })
export async function PATCH(req: Request, { params }: Params) {
  try {
    await connectDB();

    const body = await req.json();
    const promo = await PromoCode.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!promo) {
      return NextResponse.json(
        { success: false, message: "promo code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: promo });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update promo code" },
      { status: 500 }
    );
  }
}

// DELETE /api/promo/[id]
export async function DELETE(_req: Request, { params }: Params) {
  try {
    await connectDB();

    const promo = await PromoCode.findByIdAndDelete(params.id);

    if (!promo) {
      return NextResponse.json(
        { success: false, message: "promo code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: promo });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to delete promo code" },
      { status: 500 }
    );
  }
}