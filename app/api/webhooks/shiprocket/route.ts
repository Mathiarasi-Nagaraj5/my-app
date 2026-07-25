import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";

const STATUS_MAP: Record<string, string> = {
  "OUT FOR DELIVERY": "in transit",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RTO: "cancelled",
};

export async function POST(req: Request) {
  try {
    await connectDB();

    // TODO: Shiprocket lets you set a webhook secret/token in their
    // dashboard — verify it here before trusting this request.

    const body = await req.json();
    const awbCode = body.awb;
    const shiprocketStatus = body.current_status;

    if (!awbCode || !shiprocketStatus) {
      return NextResponse.json({ error: "missing awb or status" }, { status: 400 });
    }

    const mappedStatus = STATUS_MAP[shiprocketStatus.toUpperCase()];
    if (!mappedStatus) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const order = await Order.findOneAndUpdate(
      { "shipment.awbCode": awbCode },
      { status: mappedStatus },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ error: "no matching order for this AWB" }, { status: 404 });
    }

    return NextResponse.json({ received: true, orderNumber: order.orderNumber });
  } catch (error) {
    console.error("shiprocket webhook error:", error);
    return NextResponse.json({ error: "webhook processing failed" }, { status: 500 });
  }
}