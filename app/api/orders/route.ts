import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import Product from "@/app/models/Product";
import PromoCode from "@/app/models/Promocode";
import { computeDiscount } from "@/app/lib/promo";
import { computeDelivery } from "@/app/lib/pricing";
import {
  decrementStock,
  restoreStock,
} from "@/app/lib/inventory/stock";
import { sendOrderConfirmationEmail } from "@/app/lib/email/send";

// ─────────────────────────────────────────────────────────────
// GET /api/orders?userId=xxxxx
// ─────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "userId is required",
        },
        { status: 400 }
      );
    }

    console.log("Fetching all orders for user:", userId);

    const orders = await Order.find({ userId }).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Fetch Orders Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/orders
// ─────────────────────────────────────────────────────────────

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
    const promoCode: string | undefined =
      body.promoCode;

    const shippingAddress = body.shippingAddress;

    const userId: string | undefined =
      body.userId;

    // ─────────────────────────────────────────────
    // Validate cart
    // ─────────────────────────────────────────────

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "cart is empty",
        },
        { status: 400 }
      );
    }

    // ─────────────────────────────────────────────
    // Validate shipping address
    // ─────────────────────────────────────────────

    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.phone ||
      !shippingAddress?.email ||
      !shippingAddress?.addressLine ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !shippingAddress?.pincode
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "shipping address is incomplete",
        },
        { status: 400 }
      );
    }

    // ─────────────────────────────────────────────
    // Get products
    // ─────────────────────────────────────────────

    const products = await Product.find({
      _id: {
        $in: items.map(
          (item) => item.productId
        ),
      },
    });

    const productMap = new Map(
      products.map((product) => [
        String(product._id),
        product,
      ])
    );

    // ─────────────────────────────────────────────
    // Build order items
    // ─────────────────────────────────────────────

    let subtotal = 0;

    const orderItems = items.map((item) => {
      const product = productMap.get(
        item.productId
      );

      if (!product) {
        throw new Error(
          `PRODUCT_NOT_FOUND:${item.productId}`
        );
      }

      subtotal +=
        product.price * item.quantity;

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

    // ─────────────────────────────────────────────
    // Delivery
    // ─────────────────────────────────────────────

    const delivery =
      computeDelivery(subtotal);

    // ─────────────────────────────────────────────
    // Decrease stock
    // ─────────────────────────────────────────────

    const stockItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    const stockResult =
      await decrementStock(
        stockItems,
        {
          reason: "order-created",
        }
      );

    if (!stockResult.ok) {
      const failedProduct =
        productMap.get(
          stockResult.failedProductId
        );

      return NextResponse.json(
        {
          success: false,
          message: `${
            failedProduct?.name ?? "an item"
          } is out of stock`,
        },
        { status: 400 }
      );
    }

    // ─────────────────────────────────────────────
    // Promo code
    // ─────────────────────────────────────────────

    let discount = 0;

    let reservedPromoCode:
      | string
      | null = null;

    if (promoCode) {
      const reserved =
        await PromoCode.reserve(
          promoCode,
          subtotal
        );

      if (!reserved) {
        await restoreStock(
          stockItems,
          {
            reason: "rollback",
          }
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "coupon is no longer valid",
          },
          { status: 400 }
        );
      }

      discount = computeDiscount(
        reserved.discountType,
        reserved.discountValue,
        subtotal
      );

      reservedPromoCode =
        reserved.code;
    }

    // ─────────────────────────────────────────────
    // Total
    // ─────────────────────────────────────────────

    const total = Math.max(
      subtotal +
        delivery -
        discount,
      0
    );

    // ─────────────────────────────────────────────
    // Create order
    // ─────────────────────────────────────────────

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

        promoCode:
          reservedPromoCode,

        discount,

        total,
      });
    } catch (error) {
      if (reservedPromoCode) {
        await PromoCode.release(
          reservedPromoCode
        );
      }

      await restoreStock(
        stockItems,
        {
          reason: "rollback",
        }
      );

      throw error;
    }

    console.log(
      "Order created:",
      order
    );

    // ─────────────────────────────────────────────
    // Send confirmation email
    // ─────────────────────────────────────────────

    await sendOrderConfirmationEmail(
      order
    );

    // ─────────────────────────────────────────────
    // Response
    // ─────────────────────────────────────────────

    return NextResponse.json(
      {
        success: true,
        data: order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create Order Error:",
      error
    );

    if (
      error instanceof Error &&
      error.message.startsWith(
        "PRODUCT_NOT_FOUND:"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "one or more items in your cart are no longer available",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create order",
      },
      { status: 500 }
    );
  }
}