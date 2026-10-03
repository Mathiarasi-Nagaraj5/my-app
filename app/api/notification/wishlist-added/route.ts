import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { sendWhatsAppTemplate, toWhatsAppNumber } from "@/app/lib/whatsapp/client";

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

    // Template e.g. "wishlist_item_added": "Hi {{1}}, you added {{2}} to
    // your wishlist! We'll let you know if it goes on sale."
    await sendWhatsAppTemplate({
      to: toWhatsAppNumber(user.phone),
      templateName: "wishlist_item_added",
      bodyParams: [user.fullName, productName],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wishlist Added Notification Error:", error);
    return NextResponse.json({ success: false, message: "failed to send notification" }, { status: 500 });
  }
}