import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { userId } = await req.json();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "order not found" }, { status: 404 });
    }

    // ownership check — a customer can only cancel their own order
    if (userId && order.userId && order.userId !== userId) {
      return NextResponse.json({ error: "not authorized to cancel this order" }, { status: 403 });
    }

    // only allow cancelling before it's shipped
    if (order.status !== "Confirmed") {
      return NextResponse.json(
        { error: "this order can no longer be cancelled — it has already been shipped or delivered" },
        { status: 400 }
      );
    }

    // if it was actually paid online, refund it
    if (order.paymentStatus === "PAID" && order.razorpayPaymentId) {
      try {
        await razorpay.payments.refund(order.razorpayPaymentId, {
          amount: Math.round(order.total * 100), // paise
        });
      } catch (refundError) {
        console.error("cancel-order refund failed:", refundError);
        return NextResponse.json(
          { error: "cancellation refund failed — please contact support" },
          { status: 502 }
        );
      }
    }
    // COD orders: nothing was charged, so nothing to refund

    order.status = "Cancelled";
    await order.save();

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error("POST /api/orders/[id]/cancel error:", error);
    return NextResponse.json({ error: "failed to cancel order" }, { status: 500 });
  }
}