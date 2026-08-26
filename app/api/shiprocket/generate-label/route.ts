import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import { generateLabel } from "@/app/lib/shiprocket/client";

// POST /api/shiprocket/generate-label
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

    const result = await generateLabel([order.shipment.shiprocketShipmentId]);

    if (!result.label_created || !result.label_url) {
      return NextResponse.json({ success: false, message: "label could not be generated yet — try again shortly" }, { status: 502 });
    }

    order.shipment.labelUrl = result.label_url;
    await order.save();

    return NextResponse.json({ success: true, labelUrl: result.label_url });
  } catch (error) {
    console.error("Generate Label Error:", error);
    return NextResponse.json({ success: false, message: "failed to generate label" }, { status: 500 });
  }
}