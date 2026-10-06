// File: app/api/admin/reviews/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/lib/mongodb";
import Review from "@/app/models/Review";
import Product from "@/app/models/Product"; // adjust path if different
import { requireAdmin } from "@/app/lib/auth/requireAdmin";

// recalculates rating + reviewCount on the product from its visible reviews
async function syncProductRating(productId: string) {
  const pid = new mongoose.Types.ObjectId(productId);

  // $in covers productId stored as either ObjectId or string
  const [stats] = await Review.aggregate([
    {
      $match: {
        productId: { $in: [pid, String(productId)] },
        isVisible: true,
      },
    },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    rating: stats ? Math.round(stats.avg * 10) / 10 : 0,
    reviewCount: stats ? stats.count : 0,
  });
}

// POST /api/admin/reviews
// body: { productId, customerName, rating, comment, images?, isVisible? }
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { productId, customerName, rating, comment, images, isVisible } = body;

    if (!productId || !customerName || !rating || !comment) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, message: "Invalid productId" },
        { status: 400 }
      );
    }

    const review = await Review.create({
      productId,
      customerName,
      rating,
      comment: comment.trim(),
      images: Array.isArray(images) ? images.slice(0, 5) : [],
      isVisible: isVisible ?? true,
      source: "admin",
      userId: "admin", // no real customer/order behind an admin-added review
    });

    // update the product's rating + review count right after saving
    await syncProductRating(String(productId));

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/reviews error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create review" },
      { status: 500 }
    );
  }
}