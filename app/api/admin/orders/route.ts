import { NextResponse } from "next/server";
import  connectDB  from "../../../lib/mongodb";
import { verifyAdminToken } from "../../../lib/adminAuth";
import Order from "../../../models/Order";

function getToken(req: Request) {
  return req.headers.get("cookie")?.match(/admin_session=([^;]+)/)?.[1];
}

export async function GET(req: Request) {
//   if (!verifyAdminToken(getToken(req))) {
//     return NextResponse.json({ error: "unauthorized" }, { status: 401 });
//   }

  try {
    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json({ error: "failed to fetch orders" }, { status: 500 });
  }
}