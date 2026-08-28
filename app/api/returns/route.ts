import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import ReturnRequest from "@/app/models/ReturnRequest";
import { isReturnEligible, RETURN_REASONS } from "@/app/lib/returns";
import { enforceRateLimit } from "@/app/lib/rateLimitResponse";
import { requireOwnerOrAdmin } from "@/app/lib/auth/requireOwnerorAdmin";
export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "returns-create", 5, 60 * 1000);
  if (limited) return limited;

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

    if (userId && order.userId && order.userId !== userId) {
      return NextResponse.json({ success: false, message: "this order does not belong to you" }, { status: 403 });
    }

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

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const userId = searchParams.get("userId") || '';
    const status = searchParams.get("status");

    if (!userId) {
   // Customer viewing their own returns — verify the session actually
      // belongs to this userId, not just trust the query param.
      const ownerCheck = await requireOwnerOrAdmin(userId);
      if (!ownerCheck.ok) {
        return NextResponse.json({ success: false, message: ownerCheck.message }, { status: ownerCheck.status });
      }
  }
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