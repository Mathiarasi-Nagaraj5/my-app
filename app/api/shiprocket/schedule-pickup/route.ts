import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import { requestPickup } from "@/app/lib/shiprocket/client";
import { schedulePickupForOrder } from "@/app/lib/shiprocket/pickup";
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
      return NextResponse.json({ success: false, message: "this order hasn't been shipped yet" }, { status: 400 });
    }
        const result = await schedulePickupForOrder(order);
    if (!result.ok) {
      return NextResponse.json({ success: false, message: result.message }, { status: 502 });
    }
    return NextResponse.json({ success: true, pickupScheduledAt: result.pickupScheduledAt });
  } catch (error) {
    console.error("Schedule Pickup Error:", error);
    return NextResponse.json({ success: false, message: "failed to schedule pickup" }, { status: 500 });
  }
}