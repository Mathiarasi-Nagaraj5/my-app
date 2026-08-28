import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import ReturnRequest from "@/app/models/ReturnRequest";
import Order from "@/app/models/Order";
import { createReturnOrder } from "@/app/lib/shiprocket/client";
import { DEFAULT_PACKAGE_DIMENSIONS_CM, computePackageWeightKg } from "@/app/lib/shiprocket/pricing";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;

    const returnRequest = await ReturnRequest.findById(id);
    if (!returnRequest) {
      return NextResponse.json({ success: false, message: "return request not found" }, { status: 404 });
    }
    if (returnRequest.status !== "Accepted") {
      return NextResponse.json({ success: false, message: "return must be accepted first" }, { status: 400 });
    }
    if (returnRequest.reverseShipment?.shiprocketOrderId) {
      return NextResponse.json({ success: false, message: "reverse pickup was already scheduled" }, { status: 400 });
    }

    const order = await Order.findById(returnRequest.orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "the underlying order no longer exists" }, { status: 404 });
    }

    const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE;
    if (!pickupPincode) {
      return NextResponse.json({ success: false, message: "reverse pickup not configured" }, { status: 500 });
    }

    try {
      const totalQuantity = order.items.reduce((sum, i) => sum + i.quantity, 0);
      const result = await createReturnOrder({
        order_id: `${order.orderNumber}-RET-${Date.now()}`,
        order_date: new Date().toISOString().slice(0, 16).replace("T", " "),
        pickup_customer_name: order.shippingAddress.fullName,
        pickup_address: order.shippingAddress.addressLine,
        pickup_city: order.shippingAddress.city,
        pickup_state: order.shippingAddress.state,
        pickup_country: "India",
        pickup_pincode: order.shippingAddress.pincode,
        pickup_email: order.shippingAddress.email,
        pickup_phone: order.shippingAddress.phone,
        shipping_customer_name: "Elite Soul Warehouse",
        shipping_address: "Warehouse address on file with Shiprocket",
        shipping_city: "Tiruppur",
        shipping_state: "Tamil Nadu",
        shipping_country: "India",
        shipping_pincode: pickupPincode,
        shipping_email: "returns@example.com",
        shipping_phone: "0000000000",
        order_items: order.items.map((item) => ({
          name: item.name,
          sku: item.productId,
          units: item.quantity,
          selling_price: item.price,
        })),
        payment_method: "Prepaid",
        sub_total: order.total,
        length: DEFAULT_PACKAGE_DIMENSIONS_CM.length,
        breadth: DEFAULT_PACKAGE_DIMENSIONS_CM.breadth,
        height: DEFAULT_PACKAGE_DIMENSIONS_CM.height,
        weight: computePackageWeightKg(totalQuantity),
      });

      returnRequest.reverseShipment = { shiprocketOrderId: result.order_id, scheduledAt: new Date() };
    } catch (err) {
      returnRequest.reverseShipment = {
        failedReason: err instanceof Error ? err.message : "unknown error",
      };
    }

    await returnRequest.save();
    return NextResponse.json({ success: true, data: returnRequest });
  } catch (error) {
    console.error("Retry Pickup Error:", error);
    return NextResponse.json({ success: false, message: "failed to retry pickup" }, { status: 500 });
  }
}