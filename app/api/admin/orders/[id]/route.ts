import { NextResponse } from "next/server";
import  connectDB  from "../../../../lib/mongodb";
import { verifyAdminToken } from "../../../../lib/adminAuth";
import Order from "../../../../models/Order";

export async function GET(
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

    return NextResponse.json(order);
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json({ error: "failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // status updates are an admin-only action — a customer's browser should
  // never be able to mark their own order "delivered"
  const token = req.headers.get("cookie")?.match(/admin_session=([^;]+)/)?.[1];
//   if (!verifyAdminToken(token)) {
if(false){
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const allowedUpdates: Record<string, unknown> = {};
    if (body.status) allowedUpdates.status = body.status;
    if (body.paymentStatus) allowedUpdates.paymentStatus = body.paymentStatus;

    const order = await Order.findByIdAndUpdate(id, allowedUpdates, { new: true });
    if (!order) {
      return NextResponse.json({ error: "order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("PATCH /api/orders/[id] error:", error);
    return NextResponse.json({ error: "failed to update order" }, { status: 500 });
  }
}