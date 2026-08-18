import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import ReturnRequest from "@/app/models/ReturnRequest";
import { isReturnEligible, RETURN_REASONS } from "@/app/lib/returns";

// POST /api/returns — customer submits a return request for a delivered order
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { orderId, reason, otherReason, userId } = body;

    if (!orderId || !reason) {
      return NextResponse.json({ success: false, message: "orderId and reason are required" }, { status: 400 });
    }
    if (!RETURN_REASONS.includes(reason)) {
      return NextResponse.json({ success: false, message: "invalid return reason" }, { status: 400 });
    }
    if (reason === "Other" && !otherReason?.trim()) {
      return NextResponse.json({ success: false, message: "please describe your reason" }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "order not found" }, { status: 404 });
    }

    // Ownership check — only the order's own user can request a return for it.
    if (userId && order.userId && order.userId !== userId) {
      return NextResponse.json({ success: false, message: "this order does not belong to you" }, { status: 403 });
    }

    // Re-check eligibility server-side — the button being visible client-side
    // is not authorization; this is the real gate.
    const eligibility = isReturnEligible(order);
    if (!eligibility.eligible) {
      return NextResponse.json({ success: false, message: eligibility.reason }, { status: 400 });
    }

    const returnRequest = await ReturnRequest.create({
      orderId: String(order._id),
      orderNumber: order.orderNumber,
      userId: order.userId,
      reason,
      otherReason: reason === "Other" ? otherReason.trim() : undefined,
      status: "Pending",
    });

    return NextResponse.json({ success: true, data: returnRequest }, { status: 201 });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && (err as { code?: number }).code === 11000) {
      return NextResponse.json(
        { success: false, message: "a return request has already been submitted for this order" },
        { status: 409 }
      );
    }
    console.error("Create Return Error:", err);
    return NextResponse.json({ success: false, message: "failed to submit return request" }, { status: 500 });
  }
}

// GET /api/returns
//   ?orderId=xxx  -> single order's return, for the Return button/status badge
//   ?userId=xxx   -> a user's own return history
//   (no params)   -> ALL return requests — this is the admin table view.
//
// NOTE: this route has no authorization check. Anything hitting it without
// a userId gets every customer's return requests. Add admin-session
// verification here before this ships.
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};
    if (orderId) query.orderId = orderId;
    if (userId) query.userId = userId;
    if (status) query.status = status;

    const returns = await ReturnRequest.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: returns });
  } catch {
    return NextResponse.json({ success: false, message: "failed to fetch return requests" }, { status: 500 });
  }
}