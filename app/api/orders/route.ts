import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import Product from "@/app/models/Product";
import PromoCode from "@/app/models/Promocode";
import { computeDiscount } from "@/app/lib/promo";
import { computeDelivery } from "@/app/lib/pricing";

export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: orders });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch orders" }, { status: 500 });
  }
}

interface CartItemInput {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

// COD only. Razorpay orders are created in /api/create-order and finalized
// in /api/verify-payment — this endpoint never accepts paymentStatus,
// subtotal, delivery, or total from the client, so it can't be used to
// fabricate a PAID order.
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
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      };
    });

    const delivery = computeDelivery(subtotal);

    let discount = 0;
    let reservedPromoCode: string | null = null;
    if (promoCode) {
      const reserved = await PromoCode.reserve(promoCode, subtotal);
      if (!reserved) {
        return NextResponse.json({ success: false, message: "coupon is no longer valid" }, { status: 400 });
      }
      discount = computeDiscount(reserved.discountType, reserved.discountValue, subtotal);
      reservedPromoCode = reserved.code;
    }

    const total = Math.max(subtotal + delivery - discount, 0);

    const order = await Order.create({
      userId,
      items: orderItems,
      shippingAddress,
      paymentMethod: "cod",
      paymentStatus: "PENDING", // stays pending until delivery/collection
      subtotal,
      delivery,
      promoCode: reservedPromoCode,
      discount,
      total,
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
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

    return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 });
  }
}