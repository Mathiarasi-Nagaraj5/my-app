// File: app/api/admin/products/[id]/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import Review from "@/app/models/Review";
// import { verifyAdminToken } from "@/app/lib/adminAuth";

// function getToken(req: Request) {
//   return req.headers.get("cookie")?.match(/admin_session=([^;]+)/)?.[1];
// }

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/admin/products/:id
 *
 * Deletes a product and any reviews attached to it (a review with no
 * product left to belong to is just clutter in the reviews table).
 *
 * Response 200: { data: null }
 * Response 400: invalid id
 * Response 404: product not found
 * Response 500: server error
 */
export async function DELETE(req: Request, { params }: Params) {
  // Uncomment when auth is ready:
  // if (!verifyAdminToken(getToken(req))) {
  //   return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  // }

  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Clean up orphaned reviews for this product. Not wrapped in a
    // transaction — if this step fails the product delete has already
    // committed, so we swallow the error rather than fail the whole
    // request over some leftover review rows.
    try {
      await Review.deleteMany({ productId: id });
    } catch (cleanupError) {
      console.error(`Failed to clean up reviews for deleted product ${id}:`, cleanupError);
    }

    return NextResponse.json({ data: null }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}