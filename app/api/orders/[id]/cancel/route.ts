import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import PromoCode from "@/app/models/Promocode";
import { restoreStock } from "@/app/lib/inventory/stock";
import { refundRazorpayPayment } from "@/app/lib/payments/refundRazorpayPayment";
import { sendRefundConfirmationEmail } from "@/app/lib/email/send";

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

    if (order.userId) {
      if (!userId || order.userId !== userId) {
        return NextResponse.json({ error: "not authorized to cancel this order" }, { status: 403 });
      }
    }

    const claimed = await Order.findOneAndUpdate(
      { _id: id, status: "Confirmed" },
      { $set: { status: "Cancelled" } },
      { new: false }
    );

    if (!claimed) {
      const current = await Order.findById(id);
      const reason =
        !current || current.status === "Cancelled"
          ? "this order has already been cancelled"
          : "this order can no longer be cancelled — it has already been shipped or delivered";
      return NextResponse.json({ error: reason }, { status: 400 });
    }

    if (claimed.promoCode) {
      await PromoCode.release(claimed.promoCode);
    }

    await restoreStock(
      claimed.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      { reason: "cancellation-restore", orderId: id }
    );

    if (claimed.paymentStatus === "PAID" && claimed.razorpayPaymentId) {
      try {
        const refund = await refundRazorpayPayment(claimed.razorpayPaymentId, claimed.total);

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