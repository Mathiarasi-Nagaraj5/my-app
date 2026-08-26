import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import { requestPickup } from "@/app/lib/shiprocket/client";

// POST /api/shiprocket/schedule-pickup
// body: { orderId: string }
export async function POST(req: Request) {
  try {
    await connectDB();
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, message: "orderId is required" }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "order not found" }, { status: 404 });
    }
    if (!order.shipment?.shiprocketShipmentId) {
      return NextResponse.json(
        { success: false, message: "this order hasn't been shipped yet" },
        { status: 400 }
      );
    }
    if (order.shipment.pickupScheduledAt) {
      return NextResponse.json(
        { success: false, message: `pickup already scheduled for ${order.shipment.pickupScheduledAt.toLocaleDateString()}` },
        { status: 400 }
      );
    }

    const result = await requestPickup([order.shipment.shiprocketShipmentId]);

    if (result.pickup_status !== 1) {
      return NextResponse.json({ success: false, message: "courier could not schedule pickup" }, { status: 502 });
    }

    const scheduledDate = result.response.pickup_scheduled_date
      ? new Date(result.response.pickup_scheduled_date)
      : new Date();

    order.shipment.pickupScheduledAt = scheduledDate;
    await order.save();

    return NextResponse.json({ success: true, pickupScheduledAt: scheduledDate });
  } catch (error) {
    console.error("Schedule Pickup Error:", error);
    return NextResponse.json({ success: false, message: "failed to schedule pickup" }, { status: 500 });
  }
}