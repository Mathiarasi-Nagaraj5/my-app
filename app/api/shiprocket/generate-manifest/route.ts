import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import { generateManifest } from "@/app/lib/shiprocket/client";

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

    const result = await generateManifest([order.shipment.shiprocketShipmentId]);

    if (result.status !== 1 || !result.manifest_url) {
      return NextResponse.json({ success: false, message: "manifest could not be generated" }, { status: 502 });
    }

    order.shipment.manifestUrl = result.manifest_url;
    await order.save();

    return NextResponse.json({ success: true, manifestUrl: result.manifest_url });
  } catch (error) {
    console.error("Generate Manifest Error:", error);
    return NextResponse.json({ success: false, message: "failed to generate manifest" }, { status: 500 });
  }
}