import crypto from "crypto";
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import PromoCode from "@/app/models/Promocode";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { appOrderId, order_id, payment_id, signature } = await req.json();

    if (!appOrderId || !order_id || !payment_id || !signature) {
      return NextResponse.json(
        { success: false, verified: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const dbOrder = await Order.findById(appOrderId);
    if (!dbOrder || dbOrder.razorpayOrderId !== order_id) {
      return NextResponse.json(
        { success: false, verified: false, message: "order not found" },
        { status: 404 }
      );
    }

    // Already processed (duplicate webhook / client retry) — don't double-handle.
    if (dbOrder.paymentStatus === "PAID") {
      return NextResponse.json({ success: true, verified: true, data: dbOrder });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${order_id}|${payment_id}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      dbOrder.paymentStatus = "FAILED";
      await dbOrder.save();
      if (dbOrder.promoCode) await PromoCode.release(dbOrder.promoCode); // give the coupon slot back
      return NextResponse.json(
        { success: false, verified: false, message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // ✅ Payment is genuine
    dbOrder.paymentStatus = "PAID";
    dbOrder.razorpayPaymentId = payment_id;
    await dbOrder.save();
    // usedCount was already incremented atomically in create-order via
    // PromoCode.reserve — nothing to do here for the promo on success.

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Payment verified successfully",
      data: dbOrder,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return NextResponse.json(
      { success: false, verified: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}