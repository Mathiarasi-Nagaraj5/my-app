import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import { getShiprocketToken, SHIPROCKET_BASE_URL } from "../../../../../lib/shiprocket/route";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "order not found" }, { status: 404 });
    }
    if (order.paymentStatus !== "PAID" && order.paymentMethod !== "cod") {
      return NextResponse.json(
        { error: "only paid orders (or COD orders) can be shipped" },
        { status: 400 }
      );
    }

    const token = await getShiprocketToken();

    const shipmentPayload = {
      order_id: order.orderNumber,
      order_date: order.createdAt.toISOString().slice(0, 10),
      pickup_location: "Primary",
      billing_customer_name: order.shippingAddress.fullName,
      billing_address: order.shippingAddress.addressLine,
      billing_city: order.shippingAddress.city,
      billing_state: order.shippingAddress.state,
      billing_pincode: order.shippingAddress.pincode,
      billing_country: "India",
      billing_phone: order.shippingAddress.phone,
      shipping_is_billing: true,
      order_items: order.items.map((item: any) => ({
        name: item.name,
        sku: item.productId,
        units: item.quantity,
        selling_price: item.price,
      })),
      payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
      sub_total: order.subtotal,
      length: 20,
      breadth: 15,
      height: 5,
      weight: 0.5,
    };

    const shipRes = await fetch(`${SHIPROCKET_BASE_URL}/orders/create/adhoc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(shipmentPayload),
    });

    if (!shipRes.ok) {
      const errorBody = await shipRes.text();
      console.error("Shiprocket create order failed:", errorBody);
      return NextResponse.json({ error: "failed to create shipment" }, { status: 502 });
    }

    const shipData = await shipRes.json();

    order.shipment = {
      shiprocketOrderId: shipData.order_id?.toString(),
      awbCode: shipData.awb_code ?? undefined,
      courierName: shipData.courier_name ?? undefined,
      trackingUrl: shipData.awb_code
        ? `https://shiprocket.co/tracking/${shipData.awb_code}`
        : undefined,
      shippedAt: new Date(),
    };
    order.status = "in transit";
    await order.save();

    return NextResponse.json({ success: true, shipment: order.shipment });
  } catch (error) {
    console.error("ship order error:", error);
    return NextResponse.json({ error: "failed to ship order" }, { status: 500 });
  }
}