import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import { mapShiprocketStatusToOrderStatus } from "@/app/lib/shiprocket/statusmap";

// Shiprocket's actual webhook payload shape varies slightly by event type;
// these are the fields we actually read. `awb` is how we find the order —
// Shiprocket doesn't reliably echo back our own order_id on every event.
interface ShiprocketWebhookPayload {
  awb: string;
  current_status: string; // e.g. "Delivered", "Shipped", "Out for Delivery"
  current_status_id?: number;
  order_id?: string; // Shiprocket's internal order id, not ours
  etd?: string;
  scans?: Array<{ date: string; activity: string; location?: string; "sr-status-label"?: string }>;
}

export async function POST(req: Request) {
  try {
    // Verify this actually came from Shiprocket before touching the DB.
    // NOTE: confirm the exact header name Shiprocket's dashboard shows for
    // your webhook config — some versions use a different header. This is
    // the one line to change if theirs differs from x-api-key.
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
      // Ack with 200 anyway — returning an error here just makes Shiprocket
      // retry a payload shape that will never become valid.
      return NextResponse.json({ success: true, ignored: "missing awb or current_status" });
    }

    const order = await Order.findOne({ "shipment.awbCode": body.awb });
    if (!order) {
      // Don't 404/500 — Shiprocket will retry, and we may just not have
      // this AWB yet (e.g. webhook arrived before assign-courier's own
      // save finished). 200-ack so it doesn't retry-storm us forever;
      // log it so genuinely orphaned AWBs are visible.
      console.warn(`Shiprocket webhook: no order found for AWB ${body.awb}`);
      return NextResponse.json({ success: true, ignored: "no matching order" });
    }

    const eventDate = body.scans?.[body.scans.length - 1]?.date
      ? new Date(body.scans[body.scans.length - 1].date)
      : new Date();

    // Idempotency: Shiprocket can and does resend the same event (retries,
    // duplicate triggers). Skip appending if we already have this exact
    // status recorded as the most recent history entry.
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
      // Same COD-cash-collected-at-delivery fix as the admin PATCH route.
      if (mappedStatus === "Delivered" && order.paymentMethod === "cod" && order.paymentStatus === "PENDING") {
        order.paymentStatus = "PAID";
      }
    }

    await order.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Shiprocket Webhook Error:", error);
    // Still 200 — a 500 here just triggers Shiprocket's retry logic on an
    // event that already failed once; better to log and investigate than
    // let it retry-storm. Only genuinely change this if you want retries.
    return NextResponse.json({ success: false, message: "internal error, logged" }, { status: 200 });
  }
}