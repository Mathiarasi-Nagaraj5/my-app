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

// Splits a comma-separated string like "S, M, L, XL" into a clean array
// ["S", "M", "L", "XL"]. Passing the raw string straight to Mongoose for a
// [String] field is dangerous — strings are iterable, so Mongoose's array
// cast will happily split it character-by-character instead of throwing,
// silently corrupting the data (e.g. sizes becomes ["S", ",", " ", "M", ...]).
// Also safely handles the case where the value already arrives as an array.
function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    if (!body.name)
      return ApiResponse.error("Product name is required", 400);

    if (!body.slug)
      return ApiResponse.error("Slug is required", 400);

    if (!body.category)
      return ApiResponse.error("Category is required", 400);

    if (!body.price)
      return ApiResponse.error("Price is required", 400);

    const slugExists = await Product.findOne({
      slug: body.slug,
    });

    if (slugExists)
      return ApiResponse.error(
        "Slug already exists",
        409
      );

    // Build the document explicitly instead of passing `body` straight
    // through to Product.create(). This guarantees every field lands in
    // the shape the schema expects — numbers are actually numbers, and
    // comma-separated strings from the form become real arrays — rather
    // than relying on Mongoose's implicit (and sometimes silently wrong)
    // casting behavior.
    const productData = {
      name: body.name,
      slug: body.slug,
      category: toStringArray(body.category),
      price: Number(body.price),
      originalPrice:
        body.originalPrice !== undefined && body.originalPrice !== null && body.originalPrice !== ""
          ? Number(body.originalPrice)
          : undefined,
      stock: body.stock !== undefined && body.stock !== null && body.stock !== ""
        ? Number(body.stock)
        : 0,
      imageUrls: Array.isArray(body.imageUrls) ? body.imageUrls : [],
      isBestseller: Boolean(body.isBestseller),
      sizes: toStringArray(body.sizes),
      colors: toStringArray(body.colors),
      description: body.description,
    };

    const product = await Product.create(productData);

    return ApiResponse.success(
      product,
      "Product created successfully",
      201
    );
  } catch (error) {
    console.error(error);

    // Surface real Mongoose validation errors (e.g. "stock must be at
    // least 1", "A product must have between 1 and 5 imageUrls") instead
    // of a generic message — these are exactly the kind of bugs that are
    // otherwise invisible from the client.
    if (error instanceof Error && error.name === "ValidationError") {
      return ApiResponse.error(error.message, 400);
    }

    return ApiResponse.error(
      "Unable to create product"
    );
  }
}