import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import PromoCode from "@/app/models/Promocode";
import { restoreStock } from "@/app/lib/inventory/stock";

const STALE_AFTER_MS = 15 * 60 * 1000; // 15 minutes

// Call this on a schedule (Vercel Cron, GitHub Action, etc.) — releases
// promo reservations and restores stock for checkouts abandoned mid-payment.
export async function POST(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });
  }

  await connectDB();

  const cutoff = new Date(Date.now() - STALE_AFTER_MS);
  const staleOrders = await Order.find({
    paymentStatus: "PENDING",
    paymentMethod: { $ne: "cod" }, // COD orders stay PENDING until delivery — not stale
    createdAt: { $lt: cutoff },
  });

  let released = 0;
  for (const order of staleOrders) {
    if (order.promoCode) await PromoCode.release(order.promoCode);
    await restoreStock(
      order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      { reason: "rollback", orderId: String(order._id) }
    );
    order.paymentStatus = "FAILED";
    await order.save();
    released++;
  }

  return NextResponse.json({ success: true, expiredCount: released });
}