import Razorpay from "razorpay";
import { NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount } = body;

    // Validate amount
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid amount",
        },
        { status: 400 }
      );
    }

    const options = {
      amount: Math.round(Number(amount) * 100), // Convert ₹ to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: true,
    };

    const order = await razorpay.orders.create(options);
console.log("Razorpay Order Created:", order);
    return NextResponse.json({
      success: true,
      order,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
      },
      { status: 500 }
    );
  }
}