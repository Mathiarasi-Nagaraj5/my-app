import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import { generateLabel } from "@/app/lib/shiprocket/client";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { orderIds } = await req.json();

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ success: false, message: "orderIds is required" }, { status: 400 });
    }

    const orders = await Order.find({ _id: { $in: orderIds } });

    const labels: Record<string, string> = {};
    const failed: { orderNumber: string; error: string }[] = [];
    const shipmentIds: number[] = [];

    // 1. generate + save a label for each order that doesn't have one (one at a time)
    for (const order of orders) {
      const shipmentId = Number(order.shipment?.shiprocketShipmentId);
      if (!Number.isFinite(shipmentId) || shipmentId <= 0) {
        failed.push({ orderNumber: order.orderNumber, error: "not shipped yet" });
        continue;
      }
      shipmentIds.push(shipmentId);

      if (order.shipment?.labelUrl) continue; // already has one

      try {
        const result = await generateLabel([shipmentId]);
        if (!result.label_created || !result.label_url) {
          failed.push({ orderNumber: order.orderNumber, error: "label not ready yet, try again shortly" });
          continue;
        }
        order.shipment!.labelUrl = result.label_url;
        await order.save();
        labels[String(order._id)] = result.label_url;
      } catch (e) {
        failed.push({
          orderNumber: order.orderNumber,
          error: e instanceof Error ? e.message : "failed",
        });
      }
    }

    if (shipmentIds.length === 0) {
      return NextResponse.json({ success: false, message: "none of the selected orders are shipped yet" }, { status: 400 });
    }

        // 2. one combined PDF link for printing all of them together
    let combinedUrl: string | null = null;
if (shipmentIds.length === 1 && Object.values(labels).length === 1) {
  combinedUrl = Object.values(labels)[0];
} else {
  try {
    const combined = await generateLabel(shipmentIds);
    if (combined.label_created && combined.label_url) combinedUrl = combined.label_url;
  } catch {}
}

   

    return NextResponse.json({ success: true, labels, combinedUrl, failed });
  } catch (error) {
    console.error("Bulk Label Error:", error);
    return NextResponse.json({ success: false, message: "failed to generate labels" }, { status: 500 });
  }
}