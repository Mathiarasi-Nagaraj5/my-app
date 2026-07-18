import { NextRequest } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import { ApiResponse } from "@/app/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const bestseller = searchParams.get("bestseller");
    const sort = searchParams.get("sort");

    const filter: Record<string, unknown> = {};

    if (category) {
      filter.category = category;
    }

    if (bestseller === "true") {
      filter.isBestseller = true;
    }

    let query = Product.find(filter);

    switch (sort) {
      case "price-low":
        query = query.sort({ price: 1 });
        break;

      case "price-high":
        query = query.sort({ price: -1 });
        break;

      case "rating":
        query = query.sort({ rating: -1 });
        break;

      case "popular":
        query = query.sort({ reviewCount: -1 });
        break;

      default:
        query = query.sort({ createdAt: -1 });
    }

    const products = await query;

    return ApiResponse.success(
      products,
      "Products fetched successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Unable to fetch products"
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    if (!body.name)
      return ApiResponse.error("Product name is required",400);

    if (!body.slug)
      return ApiResponse.error("Slug is required",400);

    if (!body.category)
      return ApiResponse.error("Category is required",400);

    if (!body.price)
      return ApiResponse.error("Price is required",400);

    const slugExists = await Product.findOne({
      slug: body.slug,
    });

    if (slugExists)
      return ApiResponse.error(
        "Slug already exists",
        409
      );

    const product = await Product.create(body);

    return ApiResponse.success(
      product,
      "Product created successfully",
      201
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Unable to create product"
    );
  }
}