import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import { assignAwb } from "@/app/lib/shiprocket/client";

// POST /api/shiprocket/assign-courier
// body: { orderId: string, courierId: number }
//
// Requires create-shipment to have already run (needs shiprocketShipmentId).
// On success, marks the order "In Transit" and records the AWB.
//
// NOTE: no admin-auth check yet — same gap as the other admin routes.
export async function POST(req: Request) {
  try {
    await connectDB();
    const { orderId, courierId } = await req.json();

    if (!orderId || !courierId) {
      return NextResponse.json({ success: false, message: "orderId and courierId are required" }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "order not found" }, { status: 404 });
    }

    if (!order.shipment?.shiprocketShipmentId) {
      return NextResponse.json(
        { success: false, message: "this order has not been pushed to Shiprocket yet — create the shipment first" },
        { status: 400 }
      );
    }

    if (order.shipment.awbCode) {
      return NextResponse.json(
        { success: false, message: `this order is already assigned to ${order.shipment.courierName} (AWB ${order.shipment.awbCode})` },
        { status: 400 }
      );
    }

    const result = await assignAwb({
      shipmentId: order.shipment.shiprocketShipmentId,
      courierId: Number(courierId),
    });

    if (result.awb_assign_status !== 1) {
      return NextResponse.json({ success: false, message: "courier failed to accept the assignment" }, { status: 502 });
    }

    const { awb_code, courier_name, courier_company_id } = result.response.data;
    const now = new Date();

    order.shipment.awbCode = awb_code;
    order.shipment.courierId = courier_company_id;
    order.shipment.courierName = courier_name;
    order.shipment.shippedAt = now;
    order.shipment.currentStatus = "AWB Assigned";
    order.shipment.statusHistory = [
      ...(order.shipment.statusHistory ?? []),
      { status: "AWB Assigned", activity: `Assigned to ${courier_name}`, statusDate: now },
    ];
    order.status = "In Transit";
    await order.save();

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Assign Courier Error:", error);
    return NextResponse.json({ success: false, message: "failed to assign courier" }, { status: 500 });
  }
}