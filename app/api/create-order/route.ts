import Razorpay from "razorpay";
import { NextResponse } from "next/server";

// key_id is not secret — it's already public in the browser (used by
// checkout.js), so we reuse the same NEXT_PUBLIC_ variable here instead of
// requiring a second, easy-to-forget env var.
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "invalid amount" }, { status: 400 });
    }

    // TODO: for real production safety, don't trust `amount` from the
    // client at all — instead, recompute the total server-side from the
    // user's actual cart/session, so a tampered request can't pay less
    // than the real price.

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects paise, integers only
      currency: "INR",
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("create-order error:", error);
    return NextResponse.json(
      { error: "failed to create order" },
      { status: 500 }
    );
  }
}