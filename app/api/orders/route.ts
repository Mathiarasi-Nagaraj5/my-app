import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import Product from "@/app/models/Product";
import PromoCode from "@/app/models/Promocode";
import { computeDiscount } from "@/app/lib/promo";
import { computeDelivery } from "@/app/lib/pricing";
import { decrementStock, restoreStock } from "@/app/lib/inventory/stock";
import { sendOrderConfirmationEmail } from "@/app/lib/email/send";

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
      !shippingAddress?.email ||
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

    const stockItems = items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
    const stockResult = await decrementStock(stockItems, { reason: "order-created" });
    if (!stockResult.ok) {
      const failedProduct = productMap.get(stockResult.failedProductId);
      return NextResponse.json(
        { success: false, message: `${failedProduct?.name ?? "an item"} is out of stock` },
        { status: 400 }
      );
    }

    let discount = 0;
    let reservedPromoCode: string | null = null;
    if (promoCode) {
      const reserved = await PromoCode.reserve(promoCode, subtotal);
      if (!reserved) {
        await restoreStock(stockItems, { reason: "rollback" });
        return NextResponse.json({ success: false, message: "coupon is no longer valid" }, { status: 400 });
      }
      discount = computeDiscount(reserved.discountType, reserved.discountValue, subtotal);
      reservedPromoCode = reserved.code;
    }

    const total = Math.max(subtotal + delivery - discount, 0);

    let order;
    try {
      order = await Order.create({
        userId,
        items: orderItems,
        shippingAddress,
        paymentMethod: "cod",
        paymentStatus: "PENDING",
        subtotal,
        delivery,
        promoCode: reservedPromoCode,
        discount,
        total,
      });
    } catch (err) {
      if (reservedPromoCode) await PromoCode.release(reservedPromoCode);
      await restoreStock(stockItems, { reason: "rollback" });
      throw err;
    }
console.log("Order created:", order);
    await sendOrderConfirmationEmail(order);

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error("Create Order Error:", error);

    if (error instanceof Error && error.message.startsWith("PRODUCT_NOT_FOUND:")) {
      return NextResponse.json(
        { success: false, message: "one or more items in your cart are no longer available" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 });
  }
}