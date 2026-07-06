// app/api/verify-payment/route.ts
import crypto from "crypto";

export async function POST(req: Request) {
  const { order_id, payment_id, signature } = await req.json();
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${order_id}|${payment_id}`)
    .digest("hex");

  if (expected === signature) {
    // mark order as paid in your DB, only now
  }
}