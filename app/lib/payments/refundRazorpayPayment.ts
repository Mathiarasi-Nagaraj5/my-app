import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function refundRazorpayPayment(paymentId: string, amountRupees: number) {
  return razorpay.payments.refund(paymentId, {
    amount: Math.round(amountRupees * 100),
  });
}