// File: app/api/reviews/admin/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Review from "@/app/models/Review";
import { requireAdmin } from "@/app/lib/auth/requireAdmin";

// POST /api/reviews/admin
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

    const review = await Review.create({
      productId,
      customerName,
      rating,
      comment: comment.trim(),
      images: Array.isArray(images) ? images.slice(0, 3) : [],
      isVisible: isVisible ?? true,
      source: "admin",
      userId: "admin", // no real customer/order behind an admin-added review
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (err) {
    console.error("POST /api/reviews/admin error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create review" },
      { status: 500 }
    );
  }
}