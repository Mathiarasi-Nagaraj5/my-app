import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { sendWhatsAppTemplate, toWhatsAppNumber } from "@/app/lib/whatsapp/client";

// POST /api/notifications/cart-removed
// body: { userId: string, productName: string }
export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId, productName } = await req.json();
    if (!userId || !productName) {
      return NextResponse.json({ success: false, message: "missing required fields" }, { status: 400 });
    }

    const user = await User.findById(userId).select("phone fullName");
    if (!user?.phone) {
      return NextResponse.json({ success: true, skipped: "no phone on file" });
    }

    // Template name/content must already be approved in Meta Business
    // Manager — e.g. a template named "cart_item_removed" with body:
    // "Hi {{1}}, we noticed you removed {{2}} from your cart. It's still
    // available if you change your mind!"
    await sendWhatsAppTemplate({
      to: toWhatsAppNumber(user.phone),
      templateName: "cart_item_removed",
      bodyParams: [user.fullName, productName],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart Removed Notification Error:", error);
    return NextResponse.json({ success: false, message: "failed to send notification" }, { status: 500 });
  }
}