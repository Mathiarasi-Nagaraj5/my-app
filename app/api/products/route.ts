import { NextRequest } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import { ApiResponse } from "@/app/lib/api-response";

// Accepts sizes/colors as either a real array (["S","M"]) or a
// comma-separated string ("S, M, L") — whatever the client sends — and
// always normalizes to a clean, trimmed, deduped array before saving.
// This is what fixes the size/color filter returning empty results: if the
// admin form (or any other caller) was ever sending "S, M, L, XL" as a
// literal string, this is where it gets converted correctly regardless.
function normalizeToArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return [...new Set(value.map((v) => String(v).trim()).filter(Boolean))];
  }
  if (typeof value === "string") {
    return [...new Set(value.split(",").map((v) => v.trim()).filter(Boolean))];
  }
  return [];
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const categories = searchParams.getAll("category");
    const bestseller = searchParams.get("bestseller");
    const sort = searchParams.get("sort");

    const filter: Record<string, unknown> = {};

    if (categories.length > 0) {
      filter.category = { $in: categories };
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

    return ApiResponse.success(products, "Products fetched successfully");
  } catch (error) {
    console.error(error);
    return ApiResponse.error("Unable to fetch products");
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    if (!body.name) return ApiResponse.error("Product name is required", 400);
    if (!body.slug) return ApiResponse.error("Slug is required", 400);
    if (!body.category) return ApiResponse.error("Category is required", 400);
    if (!body.price) return ApiResponse.error("Price is required", 400);

    const slugExists = await Product.findOne({ slug: body.slug });
    if (slugExists) return ApiResponse.error("Slug already exists", 409);

    const product = await Product.create({
      ...body,
      sizes: normalizeToArray(body.sizes),
      colors: normalizeToArray(body.colors),
    });

    return ApiResponse.success(product, "Product created successfully", 201);
  } catch (error) {
    console.error(error);
    return ApiResponse.error("Unable to create product");
  }
}