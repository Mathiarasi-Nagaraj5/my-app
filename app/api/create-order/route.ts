import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import Order from "@/app/models/Order";
import PromoCode from "@/app/models/Promocode";
import { computeDiscount } from "@/app/lib/promo";
import { computeDelivery } from "@/app/lib/pricing";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

interface CartItemInput {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const items: CartItemInput[] = body.items;
    const promoCode: string | undefined = body.promoCode;
    const shippingAddress = body.shippingAddress;
    const userId: string | undefined = body.userId;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "cart is empty" }, { status: 400 });
    }
    for (const item of items) {
      if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json({ success: false, message: "invalid cart item" }, { status: 400 });
      }
    }
    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.phone ||
      !shippingAddress?.addressLine ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !shippingAddress?.pincode
    ) {
      return NextResponse.json({ success: false, message: "shipping address is incomplete" }, { status: 400 });
    }

    // Re-price and snapshot every item server-side from Product — never
    // trust client-sent price/name/slug/imageUrls, only productId/quantity/size/color.
    const products = await Product.find({ _id: { $in: items.map((i) => i.productId) } });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`PRODUCT_NOT_FOUND:${item.productId}`);
      if (product.stock < item.quantity) throw new Error(`OUT_OF_STOCK:${product.name}`);
      subtotal += product.price * item.quantity;
      return {
        productId: String(product._id),
        slug: product.slug,
        name: product.name,
        imageUrls: product.imageUrls,
        price: product.price, // snapshot at order time
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      };
    });

    const delivery = computeDelivery(subtotal);

    // Atomically reserve the promo, if any. Single conditional update is
    // what makes usedCount/maxUses actually enforceable under concurrency.
    let discount = 0;
    let reservedPromoCode: string | null = null;

    if (promoCode) {
      const reserved = await PromoCode.reserve(promoCode, subtotal);
      if (!reserved) {
        const promoDoc = await PromoCode.findOne({ code: promoCode.trim().toUpperCase() });
        const message = !promoDoc
          ? "invalid coupon code"
          : !promoDoc.isActive
          ? "this coupon is no longer active"
          : promoDoc.expiresAt && promoDoc.expiresAt < new Date()
          ? "this coupon has expired"
          : promoDoc.maxUses > 0 && promoDoc.usedCount >= promoDoc.maxUses
          ? "this coupon has reached its usage limit"
          : `minimum order value for this coupon is ₹${promoDoc.minOrderValue.toLocaleString("en-IN")}`;
        return NextResponse.json({ success: false, message }, { status: 400 });
      }
      discount = computeDiscount(reserved.discountType, reserved.discountValue, subtotal);
      reservedPromoCode = reserved.code;
    }

    const total = Math.max(subtotal + delivery - discount, 0);

    if (total <= 0) {
      if (reservedPromoCode) await PromoCode.release(reservedPromoCode);
      return NextResponse.json({ success: false, message: "invalid order amount" }, { status: 400 });
    }

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(total * 100), // ₹ → paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        payment_capture: true,
      });
    } catch (err) {
      if (reservedPromoCode) await PromoCode.release(reservedPromoCode); // never spent, give it back
      throw err;
    }
    console.log("Razorpay Order Created:", razorpayOrder);

    const dbOrder = await Order.create({
      userId,
      items: orderItems,
      shippingAddress,
      paymentMethod: "upi",
      paymentStatus: "PENDING",
      subtotal,
      delivery,
      promoCode: reservedPromoCode,
      discount,
      total,
      razorpayOrderId: razorpayOrder.id,
    });

    return NextResponse.json({
      success: true,
      order: razorpayOrder,
      appOrderId: dbOrder._id,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    if (error instanceof Error && error.message.startsWith("PRODUCT_NOT_FOUND:")) {
      return NextResponse.json(
        { success: false, message: "one or more items in your cart are no longer available" },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message.startsWith("OUT_OF_STOCK:")) {
      return NextResponse.json(
        { success: false, message: `${error.message.replace("OUT_OF_STOCK:", "")} is out of stock` },
        { status: 400 }
      );
    }
console.error("Unexpected error in create-order:", error);
    return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 });
  }
}