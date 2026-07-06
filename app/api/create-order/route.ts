import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { order_id, payment_id, signature } = await req.json();

    if (!order_id || !payment_id || !signature) {
      return NextResponse.json(
        { verified: false, error: "missing required fields" },
        { status: 400 }
      );
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${order_id}|${payment_id}`)
      .digest("hex");

    const verified = expected === signature;

    if (verified) {
      // TODO: mark the order as "paid" in your database here, using
      // order_id / payment_id to look it up. Only trust payment as
      // genuine once this signature check passes.
      return NextResponse.json({ verified: true });
    }

    return NextResponse.json(
      { verified: false, error: "signature mismatch" },
      { status: 400 }
    );
  } catch (error) {
    console.error("verify-payment error:", error);
    return NextResponse.json(
      { verified: false, error: "verification failed" },
      { status: 500 }
    );
  }
}