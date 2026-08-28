import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import ReturnRequest from "@/app/models/ReturnRequest";
import Order from "@/app/models/Order";
import { sendRefundConfirmationEmail } from "@/app/lib/email/send";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const note: string | undefined = body?.note;

    const returnRequest = await ReturnRequest.findById(id);
    if (!returnRequest) {
      return NextResponse.json({ success: false, message: "return request not found" }, { status: 404 });
    }
    if (returnRequest.status !== "Accepted") {
      return NextResponse.json({ success: false, message: "return must be accepted first" }, { status: 400 });
    }
    if (returnRequest.refundMethod !== "manual") {
      return NextResponse.json(
        { success: false, message: "this return's refund is not a manual refund" },
        { status: 400 }
      );
    }
    if (returnRequest.refundStatus === "Completed") {
      return NextResponse.json({ success: false, message: "already marked as refunded" }, { status: 400 });
    }

    const order = await Order.findById(returnRequest.orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "the underlying order no longer exists" }, { status: 404 });
    }

    const refundedAt = new Date();
    returnRequest.refundStatus = "Completed";
    returnRequest.refund = { amount: order.total, refundedAt, note: note?.trim() };
    await returnRequest.save();

    order.paymentStatus = "REFUNDED";
    order.refund = { amount: order.total, refundedAt };
    await order.save();

    await sendRefundConfirmationEmail(order, order.total);

    return NextResponse.json({ success: true, data: returnRequest });
  } catch (error) {
    console.error("Mark Refunded Error:", error);
    return NextResponse.json({ success: false, message: "failed to mark as refunded" }, { status: 500 });
  }
}