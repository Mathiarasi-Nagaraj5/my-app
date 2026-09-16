// File: app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Review from "@/app/models/Review";

// ⚠️ SECURITY TODO: same as /api/reviews/admin/route.ts — swap this for your
// real admin-session verification helper. As written this import will not
// resolve. Without a real check, the isAdmin branches below trust a plain
// boolean from the request body, which is NOT safe to ship.
import { requireAdmin } from "@/app/lib/auth/requireAdmin";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/reviews/:id
 *
 * Two modes:
 *  - Customer editing their own review: body { userId, rating?, comment?, images? }
 *  - Admin moderating: body { isAdmin: true, isVisible?, rating?, comment?, images? }
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();
    const { userId, rating, comment, images, isVisible, isAdmin } = body;

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    if (isAdmin) {
      const admin = await requireAdmin();
      if (!admin) {
        return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });
      }
    } else {
      if (!userId) {
        return NextResponse.json(
          { success: false, message: "userId is required" },
          { status: 400 }
        );
      }
      if (review.userId?.toString() !== userId) {
        return NextResponse.json(
          { success: false, message: "You are not authorised to edit this review" },
          { status: 403 }
        );
      }
    }

    if (rating !== undefined) {
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return NextResponse.json(
          { success: false, message: "Rating must be between 1 and 5" },
          { status: 400 }
        );
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      if (typeof comment !== "string" || comment.trim().length < 5) {
        return NextResponse.json(
          { success: false, message: "Comment must be at least 5 characters" },
          { status: 400 }
        );
      }
      review.comment = comment.trim();
    }

    if (images !== undefined) {
      review.images = Array.isArray(images) ? images.slice(0, 3) : [];
    }

    // Only an admin request can flip visibility
    if (isAdmin && typeof isVisible === "boolean") {
      review.isVisible = isVisible;
    }

    await review.save();

    return NextResponse.json({ success: true, data: review });
  } catch (err) {
    console.error("PATCH /api/reviews/[id]:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update review" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/:id
 * body: { userId } for a customer deleting their own review, or { isAdmin: true } for admin
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();
    const { userId, isAdmin } = body;

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    if (isAdmin) {
      const admin = await requireAdmin();
      if (!admin) {
        return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });
      }
    } else {
      if (!userId) {
        return NextResponse.json(
          { success: false, message: "userId is required" },
          { status: 400 }
        );
      }
      if (review.userId?.toString() !== userId) {
        return NextResponse.json(
          { success: false, message: "You are not authorised to delete this review" },
          { status: 403 }
        );
      }
    }

    await review.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (err) {
    console.error("DELETE /api/reviews/[id]:", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete review" },
      { status: 500 }
    );
  }
}