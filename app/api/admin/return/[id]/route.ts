import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/app/lib/mongodb";
import Return from "@/app/models/ReturnRequest";
import Order from "@/app/models/Order";
import { verifyAdminToken } from "@/app/lib/adminAuth";

function getToken(req: Request) {
  return req.headers.get("cookie")?.match(/admin_session=([^;]+)/)?.[1];
}

const razorpay = new Razorpay({
  key_id: process.env.NEXT_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminToken(getToken(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const { action } = await req.json(); // "approve" | "reject"

    const returnRequest = await Return.findById(id);
    if (!returnRequest) {
      return NextResponse.json({ error: "return request not found" }, { status: 404 });
    }
    if (returnRequest.status !== "requested") {
      return NextResponse.json(
        { error: "this return has already been processed" },
        { status: 400 }
      );
    }

    if (action === "reject") {
      returnRequest.status = "rejected";
      await returnRequest.save();
      return NextResponse.json(returnRequest);
    }

    if (action !== "approve") {
      return NextResponse.json({ error: "invalid action" }, { status: 400 });
    }

    // ── approving triggers the actual refund ──
    const order = await Order.findById(returnRequest.orderId);
    if (!order) {
      return NextResponse.json({ error: "original order not found" }, { status: 404 });
    }

    if (order.paymentMethod === "cod") {
      // COD orders were never charged online — nothing for Razorpay to
      // reverse. Mark as refunded so it's tracked, but the actual money
      // movement (bank transfer, UPI, etc.) happens manually outside this
      // system. TODO: replace with a real payout API if you want this
      // automated too.
      returnRequest.status = "refunded";
      returnRequest.refundedAt = new Date();
      await returnRequest.save();
      return NextResponse.json({
        ...returnRequest.toObject(),
        note: "COD order — refund must be processed manually (no online payment to reverse).",
      });
    }

    if (!order.razorpayPaymentId) {
      return NextResponse.json(
        { error: "no Razorpay payment ID found on this order — cannot process refund" },
        { status: 400 }
      );
    }

    try {
      const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
        amount: Math.round(returnRequest.amount * 100), // paise
      });

      returnRequest.status = "refunded";
      returnRequest.razorpayRefundId = refund.id;
      returnRequest.refundedAt = new Date();
      await returnRequest.save();

      return NextResponse.json(returnRequest);
    } catch (refundError) {
      console.error("Razorpay refund failed:", refundError);
      returnRequest.status = "approved"; // approved but refund failed — needs manual retry
      await returnRequest.save();
      return NextResponse.json(
        { error: "refund approved but Razorpay refund call failed — check logs and retry" },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("PATCH /api/admin/returns/[id] error:", error);
    return NextResponse.json({ error: "failed to process return" }, { status: 500 });
  }
}