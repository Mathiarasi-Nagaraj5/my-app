import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import ReturnRequest from "@/app/models/ReturnRequest";
import Order from "@/app/models/Order";
import { refundRazorpayPayment } from "@/app/lib/payments/refundRazorpayPayment";
import { createReturnOrder } from "@/app/lib/shiprocket/client";
import { DEFAULT_PACKAGE_DIMENSIONS_CM, computePackageWeightKg } from "@/app/lib/shiprocket/pricing";
import { sendReturnStatusEmail, sendRefundConfirmationEmail } from "@/app/lib/email/send";
import type { IOrder } from "@/app/models/Order";

interface Params {
  params: Promise<{ id: string }>;
}

async function scheduleReversePickup(order: IOrder) {
  const pickupLocationName = process.env.SHIPROCKET_PICKUP_LOCATION;
  const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE;
  if (!pickupLocationName || !pickupPincode) return { failedReason: "reverse pickup not configured" };

  try {
    const totalQuantity = order.items.reduce((sum, i) => sum + i.quantity, 0);
    const result = await createReturnOrder({
      order_id: `${order.orderNumber}-RET`,
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
    return { shiprocketOrderId: result.order_id, scheduledAt: new Date() };
  } catch (err) {
    console.error("Reverse pickup scheduling failed:", err);
    return { failedReason: err instanceof Error ? err.message : "unknown error" };
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { status, adminNote } = body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return NextResponse.json({ success: false, message: "status must be Accepted or Rejected" }, { status: 400 });
    }

    const returnRequest = await ReturnRequest.findById(id);
    if (!returnRequest) {
      return NextResponse.json({ success: false, message: "return request not found" }, { status: 404 });
    }
    if (returnRequest.status !== "Pending") {
      return NextResponse.json(
        { success: false, message: "this return request has already been resolved" },
        { status: 400 }
      );
    }

    const order = await Order.findById(returnRequest.orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "the underlying order no longer exists" }, { status: 404 });
    }

    returnRequest.status = status;
    returnRequest.adminNote = adminNote?.trim() || undefined;
    returnRequest.resolvedAt = new Date();

    if (status === "Rejected") {
      returnRequest.refundStatus = "NotApplicable";
      await returnRequest.save();
      await sendReturnStatusEmail(order, "Rejected", returnRequest.adminNote);
      return NextResponse.json({ success: true, data: returnRequest });
    }

    // status === "Accepted" from here on.
    order.status = "Returned";

    if (order.paymentStatus === "PAID" && order.razorpayPaymentId) {
      try {
        const refund = await refundRazorpayPayment(order.razorpayPaymentId, order.total);
        returnRequest.refundStatus = "Completed";
        returnRequest.refundMethod = "razorpay";
        returnRequest.refund = {
          razorpayRefundId: refund.id,
          amount: order.total,
          refundedAt: new Date(),
        };
        order.paymentStatus = "REFUNDED";
        order.refund = { razorpayRefundId: refund.id, amount: order.total, refundedAt: new Date() };
      } catch (refundErr) {
        console.error("Return refund failed:", refundErr);
        returnRequest.refundStatus = "Failed";
        returnRequest.refundMethod = "razorpay";
      }
    } else if (order.paymentStatus === "PAID" && order.paymentMethod === "cod") {
      returnRequest.refundStatus = "Pending";
      returnRequest.refundMethod = "manual";
    } else {
      returnRequest.refundStatus = "NotApplicable";
    }

    const reverseResult = await scheduleReversePickup(order);
    returnRequest.reverseShipment = reverseResult;

    await order.save();
    await returnRequest.save();

    await sendReturnStatusEmail(order, "Accepted", returnRequest.adminNote);
    if (returnRequest.refundStatus === "Completed") {
      await sendRefundConfirmationEmail(order, order.total);
    }

    return NextResponse.json({ success: true, data: returnRequest });
  } catch (error) {
    console.error("Update Return Error:", error);
    return NextResponse.json({ success: false, message: "failed to update return request" }, { status: 500 });
  }
}