import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { order_id, payment_id, signature } = await req.json();

    // Validate required fields
    if (!order_id || !payment_id || !signature) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${order_id}|${payment_id}`)
      .digest("hex");

    // Verify signature
    if (expectedSignature !== signature) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: "Invalid payment signature",
        },
        { status: 400 }
      );
    }

    // ✅ Payment is genuine
    // TODO:
    // 1. Find the order in MongoDB using order_id
    // 2. Mark it as PAID
    // 3. Save payment_id
    // 4. Save payment date
    

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);

    return NextResponse.json(
      {
        success: false,
        verified: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}