import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import { createForwardOrder } from "@/app/lib/shiprocket/client";
import { computePackageWeightKg, DEFAULT_PACKAGE_DIMENSIONS_CM } from "@/app/lib/shiprocket/pricing";
import type { CreateForwardOrderPayload } from "@/app/lib/shiprocket/types";
import { buildForwardOrderPayload } from "@/app/lib/shiprocket/buildOrderPayload";
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

    if (order.shipment?.shiprocketShipmentId) {
      return NextResponse.json({
        success: true,
        alreadyCreated: true,
        data: {
          shiprocketOrderId: order.shipment.shiprocketOrderId,
          shiprocketShipmentId: order.shipment.shiprocketShipmentId,
        },
      });
    }

    if (order.paymentMethod !== "cod" && order.paymentStatus !== "PAID") {
      return NextResponse.json({ success: false, message: "this order has not been paid for yet" }, { status: 400 });
    }
    if (order.status === "Cancelled" || order.status === "Returned") {
      return NextResponse.json(
        { success: false, message: `cannot ship an order that is ${order.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION;
    if (!pickupLocation) {
      return NextResponse.json({ success: false, message: "pickup location is not configured" }, { status: 500 });
    }

    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const weightKg = computePackageWeightKg(totalQuantity);

   const payload = await buildForwardOrderPayload(order, pickupLocation, weightKg);

    const result = await createForwardOrder(payload);

    order.shipment = {
      ...order.shipment,
      shiprocketOrderId: result.order_id,
      shiprocketShipmentId: result.shipment_id,
      packageWeightKg: weightKg,
      ...(result.awb_code
        ? {
            awbCode: result.awb_code,
            courierId: result.courier_company_id ?? undefined,
            courierName: result.courier_name ?? undefined,
          }
        : {}),
    };
    await order.save();

    return NextResponse.json({
      success: true,
      data: {
        shiprocketOrderId: result.order_id,
        shiprocketShipmentId: result.shipment_id,
        awbCode: result.awb_code ?? null,
      },
    });
  } catch (error) {
    console.error("Create Shipment Error:", error);
    return NextResponse.json({ success: false, message: "failed to create shipment" }, { status: 500 });
  }
}