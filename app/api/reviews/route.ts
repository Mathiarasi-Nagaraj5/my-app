// File: app/api/reviews/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Review from "@/app/models/Review";
import Order from "@/app/models/Order";

// GET /api/reviews                                -> all reviews, newest first (admin table)
// GET /api/reviews?orderId=..                      -> reviews for a single order (order detail page)
// GET /api/reviews?productId=..                    -> VISIBLE reviews for one product (public product page)
// GET /api/reviews?productId=..&includeHidden=true -> all reviews for one product, hidden included (admin panel)
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const productId = searchParams.get("productId");
    const includeHidden = searchParams.get("includeHidden") === "true";

    const filter: Record<string, unknown> = {};
    if (orderId) filter.orderId = orderId;
    if (productId) {
      filter.productId = productId;
      // Public product-page requests never see hidden reviews. Admin panel
      // passes includeHidden=true to see everything for that product.
      if (!includeHidden) filter.isVisible = { $ne: false };
    }

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .populate("orderId", "orderNumber");

    return NextResponse.json({ success: true, data: reviews });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST /api/reviews  (customer review, tied to a real delivered order)
// body: { orderId, productId, userId, customerName, rating, comment, images? }
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { orderId, productId, userId, customerName, rating, comment, images } = body;

    if (!orderId || !productId || !userId || !customerName || !rating || !comment) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (order.userId?.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: "You are not authorized to review this order" },
        { status: 403 }
      );
    }

    const normalizedStatus = order.status?.toLowerCase();
    if (normalizedStatus !== "delivered") {
      return NextResponse.json(
        { success: false, message: "You can only rate items after the order is delivered" },
        { status: 400 }
      );
    }

    const wasPurchased = order.items?.some(
      (item: { productId: { toString(): string } }) =>
        item.productId?.toString() === productId
    );
    if (!wasPurchased) {
      return NextResponse.json(
        { success: false, message: "This product was not part of the order" },
        { status: 400 }
      );
    }

    const review = await Review.create({
      orderId,
      productId,
      userId,
      customerName,
      rating,
      comment,
      images: Array.isArray(images) ? images.slice(0, 3) : [],
      source: "customer",
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        { success: false, message: "You've already reviewed this item" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to submit review" },
      { status: 500 }
    );
  }
}