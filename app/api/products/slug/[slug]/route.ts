import { NextRequest } from "next/server";

import connectDB from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import { ApiResponse } from "@/app/lib/api-response";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

// GET PRODUCT BY SLUG
export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    await connectDB();

    const { slug } = await params;

    if (!slug?.trim()) {
      return ApiResponse.error("Product slug is required", 400);
    }

    const product = await Product.findOne({ slug }).lean();

    if (!product) {
      return ApiResponse.error("Product not found", 404);
    }

    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .limit(4)
      .lean();

    return ApiResponse.success(
      {
        product,
        relatedProducts,
      },
      "Product fetched successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Unable to fetch product");
  }
}