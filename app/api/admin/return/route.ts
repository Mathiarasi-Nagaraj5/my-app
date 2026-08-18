import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Return from "@/app/models/ReturnRequest";
import Order from "@/app/models/Order";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const returns = await Return.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json(returns);
  } catch (error) {
    console.error("GET /api/returns error:", error);
    return NextResponse.json({ error: "failed to fetch returns" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { orderId, userId, reason, note } = await request.json();

    if (!orderId || !reason) {
      return NextResponse.json(
        { error: "orderId and reason are required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "order not found" }, { status: 404 });
    }

    // only delivered orders can be returned
    if (order.status !== "delivered") {
      return NextResponse.json(
        { error: "only delivered orders are eligible for return" },
        { status: 400 }
      );
    }

    // prevent duplicate return requests on the same order
    const existing = await Return.findOne({ orderId });
    if (existing) {
      return NextResponse.json(
        { error: "a return has already been requested for this order" },
        { status: 409 }
      );
    }

    const returnRequest = await Return.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId,
      customerName: order.shippingAddress?.fullName ?? "unknown",
      reason,
      note,
      amount: order.total,
      paymentMethod: order.paymentMethod,
    });

    return NextResponse.json(returnRequest, { status: 201 });
  } catch (error) {
    console.error("POST /api/returns error:", error);
    return NextResponse.json({ error: "failed to submit return request" }, { status: 500 });
  }
}