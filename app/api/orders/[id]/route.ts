import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import Order from "../../../models/Order";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order",
      },
      { status: 500 }
    );
  }
}

// Admin-only order status/shipment updates. This intentionally does NOT
// accept the full request body — only a fixed allow-list of fields an
// admin action is meant to change. Payment fields (paymentStatus, total,
// subtotal, discount, razorpayPaymentId) and status: "Returned" are
// excluded on purpose:
//   - payment fields are only ever set by /api/verify-payment after a
//     real Razorpay signature check
//   - "Returned" is only ever set by /api/returns/[id] on admin Accept,
//     after a real ReturnRequest exists
// Without this allow-list, any client could PATCH paymentStatus/total
// directly and mark an unpaid order as paid.
//
// NOTE: this route also has no admin-session check at all yet — anyone
// who has an order id can currently call this. Add auth before this ships.
const ALLOWED_STATUSES = ["Confirmed", "In Transit", "Delivered", "Cancelled"] as const;

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
        return NextResponse.json(
          { success: false, message: "invalid status" },
          { status: 400 }
        );
      }
      update.status = body.status;
      if (body.status === "Delivered") {
        update.deliveredAt = new Date();
        // COD cash is collected at the moment of delivery — mark it paid here
        // rather than never, which was the previous (broken) behavior.
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
      return NextResponse.json(
        { success: false, message: "no valid fields to update" },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update order",
      },
      { status: 500 }
    );
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

    return NextResponse.json({
      success: true,
      message: "Order deleted",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete order",
      },
      { status: 500 }
    );
  }
}