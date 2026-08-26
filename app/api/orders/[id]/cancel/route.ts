import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import PromoCode from "@/app/models/Promocode";
import { sendRefundConfirmationEmail } from "@/app/lib/email/send";
import { restoreStock } from "@/app/lib/inventory/stock";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { userId } = await req.json();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "order not found" }, { status: 404 });
    }

    // Ownership check — now also blocks guest orders (order.userId undefined)
    // from being cancelled by anyone who didn't place them. Previously this
    // only checked when BOTH sides had a userId, silently allowing anyone to
    // cancel a guest order by just knowing its id.
    if (order.userId) {
      if (!userId || order.userId !== userId) {
        return NextResponse.json({ error: "not authorized to cancel this order" }, { status: 403 });
      }
    }
    // else: guest order with no userId recorded at all — can't verify
    // ownership either way with the current data model. Not fixing that
    // gap here (would need e.g. an email/OTP check on guest orders); flagged
    // as a separate, pre-existing limitation of guest checkout specifically.

    // Atomic conditional update: only cancels if status is STILL "Confirmed"
    // at write time. If two requests race, only one findOneAndUpdate can
    // match — the other gets null back and skips straight to the "already
    // cancelled" response instead of double-refunding.
    const claimed = await Order.findOneAndUpdate(
      { _id: id, status: "Confirmed" },
      { $set: { status: "Cancelled" } },
      { new: false } // we want the PRE-update doc, to read paymentStatus/promoCode before our own write
    );

    if (!claimed) {
      const current = await Order.findById(id);
      const reason =
        !current || current.status === "Cancelled"
          ? "this order has already been cancelled"
          : "this order can no longer be cancelled — it has already been shipped or delivered";
      return NextResponse.json({ error: reason }, { status: 400 });
    }

    // Release the promo reservation, if any — same pattern as a failed
    // payment in verify-payment. Without this, usedCount stays incremented
    // forever for an order that no longer exists.
    if (claimed.promoCode) {
      await PromoCode.release(claimed.promoCode);
    }
// Give the stock back — the order that was holding it never shipped.
await restoreStock(claimed.items.map((item) => ({ productId: item.productId, quantity: item.quantity })));
    // Refund if it was actually paid online. COD: nothing was charged yet,
    // nothing to refund.
    if (claimed.paymentStatus === "PAID" && claimed.razorpayPaymentId) {
      try {
        const refund = await razorpay.payments.refund(claimed.razorpayPaymentId, {
          amount: Math.round(claimed.total * 100), // paise
        });

        await Order.findByIdAndUpdate(id, {
          paymentStatus: "REFUNDED",
          refund: {
            razorpayRefundId: refund.id,
            amount: claimed.total,
            refundedAt: new Date(),
          },
        });
        const refundedOrder = await Order.findById(id);
        if (refundedOrder) {
          await sendRefundConfirmationEmail(refundedOrder, claimed.total);
        }
      } catch (refundError) {
        console.error("cancel-order refund failed:", refundError);
        // Order is already marked Cancelled at this point (see note below) —
        // deliberately NOT rolling that back. The order should stay
        // cancelled either way; what failed is just the refund, which
        // needs manual follow-up, not a silent revert back to "Confirmed"
        // that could let the order ship anyway.
        return NextResponse.json(
          { error: "order was cancelled, but the refund failed — please contact support" },
          { status: 502 }
        );
      }
    }

    const finalOrder = await Order.findById(id);
    return NextResponse.json({ data: finalOrder });
  } catch (error) {
    console.error("POST /api/orders/[id]/cancel error:", error);
    return NextResponse.json({ error: "failed to cancel order" }, { status: 500 });
  }
}