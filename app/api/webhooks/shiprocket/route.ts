import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import { mapShiprocketStatusToOrderStatus } from "@/app/lib/shiprocket/statusmap";

interface ShiprocketWebhookPayload {
  awb: string;
  current_status: string;
  current_status_id?: number;
  order_id?: string;
  etd?: string;
  scans?: Array<{ date: string; activity: string; location?: string; "sr-status-label"?: string }>;
}

export async function POST(req: Request) {
  try {
    const receivedSecret = req.headers.get("x-api-key");
    const expectedSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;

    if (!expectedSecret) {
      console.error("SHIPROCKET_WEBHOOK_SECRET is not configured — rejecting all webhook calls.");
      return NextResponse.json({ success: false, message: "webhook not configured" }, { status: 500 });
    }
    if (!receivedSecret || receivedSecret !== expectedSecret) {
      return NextResponse.json({ success: false, message: "invalid webhook signature" }, { status: 401 });
    }

    await connectDB();
    const body: ShiprocketWebhookPayload = await req.json();

    if (!body.awb || !body.current_status) {
      return NextResponse.json({ success: true, ignored: "missing awb or current_status" });
    }

    const order = await Order.findOne({ "shipment.awbCode": body.awb });
    if (!order) {
      console.warn(`Shiprocket webhook: no order found for AWB ${body.awb}`);
      return NextResponse.json({ success: true, ignored: "no matching order" });
    }

    const eventDate = body.scans?.[body.scans.length - 1]?.date
      ? new Date(body.scans[body.scans.length - 1].date)
      : new Date();

    const history = order.shipment?.statusHistory ?? [];
    const lastEntry = history[history.length - 1];
    const isDuplicate =
      lastEntry &&
      lastEntry.status === body.current_status &&
      lastEntry.statusDate.getTime() === eventDate.getTime();

    if (!isDuplicate) {
      history.push({
        status: body.current_status,
        activity: body.scans?.[body.scans.length - 1]?.activity,
        location: body.scans?.[body.scans.length - 1]?.location,
        statusDate: eventDate,
      });
    }

    order.shipment = {
      ...order.shipment,
      currentStatus: body.current_status,
      statusHistory: history,
    };

    const mappedStatus = mapShiprocketStatusToOrderStatus(body.current_status);
    if (mappedStatus) {
      order.status = mappedStatus;
      if (mappedStatus === "Delivered" && !order.deliveredAt) {
        order.deliveredAt = eventDate;
      }
      // COD cash is collected at delivery — mark paid, same fix as the
      // admin PATCH route.
      if (mappedStatus === "Delivered" && order.paymentMethod === "cod" && order.paymentStatus === "PENDING") {
        order.paymentStatus = "PAID";
      }
    }

    await order.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Shiprocket Webhook Error:", error);
    return NextResponse.json({ success: false, message: "internal error, logged" }, { status: 200 });
  }
}