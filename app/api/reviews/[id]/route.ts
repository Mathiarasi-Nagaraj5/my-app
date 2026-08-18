import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Review from "@/app/models/Review";
import Order from "@/app/models/Order";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/reviews/:id
 *
 * Customer edits their own review (rating + comment).
 * Only the original reviewer can edit. Order must still be delivered.
 *
 * Body: { userId: string, rating?: number, comment?: string }
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();
    const { userId, rating, comment } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    // Only the original reviewer can edit
    if (review.userId?.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: "You are not authorised to edit this review" },
        { status: 403 }
      );
    }

    // Validate fields if provided
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
 *
 * Customer deletes their own review.
 * Body: { userId: string }
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    if (review.userId?.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: "You are not authorised to delete this review" },
        { status: 403 }
      );
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