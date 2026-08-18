import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import { checkServiceability, createForwardOrder, assignAwb } from "@/app/lib/shiprocket/client";
import { computePackageWeightKg, DEFAULT_PACKAGE_DIMENSIONS_CM } from "@/app/lib/shiprocket/pricing";
import type { CreateForwardOrderPayload } from "@/app/lib/shiprocket/types";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/admin/orders/[id]/ship
//
// Single-click ship: checks serviceability, auto-picks the cheapest
// serviceable courier, creates the Shiprocket order, assigns the AWB, and
// returns the resulting `shipment` object — matches OrderTable's existing
// contract exactly: { shipment: {...} } on success, { error: "..." } on
// failure (not the { success, data } shape used elsewhere, intentionally,
// to avoid touching the already-working button code).
//
// NOTE: no admin-auth check yet — same gap flagged on every other admin
// route so far. Add a requireAdmin() check here before this ships.
export async function POST(req: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "order not found" }, { status: 404 });
    }

    if (order.shipment?.awbCode) {
      return NextResponse.json(
        { error: `already shipped via ${order.shipment.courierName} (AWB ${order.shipment.awbCode})` },
        { status: 400 }
      );
    }
    if (order.status === "Cancelled" || order.status === "Returned") {
      return NextResponse.json(
        { error: `cannot ship an order that is ${order.status.toLowerCase()}` },
        { status: 400 }
      );
    }
    if (order.paymentMethod !== "cod" && order.paymentStatus !== "PAID") {
      return NextResponse.json({ error: "this order has not been paid for yet" }, { status: 400 });
    }

    const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE;
    const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION;
    if (!pickupPincode || !pickupLocation) {
      return NextResponse.json({ error: "shipping configuration is missing" }, { status: 500 });
    }

    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const weightKg = computePackageWeightKg(totalQuantity);
    const isCod = order.paymentMethod === "cod";

    // 1. Serviceability + pick the cheapest serviceable courier for this pincode.
    const serviceability = await checkServiceability({
      pickupPincode,
      deliveryPincode: order.shippingAddress.pincode,
      weightKg,
      cod: isCod,
    });

    const couriers = serviceability.data?.available_courier_companies ?? [];
    if (couriers.length === 0) {
      return NextResponse.json(
        { error: `no courier serves pincode ${order.shippingAddress.pincode} for this shipment` },
        { status: 400 }
      );
    }

    const cheapest = [...couriers].sort((a, b) => a.rate - b.rate)[0];
    const chosenCourierId = serviceability.data.recommended_courier_id ?? cheapest.courier_company_id;

    // 2. Create the Shiprocket order (skip if somehow already created without an AWB).
    let shiprocketOrderId = order.shipment?.shiprocketOrderId;
    let shiprocketShipmentId = order.shipment?.shiprocketShipmentId;

    if (!shiprocketShipmentId) {
      const nameParts = order.shippingAddress.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || order.shippingAddress.fullName;
      const lastName = nameParts.slice(1).join(" ");
      const placeholderEmail = `${order.shippingAddress.phone}@noemail.eliteSoul.local`;

      const payload: CreateForwardOrderPayload = {
        order_id: order.orderNumber,
        order_date: new Date(order.createdAt).toISOString().slice(0, 16).replace("T", " "),
        pickup_location: pickupLocation,
        billing_customer_name: firstName,
        billing_last_name: lastName || undefined,
        billing_address: order.shippingAddress.addressLine,
        billing_city: order.shippingAddress.city,
        billing_pincode: order.shippingAddress.pincode,
        billing_state: order.shippingAddress.state,
        billing_country: "India",
        billing_email: placeholderEmail,
        billing_phone: order.shippingAddress.phone,
        shipping_is_billing: true,
        order_items: order.items.map((item) => ({
          name: item.name,
          sku: item.productId,
          units: item.quantity,
          selling_price: item.price,
        })),
        payment_method: isCod ? "COD" : "Prepaid",
        sub_total: order.total,
        length: DEFAULT_PACKAGE_DIMENSIONS_CM.length,
        breadth: DEFAULT_PACKAGE_DIMENSIONS_CM.breadth,
        height: DEFAULT_PACKAGE_DIMENSIONS_CM.height,
        weight: weightKg,
      };

      const created = await createForwardOrder(payload);
      shiprocketOrderId = created.order_id;
      shiprocketShipmentId = created.shipment_id;

      order.shipment = {
        ...order.shipment,
        shiprocketOrderId,
        shiprocketShipmentId,
        packageWeightKg: weightKg,
      };
      await order.save();

      // Some Shiprocket accounts auto-assign an AWB right at creation.
      if (created.awb_code) {
        const now = new Date();
        order.shipment.awbCode = created.awb_code;
        order.shipment.courierId = created.courier_company_id ?? undefined;
        order.shipment.courierName = created.courier_name ?? undefined;
        order.shipment.trackingUrl = `https://shiprocket.co/tracking/${created.awb_code}`;
        order.shipment.shippedAt = now;
        order.shipment.currentStatus = "AWB Assigned";
        order.shipment.statusHistory = [
          ...(order.shipment.statusHistory ?? []),
          { status: "AWB Assigned", activity: `Auto-assigned to ${created.courier_name}`, statusDate: now },
        ];
        order.status = "In Transit";
        await order.save();

        return NextResponse.json({ shipment: order.shipment });
      }
    }

    // 3. Assign AWB with the chosen courier.
    const assigned = await assignAwb({
      shipmentId: shiprocketShipmentId!,
      courierId: chosenCourierId,
    });

    if (assigned.awb_assign_status !== 1) {
      return NextResponse.json({ error: "courier failed to accept the assignment" }, { status: 502 });
    }

    const { awb_code, courier_name, courier_company_id } = assigned.response.data;
    const now = new Date();

    order.shipment = {
      ...order.shipment,
      shiprocketOrderId,
      shiprocketShipmentId,
      awbCode: awb_code,
      courierId: courier_company_id,
      courierName: courier_name,
      trackingUrl: `https://shiprocket.co/tracking/${awb_code}`,
      shippedAt: now,
      currentStatus: "AWB Assigned",
      statusHistory: [
        ...(order.shipment?.statusHistory ?? []),
        { status: "AWB Assigned", activity: `Assigned to ${courier_name}`, statusDate: now },
      ],
    };
    order.status = "In Transit";
    await order.save();

    return NextResponse.json({ shipment: order.shipment });
  } catch (error) {
    console.error("Ship Order Error:", error);
    return NextResponse.json({ error: "failed to ship order" }, { status: 500 });
  }
}