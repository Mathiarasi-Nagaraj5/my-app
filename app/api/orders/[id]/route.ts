import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import Order from "../../../models/Order";
import { requireOwnerOrAdmin } from "@/app/lib/auth/requireOwnerorAdmin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }
     const ownerCheck = await requireOwnerOrAdmin(order.userId);
    if (!ownerCheck.ok) {
      return NextResponse.json({ success: false, message: ownerCheck.message }, { status: ownerCheck.status });
    }

    return NextResponse.json({ success: true, data: order });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch order" }, { status: 500 });
  }
}

const ALLOWED_STATUSES = ["Confirmed", "Out for Delivery", "Delivered", "Cancelled"] as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const update: Record<string, unknown> = {};

    if (body.status !== undefined) {
      if (!ALLOWED_STATUSES.includes(body.status)) {
        return NextResponse.json({ success: false, message: "invalid status" }, { status: 400 });
      }
      update.status = body.status;

      if (body.status === "Delivered") {
        update.deliveredAt = new Date();

        // COD cash is collected at the moment of delivery — mark it paid
        // here, since nothing else in the flow ever does for COD orders.
        const existing = await Order.findById(id).select("paymentMethod paymentStatus");
        if (existing?.paymentMethod === "cod" && existing.paymentStatus === "PENDING") {
          update.paymentStatus = "PAID";
        }
      }
    }

    if (body.shipment !== undefined) {
      update.shipment = body.shipment;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, message: "no valid fields to update" }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(id, update, { new: true, runValidators: true });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await Order.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Order deleted" });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete order" }, { status: 500 });
  }
}